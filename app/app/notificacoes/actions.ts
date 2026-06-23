"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function marcarLida(id: string, lido: boolean) {
  const clientId = await requireClientId();
  await prisma.notification.updateMany({ where: { id, clientId }, data: { read: lido } });
  revalidatePath("/app/notificacoes");
  revalidatePath("/app");
}

export async function marcarTodas() {
  const clientId = await requireClientId();
  await prisma.notification.updateMany({ where: { clientId, read: false }, data: { read: true } });
  revalidatePath("/app/notificacoes");
  revalidatePath("/app");
}
