"use server";

import { revalidatePath } from "next/cache";
import {
  assertValidDpsJsonRequest,
  buildDpsFromJson,
  signDps,
  verifyDps,
  transmitirNotaPreparada,
  loadPfxFromBuffer,
  resolveSefinBaseUrl,
  EmitirNotaError,
  type DpsJsonRequest,
} from "@useinvio/nfse-sdk";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { cifrar, decifrar, lerCertificado, getFiscalConfig, agoraCuritiba } from "@/lib/fiscal";

// NFS-e Nacional (Sefin). Curitiba está 100% no padrão nacional desde
// 01/01/2026, então a emissão da nota de SERVIÇO sai daqui, de graça, com o
// e-CNPJ A1 da oficina. Peças ficam fora por lei (item 14.01 da LC 116:
// "exceto peças e partes empregadas, que ficam sujeitas ao ICMS").

const CURITIBA = "4106902";

type R = { ok: boolean; error?: string };

function msg(e: unknown): string {
  return e instanceof Error ? e.message : "Erro inesperado.";
}

// Grava (ou troca) o certificado A1. Valida a senha abrindo o .pfx antes de
// salvar; guarda tudo cifrado e devolve só metadados.
export async function salvarCertificado(formData: FormData): Promise<R> {
  await requireAdmin();
  const arquivo = formData.get("pfx");
  const senha = String(formData.get("senha") ?? "");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { ok: false, error: "Selecione o arquivo .pfx do certificado." };
  }
  if (arquivo.size > 50 * 1024) {
    return { ok: false, error: "Arquivo grande demais para um .pfx — confira se é o certificado A1." };
  }
  if (!senha) return { ok: false, error: "Informe a senha do certificado." };

  const pfx = Buffer.from(await arquivo.arrayBuffer());
  let info;
  try {
    info = lerCertificado(pfx, senha);
  } catch (e) {
    return { ok: false, error: msg(e) };
  }
  if (info.vencido) {
    return {
      ok: false,
      error: `Este certificado venceu em ${info.expiresAt.toLocaleDateString("pt-BR")} — renove antes de usar.`,
    };
  }

  await prisma.fiscalConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      certPfx: cifrar(pfx),
      certPassword: cifrar(Buffer.from(senha, "utf8")),
      certSubject: info.subject,
      certExpiresAt: info.expiresAt,
      cnpj: info.cnpj,
    },
    update: {
      certPfx: cifrar(pfx),
      certPassword: cifrar(Buffer.from(senha, "utf8")),
      certSubject: info.subject,
      certExpiresAt: info.expiresAt,
      ...(info.cnpj ? { cnpj: info.cnpj } : {}),
    },
  });
  revalidatePath("/oficina/fiscal");
  return { ok: true };
}

export async function removerCertificado(): Promise<R> {
  await requireAdmin();
  await prisma.fiscalConfig.updateMany({
    where: { id: "default" },
    data: { certPfx: null, certPassword: null, certSubject: null, certExpiresAt: null },
  });
  revalidatePath("/oficina/fiscal");
  return { ok: true };
}

export async function salvarEmitente(input: {
  cnpj: string;
  inscricaoMunicipal: string;
  serie: string;
  proximoNumero: string;
  cTribNac: string;
  aliquotaIss: string;
  totTribPerc: string;
  opSimpNac: string;
  regApTribSN: string;
  ambiente: string;
}): Promise<R> {
  await requireAdmin();
  const cnpj = input.cnpj.replace(/\D/g, "");
  if (cnpj.length !== 14) return { ok: false, error: "CNPJ deve ter 14 dígitos." };
  const serie = input.serie.trim();
  if (!serie) return { ok: false, error: "Informe a série da DPS." };
  const numero = Math.max(1, Math.trunc(Number(input.proximoNumero)) || 1);
  const cTribNac = input.cTribNac.replace(/\D/g, "");
  if (cTribNac.length !== 6) {
    return { ok: false, error: "Código de tributação nacional tem 6 dígitos (ex.: 140101)." };
  }
  const aliquota = input.aliquotaIss.trim().replace(",", ".");
  if (aliquota && !/^\d(\.\d{1,2})?$/.test(aliquota)) {
    return { ok: false, error: "Alíquota inválida — use algo como 5.00 (máx. 9.99), ou deixe vazio." };
  }
  const totTribPerc = input.totTribPerc.trim().replace(",", ".");
  if (totTribPerc && !/^\d{1,2}(\.\d{1,2})?$/.test(totTribPerc)) {
    return { ok: false, error: "Percentual de tributos inválido — use algo como 6.00." };
  }
  if (!["1", "2", "3"].includes(input.opSimpNac)) return { ok: false, error: "Regime inválido." };

  const dados = {
    cnpj,
    inscricaoMunicipal: input.inscricaoMunicipal.trim() || null,
    serie,
    proximoNumero: numero,
    cTribNac,
    aliquotaIss: aliquota || null,
    totTribPerc: totTribPerc || "6.00",
    opSimpNac: input.opSimpNac,
    regApTribSN: ["1", "2", "3"].includes(input.regApTribSN) ? input.regApTribSN : "1",
    ambiente: input.ambiente === "producao" ? "producao" : "restrita",
  };
  await prisma.fiscalConfig.upsert({
    where: { id: "default" },
    create: { id: "default", ...dados },
    update: dados,
  });
  revalidatePath("/oficina/fiscal");
  return { ok: true };
}

