import Link from "next/link";
import { Calendar, ChevronRight } from "lucide-react";
import type { Veiculo } from "../_data/mock";

const DOT: Record<string, string> = {
  ok: "#22c55e",
  proxima: "#f59e0b",
  vencida: "#ef4444",
};

export function NextServiceCard({ veiculo }: { veiculo: Veiculo }) {
  // O que importa é o item mais urgente calculado pelo motor de manutenção
  // (vencido > próximo > em dia), não uma contagem de km que ninguém alimenta.
  const itens = veiculo.proximasManutencoes;
  const prioridade = { vencida: 0, proxima: 1, ok: 2 } as const;
  const proximo = [...itens].sort(
    (a, b) => prioridade[a.status] - prioridade[b.status]
  )[0];

  if (!proximo) {
    return (
      <div className="app-card flex items-center gap-4 p-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--app-surface-2)]">
          <Calendar className="size-6 t-muted" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium t-muted">Revisão recomendada</p>
          <p className="text-sm t-ink">
            Assim que a oficina registrar a última revisão do seu veículo, o
            próximo vencimento aparece aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Link href={`/app/veiculos/${veiculo.id}`} className="app-card flex items-center gap-4 p-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--app-brand)]/15">
        <Calendar className="size-6 t-brand" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium t-muted">Próxima manutenção</p>
        <p className="app-display text-[1.02rem] font-bold t-ink">{proximo.item}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold t-brand">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: DOT[proximo.status] }}
          />
          {proximo.quando}
        </p>
      </div>
      <ChevronRight className="size-5 shrink-0 t-muted" />
    </Link>
  );
}
