"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

// `avancarStatus` foi removida: não tinha nenhum call site (a tela usa
// os-actions.mudarStatus) e, por não replicar a baixa de estoque nem a
// notificação ao cliente, era uma armadilha para a próxima edição.

export async function salvarObservacoes(id: string, texto: string) {
  const session = await requireStaff();
  // Mecânico só escreve na OS atribuída a ele; o admin escreve em qualquer uma.
  const escopo =
    session.kind === "mecanico" ? { id, mechanicId: session.id } : { id };
  await prisma.serviceOrder.updateMany({ where: escopo, data: { observations: texto } });
  revalidatePath(`/mecanico/${id}`);
}
