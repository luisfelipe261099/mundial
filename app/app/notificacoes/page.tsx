import { requireClientId } from "@/lib/auth";
import { getNotificacoes } from "@/lib/client-data";
import { NotificationsList } from "./notifications-list";

export default async function NotificacoesPage() {
  const clientId = await requireClientId();
  const notificacoes = await getNotificacoes(clientId);

  return <NotificationsList initial={notificacoes} />;
}
