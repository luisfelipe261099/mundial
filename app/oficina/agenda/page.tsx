import { getAgendaAdmin } from "@/lib/admin-data";
import { AgendaManager } from "../_components/agenda-manager";

export default async function AgendaPage() {
  const agenda = await getAgendaAdmin();
  return <AgendaManager seed={agenda} />;
}
