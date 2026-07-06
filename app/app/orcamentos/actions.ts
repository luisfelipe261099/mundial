"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function setBudgetStatus(
  id: string,
  status: "pendente" | "aprovado" | "rejeitado"
) {
  const clientId = await requireClientId();
  // updateMany com clientId garante que o cliente só altera o próprio orçamento
  await prisma.budget.updateMany({ where: { id, clientId }, data: { status } });

  // Se o orçamento veio de uma OS, a decisão do cliente move o processo:
  const budget = await prisma.budget.findFirst({ where: { id, clientId } });
  if (budget?.serviceOrderId) {
    const osStatus =
      status === "aprovado"
        ? "Em execução"
        : status === "rejeitado"
        ? "Aberta"
        : "Aguardando aprovação";
    await prisma.serviceOrder.update({
      where: { id: budget.serviceOrderId },
      data: { status: osStatus },
    });
    revalidatePath("/oficina/ordens");
    revalidatePath(`/oficina/ordens/${budget.serviceOrderId}`);
  }

  revalidatePath(`/app/orcamentos/${id}`);
  revalidatePath("/app/orcamentos");
}