// Testa o mTLS contra a SEFIN: se a resposta chegar na camada HTTP (mesmo um
// 4xx), o certificado foi aceito na conexão. Falha de TLS = certificado ruim.
export async function testarConexao(): Promise<R & { detalhe?: string }> {
  await requireAdmin();
  const cfg = await getFiscalConfig();
  if (!cfg?.certPfx || !cfg.certPassword) {
    return { ok: false, error: "Envie o certificado primeiro." };
  }
  try {
    const senha = decifrar(cfg.certPassword).toString("utf8");
    const pfx = loadPfxFromBuffer(decifrar(cfg.certPfx), senha);
    const base = resolveSefinBaseUrl(cfg.ambiente === "producao" ? "producao" : "restrita");
    const url = new URL(`${base}/parametros_municipais/${CURITIBA}/convenio`);
    const https = await import("node:https");

    const status = await new Promise<number>((resolve, reject) => {
      const req = https.request(
        {
          hostname: url.hostname,
          path: url.pathname,
          method: "GET",
          pfx: pfx.pfxBuffer,
          passphrase: senha,
          timeout: 15000,
        },
        (res) => {
          res.resume();
          resolve(res.statusCode ?? 0);
        }
      );
      req.on("timeout", () => req.destroy(new Error("tempo esgotado (15s)")));
      req.on("error", reject);
      req.end();
    });

    return {
      ok: true,
      detalhe: `Conexão mTLS aceita pela SEFIN (${cfg.ambiente === "producao" ? "produção" : "produção restrita"} — HTTP ${status}).`,
    };
  } catch (e) {
    return { ok: false, error: `Falha na conexão: ${msg(e)}` };
  }
}

