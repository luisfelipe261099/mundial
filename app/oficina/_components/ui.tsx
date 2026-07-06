import type { LucideIcon } from "lucide-react";
import { brl } from "../_data/mock";

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
}) {
  return (
    <div className="adm-card p-4">
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--ad-brand)]/12 ring-1 ring-inset ring-[var(--ad-line-2)]">
          <Icon className="size-5 adm-brand" />
        </span>
        {hint && <span className="adm-mono text-[0.58rem] adm-muted">{hint}</span>}
      </div>
      <p className="adm-display mt-3.5 text-[1.75rem] adm-ink">{value}</p>
      <p className="adm-mono mt-2 text-[0.6rem] adm-muted">{label}</p>
    </div>
  );
}

// "Gráfico" de barras em CSS puro — sem lib de chart.
export function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor));
  return (
    <div className="flex h-48 items-end justify-between gap-3 px-1">
      {data.map((d, i) => {
        const atual = i === data.length - 1; // mês corrente em destaque
        return (
          <div key={d.mes} className="flex flex-1 flex-col items-center gap-2">
            <span
              className={`adm-mono text-[0.58rem] tabular-nums ${atual ? "adm-brand" : "adm-muted"}`}
            >
              {Math.round(d.valor / 1000)}k
            </span>
            {/* trilho de fundo → a barra lê como coluna de instrumento */}
            <div className="flex w-full flex-1 items-end rounded-t-md bg-[var(--ad-surface-2)]">
              <div
                className={`w-full rounded-t-md ${
                  atual
                    ? "bg-gradient-to-t from-[var(--ad-brand)] to-[var(--ad-brand-2)]"
                    : "bg-[var(--ad-line-2)]"
                }`}
                style={{ height: `${(d.valor / max) * 100}%` }}
                title={brl(d.valor)}
              />
            </div>
            <span
              className={`text-xs font-medium ${atual ? "adm-ink" : "adm-muted"}`}
            >
              {d.mes}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  bodyClass = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClass?: string;
}) {
  return (
    <section className="adm-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--ad-line)] px-5 py-3.5">
        <h2 className="adm-display font-bold adm-ink">{title}</h2>
        {action}
      </div>
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
