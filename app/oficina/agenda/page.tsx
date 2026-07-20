import { getAgendaAdmin } from "@/lib/admin-data";
import { AgendaManager } from "../_components/agenda-manager";
import { PageHeader } from "../_components/ui";

export default async function AgendaPage() {
  const agenda = await getAgendaAdmin();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compromissos"
        title="Agenda"
        description="Agendamentos da oficina por dia e horário, com status de confirmação."
        stats={[{ label: "agendamentos", value: agenda.length.toString() }]}
      />
      <AgendaManager seed={agenda} />
    </div>
  );
}
