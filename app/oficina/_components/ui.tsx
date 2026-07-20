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
    <div className="adm-card adm-lift relative overflow-hidden p-4">
      <span className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-[var(--ad-brand)]/12 blur-2xl" />
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-[image:var(--ad-grad)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_18px_-8px_rgba(37,99,235,0.65)]">
          <Icon className="size-5" />
        </span>
        {hint && (
          <span className="rounded-full border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2 py-0.5 text-[0.65rem] font-semibold adm-muted">
            {hint}
          </span>
        )}
      </div>
      <p className="adm-display tnum mt-3 text-2xl font-bold adm-ink">{value}</p>
      <p className="mt-0.5 text-sm adm-muted">{label}</p>
    </div>
  );
}

// "Gráfico" de barras em CSS puro — sem lib de chart.
export function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor));
  return (
    <div className="relative">
      {/* linhas-guia horizontais */}
      <div className="pointer-events-none absolute inset-x-1 bottom-7 top-5 flex flex-col justify-between">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="border-t border-dashed border-[var(--ad-line)]" />
        ))}
      </div>
      <div className="relative flex h-48 justify-between gap-3 px-1">
        {data.map((d, i) => {
          const last = i === data.length - 1;
          return (
            <div
              key={d.mes}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-2"
            >
              <span
                className={`tnum text-[0.65rem] font-semibold transition-colors ${
                  last ? "adm-brand" : "adm-muted group-hover:text-[var(--ad-ink)]"
                }`}
              >
                {Math.round(d.valor / 1000)}k
              </span>
              <div
                className={`w-full rounded-t-lg transition-[filter] duration-150 group-hover:brightness-125 ${
                  last
                    ? "bg-[image:var(--ad-grad)] shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                    : "bg-gradient-to-t from-[var(--ad-brand)]/45 to-[var(--ad-brand-2)]/70"
                }`}
                style={{ height: `${(d.valor / max) * 78}%` }}
                title={brl(d.valor)}
              />
              <span
                className={`text-xs font-medium ${last ? "font-semibold adm-ink" : "adm-muted"}`}
              >
                {d.mes}
              </span>
            </div>
          );
        })}
      </div>
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
        <h2 className="adm-display flex items-center gap-2.5 font-bold adm-ink">
          <span className="h-4 w-1 rounded-full bg-[image:var(--ad-grad)]" />
          {title}
        </h2>
        {action}
      </div>
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
