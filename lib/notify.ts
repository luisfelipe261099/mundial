import { prisma } from "@/lib/prisma";
import { enviarPush } from "@/lib/push";

// Ponto único de notificação: cria a Notification in-app e dispara o Web Push.
// Todo aviso do sistema passa por aqui, então basta ligar as chaves VAPID.
export async function notificar(
  clientId: string | null | undefined,
  type: string,
  title: string,
  text: string,
  url = "/app/notificacoes"
) {
  if (!clientId) return;
  await prisma.notification.create({
    data: { clientId, type, title, text, when: "Agora" },
  });
  await enviarPush(clientId, { title, body: text, url });
}
