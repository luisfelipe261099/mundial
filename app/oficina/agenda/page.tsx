import { agendaHoje } from "../_data/mock";
import { Panel } from "../_components/ui";

const DIAS = [
  { label: "Seg 22", hoje: false },
  { label: "Ter 23", hoje: true },
  { label: "Qua 24", hoje: false },
  { label: "Qui 25", hoje: false },
  { label: "Sex 26", hoje: false },
  { label: "Sáb 27", hoje: false },
];

export default function AgendaPage() {
  return (
    <div className="space-y-5">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {DIAS.map((d) => (
          <button
            key={d.label}
            type="button"
            className={`shrink-0 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
              d.hoje
                ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
                : "border-[var(--ad-line)] adm-muted hover:bg-[var(--ad-surface-2)]"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <Panel
        title="Agendamentos de hoje · Ter 23/06"
        bodyClass="divide-y divide-[var(--ad-line)]"
      >
        {agendaHoje.map((a, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <div className="w-14 shrink-0 text-center">
              <p className="adm-display text-lg font-bold adm-ink">{a.hora}</p>
            </div>
            <div className="h-10 w-px shrink-0 bg-[var(--ad-line)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold adm-ink">{a.servico}</p>
              <p className="truncate text-xs adm-muted">
                {a.cliente} · {a.veiculo}
              </p>
            </div>
            <span className={a.status === "Confirmado" ? "osb osb-finalizada" : "osb osb-aguardando"}>
              {a.status}
            </span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
