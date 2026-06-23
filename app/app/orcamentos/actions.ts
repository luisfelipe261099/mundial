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
  revalidatePath(`/app/orcamentos/${id}`);
  revalidatePath("/app/orcamentos");
}
