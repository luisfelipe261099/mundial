"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function setBudgetStatus(
  id: string,
  status: "pendente" | "aprovado" | "rejeitado"
) {
  const clientId = await requireClientId();

  // O cliente só decide um orçamento que ainda está pendente. Sem esta trava,
  // reenviar a ação num orçamento antigo empurrava uma OS já finalizada de
  // volta para "Aberta"/"Em execução" e bagunçava o fluxo da oficina.
  const budget = await prisma.budget.findFirst({ where: { id, clientId } });
  if (!budget || budget.status !== "pendente") return;

  await prisma.budget.updateMany({ where: { id, clientId }, data: { status } });

  // Se o orçamento veio de uma OS, a decisão do cliente move o processo:
  if (budget.serviceOrderId) {
    const osStatus =
      status === "aprovado"
        ? "Em execução"
        : status === "rejeitado"
        ? "Aberta"
        : "Aguardando aprovação";
    // Só mexe na OS se ela ainda estiver aguardando essa decisão.
    await prisma.serviceOrder.updateMany({
      where: { id: budget.serviceOrderId, status: "Aguardando aprovação" },
      data: { status: osStatus },
    });
    revalidatePath("/oficina/ordens");
    revalidatePath(`/oficina/ordens/${budget.serviceOrderId}`);
  }

  revalidatePath(`/app/orcamentos/${id}`);
  revalidatePath("/app/orcamentos");
}
