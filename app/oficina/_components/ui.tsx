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
        <span className="grid size-10 place-items-center rounded-xl bg-[var(--ad-brand)]/15">
          <Icon className="size-5 adm-brand" />
        </span>
        {hint && <span className="text-xs font-medium adm-muted">{hint}</span>}
      </div>
      <p className="adm-display mt-3 text-2xl font-bold adm-ink">{value}</p>
      <p className="text-sm adm-muted">{label}</p>
    </div>
  );
}

// "Gráfico" de barras em CSS puro — sem lib de chart.
export function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor));
  return (
    <div className="flex h-48 items-end justify-between gap-3 px-1">
      {data.map((d) => (
        <div key={d.mes} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-[0.65rem] font-semibold adm-muted">
            {Math.round(d.valor / 1000)}k
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-[var(--ad-brand)] to-[var(--ad-brand-2)]"
              style={{ height: `${(d.valor / max) * 100}%` }}
              title={brl(d.valor)}
            />
          </div>
          <span className="text-xs font-medium adm-muted">{d.mes}</span>
        </div>
      ))}
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
