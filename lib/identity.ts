import crypto from "node:crypto";

// Normaliza placa: maiúsculas, só letras/números (ignora hífen/espaço).
// Usada no login e no primeiro acesso para casar placas com/sem máscara.
export function normPlate(s: string): string {
  return s.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

// Normaliza telefone para só dígitos. Remove um "55" de país à frente quando
// o cliente cola no formato +55 (resultado ficaria com 12–13 dígitos).
export function normPhone(s: string): string {
  const d = s.replace(/\D/g, "");
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return d.slice(2);
  return d;
}

export type ClientAuth = { password: string | null; phone: string | null; whatsapp: string | null };
export type AtivacaoResult = { ok: true } | { ok: false; reason: "ja_ativada" | "nao_confere" };

// Decide se um cliente pode ativar a conta com o telefone informado.
// Regra: conta ainda SEM senha + telefone (ou whatsapp) que confere.
// Função pura (sem I/O) para ser testável isoladamente.
export function podeAtivar(client: ClientAuth, telefoneDigitos: string): AtivacaoResult {
  if (client.password) return { ok: false, reason: "ja_ativada" };
  const alvo = telefoneDigitos.trim();
  if (!alvo) return { ok: false, reason: "nao_confere" };
  const candidatos = [client.phone, client.whatsapp]
    .map((t) => (t ? normPhone(t) : ""))
    .filter(Boolean);
  return candidatos.includes(alvo) ? { ok: true } : { ok: false, reason: "nao_confere" };
}

// Senha temporária legível (3 blocos de 4), sem caracteres ambíguos (0/O/1/l/I).
// Gerada pelo admin quando o cliente não consegue o autoatendimento.
export function gerarSenhaTemporaria(): string {
  const alfabeto = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bloco = () =>
    Array.from(crypto.randomBytes(4))
      .map((b) => alfabeto[b % alfabeto.length])
      .join("");
  return `${bloco()}-${bloco()}-${bloco()}`;
}
