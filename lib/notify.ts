import { prisma } from "@/lib/prisma";

// Ponto único de notificação. Cria a Notification in-app.
// (Fase 3 acopla o Web Push aqui, então todo aviso vira push automaticamente.)
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
  // Fase 3: await enviarPush(clientId, { title, body: text, url });
  void url;
}
