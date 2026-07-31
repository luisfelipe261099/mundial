import { getAgendaAdmin, getClientesVeiculosParaOS } from "@/lib/admin-data";
import { hojeISO } from "@/lib/datas";
import { AgendaManager } from "../_components/agenda-manager";
import { PageHeader } from "../_components/ui";

export default async function AgendaPage() {
  const [agenda, { clientes, veiculos }] = await Promise.all([
    getAgendaAdmin(),
    getClientesVeiculosParaOS(),
  ]);
  // "Hoje" é calculado no servidor: lib/datas.ts ancora em America/Sao_Paulo e
  // a Vercel roda em UTC. Calcular no cliente divergiria depois das 21h e
  // quebraria a hidratação.
  const hoje = hojeISO();
  const futuros = agenda.filter((a) => a.data >= hoje).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compromissos"
        title="Agenda"
        description="Agendamentos da oficina por dia e horário, com status de confirmação."
        stats={[
          { label: "agendamentos", value: agenda.length.toString() },
          { label: "a partir de hoje", value: futuros.toString() },
        ]}
      />
      <AgendaManager seed={agenda} clientes={clientes} veiculos={veiculos} hoje={hoje} />
    </div>
  );
}
