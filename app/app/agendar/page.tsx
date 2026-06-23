import { CalendarCheck } from "lucide-react";
import {
  veiculos,
  catalogoServicos,
  horariosDisponiveis,
  agendamentos,
} from "../_data/mock";
import { agendamentoBadge } from "../_components/category";
import { BookingFlow } from "../_components/booking-flow";

export default function AgendarPage() {
  return (
    <div className="space-y-6 px-5 pb-8 pt-3">
      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Meus agendamentos</h2>
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
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">
          Agendar novo serviço
        </h2>
        <BookingFlow
          veiculos={veiculos.map((v) => ({ id: v.id, modelo: v.modelo, placa: v.placa }))}
          servicos={catalogoServicos}
          horarios={horariosDisponiveis}
        />
      </section>
    </div>
  );
}
