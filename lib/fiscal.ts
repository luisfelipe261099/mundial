import crypto from "node:crypto";
import forge from "node-forge";
import { prisma } from "@/lib/prisma";

// Utilitários da NFS-e Nacional: guarda do certificado A1 e leitura da
// configuração. A emissão em si fica na server action (app/oficina/fiscal).
//
// O .pfx e a senha são cifrados com AES-256-GCM antes de ir pro banco. A chave
// deriva do SESSION_SECRET — se ele mudar, o certificado precisa ser enviado
// de novo pela tela (a mensagem de erro da descriptografia orienta isso).

function chave(): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET não definida.");
  return crypto.createHash("sha256").update(`${secret}:fiscal-v1`).digest();
}

export function cifrar(dados: Buffer): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", chave(), iv);
  const enc = Buffer.concat([cipher.update(dados), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), enc]).toString("base64");
}

export function decifrar(blob: string): Buffer {
  const raw = Buffer.from(blob, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", chave(), iv);
  decipher.setAuthTag(tag);
  try {
    return Buffer.concat([decipher.update(enc), decipher.final()]);
  } catch {
    throw new Error(
      "Não consegui decifrar o certificado — se a SESSION_SECRET mudou, envie o .pfx de novo na tela de Nota fiscal."
    );
  }
}

export type InfoCertificado = {
  subject: string;
  cnpj: string | null;
  expiresAt: Date;
  vencido: boolean;
};

// Valida senha + extrai titular e validade do .pfx. Lança erro legível se a
// senha estiver errada ou o arquivo não for um PKCS#12 válido.
export function lerCertificado(pfx: Buffer, senha: string): InfoCertificado {
  let p12: forge.pkcs12.Pkcs12Pfx;
  try {
    const asn1 = forge.asn1.fromDer(forge.util.createBuffer(pfx.toString("binary")));
    p12 = forge.pkcs12.pkcs12FromAsn1(asn1, senha);
  } catch {
    throw new Error("Senha incorreta ou arquivo .pfx inválido.");
  }
  const bags = p12.getBags({ bagType: forge.pki.oids.certBag })[forge.pki.oids.certBag] ?? [];
  const cert = bags.map((b) => b.cert).find((c): c is forge.pki.Certificate => !!c);
  if (!cert) throw new Error("O arquivo não contém um certificado.");

  const cn = cert.subject.getField("CN")?.value ?? "—";
  // e-CNPJ traz "RAZAO SOCIAL:12345678000195" no CN
  const cnpj = /:(\d{14})$/.exec(cn)?.[1] ?? null;
  const expiresAt = cert.validity.notAfter;
  return { subject: cn, cnpj, expiresAt, vencido: expiresAt.getTime() < Date.now() };
}

export async function getFiscalConfig() {
  return prisma.fiscalConfig.findUnique({ where: { id: "default" } });
}

export type FiscalConfigView = {
  temCertificado: boolean;
  certSubject: string;
  certExpiresAt: string; // dd/mm/aaaa ou ""
  certVencido: boolean;
  cnpj: string;
  inscricaoMunicipal: string;
  serie: string;
  proximoNumero: number;
  cTribNac: string;
  aliquotaIss: string;
  totTribPerc: string;
  opSimpNac: string;
  regApTribSN: string;
  regEspTrib: string;
  ambiente: string;
};

// Versão segura para a UI — nunca inclui o certificado nem a senha.
export async function getFiscalConfigView(): Promise<FiscalConfigView> {
  const c = await getFiscalConfig();
  return {
    temCertificado: !!c?.certPfx,
    certSubject: c?.certSubject ?? "",
    certExpiresAt: c?.certExpiresAt ? c.certExpiresAt.toLocaleDateString("pt-BR") : "",
    certVencido: c?.certExpiresAt ? c.certExpiresAt.getTime() < Date.now() : false,
    cnpj: c?.cnpj ?? "",
    inscricaoMunicipal: c?.inscricaoMunicipal ?? "",
    serie: c?.serie ?? "1601",
    proximoNumero: c?.proximoNumero ?? 1,
    cTribNac: c?.cTribNac ?? "140101",
    aliquotaIss: c?.aliquotaIss ?? "",
    totTribPerc: c?.totTribPerc ?? "6.00",
    opSimpNac: c?.opSimpNac ?? "3",
    regApTribSN: c?.regApTribSN ?? "1",
    regEspTrib: c?.regEspTrib ?? "0",
    ambiente: c?.ambiente ?? "restrita",
  };
}

export async function getNotasDaOS(serviceOrderId: string) {
  const notas = await prisma.fiscalNota.findMany({
    where: { serviceOrderId },
    orderBy: { createdAt: "desc" },
  });
  return notas.map((n) => ({
    id: n.id,
    chaveAcesso: n.chaveAcesso,
    numero: n.numero,
    serie: n.serie,
    ambiente: n.ambiente,
    status: n.status,
    valor: n.valor,
    erro: n.erro,
    criadaEm: n.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
  }));
}
export type NotaFiscalView = Awaited<ReturnType<typeof getNotasDaOS>>[number];

// Data/hora no fuso da oficina, no formato que a DPS espera.
export function agoraCuritiba(): { dhEmi: string; dCompet: string } {
  const agora = new Date();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(agora).map((x) => [x.type, x.value]));
  const dCompet = `${p.year}-${p.month}-${p.day}`;
  // Curitiba é UTC-3 o ano inteiro (sem horário de verão desde 2019)
  return { dhEmi: `${dCompet}T${p.hour}:${p.minute}:${p.second}-03:00`, dCompet };
}
