import webpush from "web-push";
import { prisma } from "@/lib/prisma";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;

let ready = false;
function configurar(): boolean {
  if (ready) return true;
  if (!PUBLIC_KEY || !PRIVATE_KEY) return false;
  webpush.setVapidDetails("mailto:contato@automecanicamundial.com.br", PUBLIC_KEY, PRIVATE_KEY);
  ready = true;
  return true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

// Envia push para todas as inscrições do cliente.
// Sem chaves VAPID configuradas → no-op (degrada sem quebrar).
export async function enviarPush(clientId: string, payload: PushPayload): Promise<void> {
  if (!configurar()) return;
  const subs = await prisma.pushSubscription.findMany({ where: { clientId } });
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        // inscrição expirada/removida → limpa
        if (code === 404 || code === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    })
  );
}
