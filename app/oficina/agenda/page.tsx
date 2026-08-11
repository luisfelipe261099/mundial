import { getAgendaAdmin, hojeISO } from "@/lib/admin-data";
import { AgendaManager } from "../_components/agenda-manager";
import { PageHeader } from "../_components/ui";

const ENCERRADOS = ["Concluído", "Concluido", "Finalizado", "Cancelado"];

export default async function AgendaPage() {
  const agenda = await getAgendaAdmin();
  const hoje = hojeISO();

  const passou = (a: (typeof agenda)[number]) =>
    ENCERRADOS.includes(a.status) || (a.iso !== "" && a.iso < hoje);
  const proximos = agenda.filter((a) => !passou(a));
  const deHoje = agenda.filter((a) => a.iso === hoje && !ENCERRADOS.includes(a.status));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compromissos"
        title="Agenda"
        description="Os próximos compromissos primeiro, agrupados por dia. O que já passou (ou foi concluído e cancelado) sai da lista e fica guardado na aba “Já passaram”."
        stats={[
          { label: "hoje", value: deHoje.length.toString(), accent: deHoje.length > 0 },
          { label: "próximos", value: proximos.length.toString() },
          { label: "já passaram", value: (agenda.length - proximos.length).toString() },
        ]}
      />
      <AgendaManager seed={agenda} hoje={hoje} />
    </div>
  );
}
