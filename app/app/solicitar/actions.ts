"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";
import { criarComNumeroOS } from "@/lib/numeracao";

export async function solicitarOrcamento(input: {
  veiculoId: string;
  descricao: string;
}): Promise<{ id: string }> {
  const clientId = await requireClientId();
  const [veiculo, cliente] = await Promise.all([
    prisma.vehicle.findFirst({ where: { id: input.veiculoId, clientId } }),
    prisma.client.findUnique({ where: { id: clientId } }),
  ]);
  const id = await criarComNumeroOS(async (numero) => {
    await prisma.serviceOrder.create({
      data: {
        id: numero,
        clientId,
        vehicleId: veiculo?.id ?? null,
        clientName: cliente?.name ?? "—",
        vehicleName: veiculo ? `${veiculo.brand} ${veiculo.model}` : "—",
        plate: veiculo?.plate ?? null,
        date: new Date().toLocaleDateString("pt-BR"),
        km: veiculo?.km ?? 0,
        defect: input.descricao,
        status: "Aberta",
        total: 0,
      },
    });
    return numero;
  });
  await prisma.notification.create({
    data: {
      clientId,
      type: "geral",
      title: "Solicitação recebida",
      text: "Recebemos seu pedido de orçamento. Em breve a oficina retorna.",
      when: "agora",
      read: false,
    },
  });
  revalidatePath("/oficina/ordens");
  revalidatePath("/app");
  return { id };
}
