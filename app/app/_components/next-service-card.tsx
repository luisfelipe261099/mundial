import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { Veiculo } from "../_data/mock";

export function NextServiceCard({ veiculo }: { veiculo: Veiculo }) {
  const { faltamKm, data, progresso } = veiculo.proximaRevisao;
  const pct = Math.round(progresso * 100);
  const km = faltamKm.toLocaleString("pt-BR");

  return (
    <Link href={`/app/veiculos/${veiculo.id}`} className="app-card flex items-center gap-4 p-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--app-brand)]/15">
        <Calendar className="size-6 t-brand" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium t-muted">Revisão recomendada</p>
        <p className="app-display text-[1.02rem] font-bold t-ink">
          Em {km} km ou {data}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--app-surface-2)]">
          <div
            className="h-full rounded-full bg-[var(--app-brand)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs font-semibold t-brand">Faltam {km} km</p>
      </div>
      <ChevronRight className="size-5 shrink-0 t-muted" />
    </Link>
  );
}
