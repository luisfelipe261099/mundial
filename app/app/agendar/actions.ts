"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function criarAgendamento(input: {
  veiculoNome: string;
  servico: string;
  data: string;
  hora: string;
}) {
  const clientId = await requireClientId();
  await prisma.appointment.create({
    data: {
      clientId,
      vehicleName: input.veiculoNome,
      service: input.servico,
      date: input.data,
      time: input.hora,
      status: "Agendado",
    },
  });
  revalidatePath("/app/agendar");
}
