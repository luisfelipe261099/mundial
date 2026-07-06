"use server";

import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function salvarPushSubscription(sub: { endpoint: string; p256dh: string; auth: string }) {
  const clientId = await requireClientId();
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    create: { clientId, endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
    update: { clientId, p256dh: sub.p256dh, auth: sub.auth },
  });
}
