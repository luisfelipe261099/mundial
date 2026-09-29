import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

/* Numeração das ordens de serviço.
 *
 * Antes cada OS recebia um número sorteado entre 2100 e 11099: a oficina via
 * OS-9432 seguida de OS-2761, sem ordem nenhuma, e dois sorteios iguais
 * derrubavam a abertura da OS com erro de chave duplicada.
 *
 * Agora a numeração é sequencial, continuando do maior número já usado — quem
 * tem OS-2098 hoje recebe OS-2099 na próxima, sem "voltar no tempo" e sem
 * conflitar com o que já foi impresso e entregue ao cliente. */

/** Próximo número livre na sequência de OS. */
export async function proximoNumeroOS(): Promise<string> {
  const ordens = await prisma.serviceOrder.findMany({ select: { id: true } });
  let maior = 0;
  for (const o of ordens) {
    const n = Number(o.id.replace(/^OS-/i, ""));
    if (Number.isInteger(n) && n > maior) maior = n;
  }
  return `OS-${maior + 1}`;
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