// Emite a NFS-e da MÃO DE OBRA de uma OS: soma só os itens do tipo "Serviço".
export async function emitirNfseOS(osId: string): Promise<R & { chaveAcesso?: string }> {
  await requireAdmin();
  const [cfg, os] = await Promise.all([
    getFiscalConfig(),
    prisma.serviceOrder.findUnique({ where: { id: osId }, include: { items: true, client: true } }),
  ]);
  if (!os) return { ok: false, error: "OS não encontrada." };
  if (!cfg?.certPfx || !cfg.certPassword) {
    return { ok: false, error: "Configure o certificado em Sistema → Nota fiscal antes de emitir." };
  }
  if (cfg.certExpiresAt && cfg.certExpiresAt.getTime() < Date.now()) {
    return { ok: false, error: "O certificado está vencido — renove e envie o novo na tela de Nota fiscal." };
  }
  if (!cfg.cnpj) return { ok: false, error: "Preencha o CNPJ do emitente na tela de Nota fiscal." };

  const servicos = os.items.filter((i) => i.type === "Serviço");
  const valor = servicos.reduce((s, i) => s + i.value * i.qty, 0);
  if (valor <= 0) {
    return { ok: false, error: "Esta OS não tem itens do tipo Serviço — a NFS-e cobre só a mão de obra." };
  }

  // O bloco formal de tomador exige endereço estruturado (CEP, código IBGE,
  // logradouro, número, bairro) que o cadastro de clientes não tem — a SEFIN
  // rejeita tomador sem endNac completo. Então a nota sai como consumidor não
  // identificado (permitido) e o cliente entra NOMEADO na descrição, com CPF
  // quando houver — aparece no PDF e identifica o serviço.
  const doc = (os.client?.cpf ?? "").replace(/\D/g, "");
  const linhaCliente = os.client
    ? `Cliente: ${os.client.name}${doc.length === 11 ? ` — CPF ${doc}` : doc.length === 14 ? ` — CNPJ ${doc}` : ""}`
    : os.clientName !== "—"
      ? `Cliente: ${os.clientName}`
      : "";

  const descricao = [
    `Serviços de manutenção veicular — OS ${os.id}`,
    linhaCliente,
    os.vehicleName !== "—" ? `Veículo: ${os.vehicleName}${os.plate ? ` placa ${os.plate}` : ""}` : "",
    ...servicos.map((s) => `- ${s.description}${s.qty > 1 ? ` (x${s.qty})` : ""}`),
  ]
    .filter(Boolean)
    .join("\n");

  // Reserva o número da DPS de forma atômica (evita duas emissões com o mesmo
  // nDPS em cliques simultâneos).
  const reservado = await prisma.fiscalConfig.update({
    where: { id: "default" },
    data: { proximoNumero: { increment: 1 } },
    select: { proximoNumero: true },
  });
  const nDPS = reservado.proximoNumero - 1;

  const ambiente = cfg.ambiente === "producao" ? ("producao" as const) : ("restrita" as const);
  const { dhEmi, dCompet } = agoraCuritiba();
  const simples = cfg.opSimpNac === "3";

  // A totalização de tributos (informativa, Lei 12.741) é um xs:choice que
  // muda por regime: Simples usa pTotTribSN, MEI usa indTotTrib=0, não
  // optante informa os três percentuais.
  const perc = cfg.totTribPerc || "6.00";
  const totTrib = simples
    ? { pTotTribSN: perc }
    : cfg.opSimpNac === "2"
      ? { indTotTrib: "0" }
      : { pTotTribFed: "0.00", pTotTribEst: "0.00", pTotTribMun: perc };


  const nota = {
    ambiente,
    prestador: {
      cnpj: cfg.cnpj,
      tpInsc: "2",
      cLocEmi: CURITIBA,
      serie: cfg.serie,
      opSimpNac: cfg.opSimpNac,
      ...(simples ? { regApTribSN: cfg.regApTribSN } : {}),
      regEspTrib: cfg.regEspTrib,
    },
    servico: {
      cTribNac: cfg.cTribNac,
      xDescServ: descricao,
      cLocPrestacao: CURITIBA,
    },
    emissao: {
      nDPS: String(nDPS),
      dhEmi,
      dCompet,
      valores: { vServ: `${valor}.00` },
      tributacaoMunicipal: {
        tribISSQN: "1", // operação tributável
        tpRetISSQN: "1", // ISS não retido pelo tomador
        ...(cfg.aliquotaIss && cfg.opSimpNac !== "1" ? { pAliq: cfg.aliquotaIss } : {}),
      },
      totTrib,
    },
  };

  try {
    const pfx = loadPfxFromBuffer(decifrar(cfg.certPfx), decifrar(cfg.certPassword).toString("utf8"));
    // Composição manual em vez de emitirNfse(): o atalho do SDK valida o XSD
    // com xmllint, binário que não existe na Vercel. A validação fiscal (JS) é
    // executada, e a SEFIN valida o XSD do lado dela de qualquer forma.
    const pedido = nota as unknown as DpsJsonRequest;
    assertValidDpsJsonRequest(pedido);
    const built = buildDpsFromJson(pedido);
    const signedXml = signDps(built.xml, built.id, pfx);
    if (!verifyDps(signedXml, pfx.certPem)) {
      throw new Error("A assinatura XML da DPS não pôde ser verificada — confira o certificado.");
    }
    const resultado = await transmitirNotaPreparada(
      { ambiente, dpsId: built.id, unsignedXml: built.xml, signedXml },
      pfx
    );
    await prisma.fiscalNota.create({
      data: {
        serviceOrderId: os.id,
        chaveAcesso: resultado.chaveAcesso,
        numero: nDPS,
        serie: cfg.serie,
        ambiente,
        status: "autorizada",
        valor,
        descricao,
        nfseXml: resultado.nfseXml,
      },
    });
    revalidatePath(`/oficina/ordens/${osId}`);
    revalidatePath("/oficina/fiscal");
    return { ok: true, chaveAcesso: resultado.chaveAcesso };
  } catch (e) {
    const erro =
      e instanceof EmitirNotaError
        ? e.erros.map((r) => `${r.Codigo}: ${r.Descricao}`).join(" | ")
        : msg(e);
    await prisma.fiscalNota.create({
      data: {
        serviceOrderId: os.id,
        numero: nDPS,
        serie: cfg.serie,
        ambiente,
        status: e instanceof EmitirNotaError ? "rejeitada" : "erro",
        valor,
        descricao,
        erro,
      },
    });
    revalidatePath(`/oficina/ordens/${osId}`);
    return { ok: false, error: erro };
  }
}
