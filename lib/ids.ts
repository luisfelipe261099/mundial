import { prisma } from "@/lib/prisma";

// IDs legíveis e sequenciais para OS e orçamentos ("OS-2098", "ORC-318").
// Antes eram sorteados com Math.random() num intervalo pequeno — no caso do
// ORC eram só 699 valores possíveis, então colisões (e o P2002 não tratado
// que derrubava o server action) eram questão de poucas centenas de registros.

const OS_INICIAL = 2100;
const ORC_INICIAL = 300;

function proximoNumero(ids: string[], prefixo: string, inicial: number): number {
  let maior = inicial - 1;
  for (const id of ids) {
    const n = Number(id.slice(prefixo.length));
    if (Number.isInteger(n) && n > maior) maior = n;
  }
  return maior + 1;
}

export async function proximoIdOS(): Promise<string> {
  const rows = await prisma.serviceOrder.findMany({
    where: { id: { startsWith: "OS-" } },
    select: { id: true },
  });
  return `OS-${proximoNumero(rows.map((r) => r.id), "OS-", OS_INICIAL)}`;
}

export async function proximoIdOrcamento(): Promise<string> {
  const rows = await prisma.budget.findMany({
    where: { id: { startsWith: "ORC-" } },
    select: { id: true },
  });
  return `ORC-${proximoNumero(rows.map((r) => r.id), "ORC-", ORC_INICIAL)}`;
}

/**
 * Executa `criar` reservando um id; se duas requisições simultâneas pegarem o
 * mesmo número, o unique constraint do Postgres derruba uma e ela tenta o
 * próximo, em vez de estourar um erro sem tratamento na cara do usuário.
 */
export async function comIdUnico<T>(
  gerar: () => Promise<string>,
  criar: (id: string) => Promise<T>,
  tentativas = 5
): Promise<T> {
  let ultimoErro: unknown;
  for (let i = 0; i < tentativas; i++) {
    const id = await gerar();
    try {
      return await criar(id);
    } catch (err) {
      // P2002 = violação de unique. Qualquer outro erro é problema real.
      if ((err as { code?: string }).code !== "P2002") throw err;
      ultimoErro = err;
    }
  }
  throw ultimoErro;
}
