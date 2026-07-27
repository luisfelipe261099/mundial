"use server";

import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function salvarPushSubscription(sub: { endpoint: string; p256dh: string; auth: string }) {
  const clientId = await requireClientId();
  // O endpoint vem do browser (dado do cliente). Nunca reatribuir uma inscrição
  // que já pertence a outro cliente — senão quem descobrir o endpoint alheio
  // rouba as notificações daquele aparelho.
  const existente = await prisma.pushSubscription.findUnique({
    where: { endpoint: sub.endpoint },
    select: { clientId: true },
  });
  if (existente && existente.clientId !== clientId) return;
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: { clientId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
    update: { p256dh: sub.p256dh, auth: sub.auth },
  });
}
