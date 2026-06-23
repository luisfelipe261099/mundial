import { CalendarCheck } from "lucide-react";
import { requireClientId } from "@/lib/auth";
import { getAgendamentos, getVeiculos, getCatalogoServicos } from "@/lib/client-data";
import { agendamentoBadge } from "../_components/category";
import { BookingFlow } from "../_components/booking-flow";

const HORARIOS = ["08:00", "09:00", "10:30", "13:30", "15:00", "16:30"];

export default async function AgendarPage() {
  const clientId = await requireClientId();
  const [agendamentos, veiculos, catalogo] = await Promise.all([
    getAgendamentos(clientId),
    getVeiculos(clientId),
    getCatalogoServicos(),
  ]);

  return (
    <div className="space-y-6 px-5 pb-8 pt-3">
      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Meus agendamentos</h2>
        {agendamentos.length ? (
          <div className="space-y-3">
            {agendamentos.map((a) => (
              <div key={a.id} className="app-card flex items-center gap-3 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--app-brand)]/15">
                  <CalendarCheck className="size-5 t-brand" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.95rem] font-semibold t-ink">{a.servico}</p>
                  <p className="truncate text-xs t-muted">
                    {a.veiculoNome} · {a.data} às {a.hora}
                  </p>
                </div>
                <span className={agendamentoBadge[a.status]}>{a.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="app-card p-5 text-sm t-muted">Nenhum agendamento ainda.</div>
        )}
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Agendar novo serviço</h2>
        <BookingFlow
          veiculos={veiculos.map((v) => ({ id: v.id, modelo: v.modelo, placa: v.placa }))}
          servicos={catalogo}
          horarios={HORARIOS}
        />
      </section>
    </div>
  );
}
