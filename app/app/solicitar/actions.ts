"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";
import { hojeBR } from "@/lib/datas";
import { comIdUnico, proximoIdOS } from "@/lib/ids";

export async function solicitarOrcamento(input: {
  veiculoId: string;
  descricao: string;
}): Promise<{ id: string }> {
  const clientId = await requireClientId();
  const [veiculo, cliente] = await Promise.all([
    prisma.vehicle.findFirst({ where: { id: input.veiculoId, clientId } }),
    prisma.client.findUnique({ where: { id: clientId } }),
  ]);
  // Veículo inexistente ou de outro cliente: nada de abrir OS órfã com "—".
  if (!veiculo) throw new Error("Veículo não encontrado.");

  const { id } = await comIdUnico(proximoIdOS, (id) =>
    prisma.serviceOrder.create({
      data: {
        id,
        clientId,
        vehicleId: veiculo.id,
        clientName: cliente?.name ?? "—",
        vehicleName: `${veiculo.brand} ${veiculo.model}`,
        plate: veiculo.plate,
        date: hojeBR(),
        km: veiculo.km,
        defect: input.descricao,
        status: "Aberta",
        total: 0,
      },
    })
  );
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
