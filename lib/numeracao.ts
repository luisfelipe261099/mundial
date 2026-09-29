import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

/* Numeração das ordens de serviço.
 *
 * Histórico: cada OS recebia um número sorteado entre 2100 e 11099 — a lista
 * pulava de OS-9432 para OS-2761, e dois sorteios iguais derrubavam a abertura
 * da OS com erro de chave duplicada.
 *
 * Agora a numeração é sequencial e curta, no formato OS-0020: conta quantas
 * ordens já existem e segue dali, com quatro dígitos e zero à esquerda. As OS
 * antigas (OS-1975, OS-2098…) ficam como estão — elas já foram impressas e
 * entregues ao cliente. */

const PREFIXO = "OS-";
const DIGITOS = 4;

const formatar = (n: number) => `${PREFIXO}${String(n).padStart(DIGITOS, "0")}`;

/** Próximo número livre da sequência, no formato OS-0020. */
export async function proximoNumeroOS(): Promise<string> {
  const ordens = await prisma.serviceOrder.findMany({ select: { id: true } });
  const ocupados = new Set(ordens.map((o) => o.id));

  // Marca d'água do formato novo: o zero à esquerda distingue "0020" (novo) de
  // "1975" (antigo). Assim, apagar uma OS não faz o número dela ser reusado.
  let maiorNovo = 0;
  for (const o of ordens) {
    const sufixo = o.id.replace(/^OS-/i, "");
    if (/^0\d+$/.test(sufixo)) {
      const n = Number(sufixo);
      if (Number.isInteger(n) && n > maiorNovo) maiorNovo = n;
    }
  }

  let n = Math.max(ordens.length + 1, maiorNovo + 1);
  while (ocupados.has(formatar(n))) n++;
  return formatar(n);
}

/**
 * Cria a OS com o próximo número da sequência. Se duas entradas acontecerem no
 * mesmo instante e pegarem o mesmo número, o banco recusa a duplicata e a
 * gente tenta o número seguinte em vez de estourar erro na tela.
 */
export async function criarComNumeroOS<T>(criar: (id: string) => Promise<T>): Promise<T> {
  for (let tentativa = 0; ; tentativa++) {
    try {
      return await criar(await proximoNumeroOS());
    } catch (e) {
      const duplicado =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
      if (!duplicado || tentativa >= 4) throw e;
    }
  }
}
