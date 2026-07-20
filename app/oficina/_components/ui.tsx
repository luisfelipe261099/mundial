import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { brl } from "../_data/mock";

/* ────────────────────────────────────────────────────────────────────
   Kit compartilhado do painel (Server Components — sem hooks/estado).
   ──────────────────────────────────────────────────────────────────── */

// Sparkline em SVG puro — linha + área translúcida + ponto final.
// Sem <linearGradient id> (evita colisão de id em RSC); fill chapado.
export function Sparkline({
  data,
  className = "",
  stroke = "var(--ad-brand-2)",
  fill = "rgba(79, 144, 255, 0.14)",
}: {
  data: number[];
  className?: string;
  stroke?: string;
  fill?: string;
}) {
  const w = 100;
  const h = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = data.length === 1 ? w : (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2; // 2px de respiro topo/base
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const [lastX, lastY] = pts[pts.length - 1];
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <polygon points={`0,${h} ${line} ${w},${h}`} fill={fill} />
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle cx={lastX} cy={lastY} r={2.75} fill={stroke} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// Pílula de variação. Renderizar SÓ quando há dado real de comparação.
export function Delta({ dir, children }: { dir: "up" | "down" | "flat"; children: React.ReactNode }) {
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  return (
    <span className={`adm-delta adm-delta-${dir}`}>
      <Icon className="size-3.5" strokeWidth={2.5} />
      {children}
    </span>
  );
}

// Card editorial de KPI: número grande + rótulo + linha de contexto REAL
// (não inventa delta). `accent` liga o filete âmbar de destaque.
export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  accent = false,
  spark,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
  sub?: React.ReactNode;
  accent?: boolean;
  spark?: number[];
}) {
  return (
    <div className={`adm-card flex flex-col p-5 ${accent ? "adm-topline" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <span className="adm-eyebrow">{label}</span>
        {Icon && (
          <Icon
            className={`size-4 shrink-0 ${accent ? "adm-accent" : "adm-muted"}`}
            strokeWidth={2}
          />
        )}
      </div>
      <p className="adm-display-xl mt-4 truncate text-[clamp(1.7rem,4vw,2.4rem)] adm-ink">{value}</p>
      {spark && (
        <div className="mt-3 h-7 w-full">
          <Sparkline data={spark} className="h-full w-full" />
        </div>
      )}
      {sub && <div className="mt-3 flex items-center gap-2 text-xs adm-muted">{sub}</div>}
    </div>
  );
}

// Barras em CSS puro — refinado: trilho de fundo, mês corrente em destaque,
// valor no topo. Mesma assinatura de antes.
export function BarChart({ data }: { data: { mes: string; valor: number }[] }) {
  const max = Math.max(...data.map((d) => d.valor));
  return (
    <div className="flex h-52 items-end justify-between gap-2.5 px-1 sm:gap-3">
      {data.map((d, i) => {
        const atual = i === data.length - 1; // mês corrente em destaque
        return (
          <div key={d.mes} className="flex h-full flex-1 flex-col items-center gap-2.5">
            <span
              className={`adm-mono text-[0.58rem] tabular-nums ${atual ? "adm-brand" : "adm-muted"}`}
            >
              {Math.round(d.valor / 1000)}k
            </span>
            {/* trilho ocupa a altura restante (h-full na coluna garante espaço p/ o flex-1) */}
            <div className="flex w-full flex-1 items-end overflow-hidden rounded-md bg-[var(--ad-surface-2)]">
              <div
                className={`w-full rounded-md transition-[height] ${
                  atual
                    ? "bg-gradient-to-t from-[var(--ad-brand)] to-[var(--ad-brand-2)] shadow-[0_-8px_24px_-6px_rgba(47,123,255,0.55)]"
                    : "bg-[var(--ad-line-2)]"
                }`}
                style={{ height: `${(d.valor / max) * 100}%` }}
                title={brl(d.valor)}
              />
            </div>
            <span className={`text-xs font-medium ${atual ? "adm-ink" : "adm-muted"}`}>{d.mes}</span>
          </div>
        );
      })}
    </div>
  );
}

// Cabeçalho de página editorial — sobrescrito + título grande + descrição,
// com faixa opcional de mini-stats (dado REAL) e slot de ação à direita.
export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  stats,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  stats?: { label: string; value: string; accent?: boolean }[];
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <p className="adm-eyebrow adm-brand">{eyebrow}</p>
        <h1 className="adm-display mt-2 text-2xl adm-ink">{title}</h1>
        {description && <p className="mt-2 max-w-prose text-sm adm-muted">{description}</p>}
        {stats && stats.length > 0 && (
          <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-2">
            {stats.map((s, i) => (
              <div key={i} className="flex items-baseline gap-1.5">
                <span className={`adm-display text-lg ${s.accent ? "adm-accent" : "adm-ink"}`}>
                  {s.value}
                </span>
                <span className="adm-eyebrow">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

// Painel/section com cabeçalho editorial. `eyebrow` e `icon` são opcionais
// (chamadas antigas — só `title`/`action`/`bodyClass` — seguem funcionando).
export function Panel({
  title,
  eyebrow,
  icon: Icon,
  action,
  children,
  bodyClass = "",
}: {
  title: string;
  eyebrow?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  bodyClass?: string;
}) {
  return (
    <section className="adm-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--ad-line)] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[var(--ad-surface-2)] ring-1 ring-inset ring-[var(--ad-line-2)]">
              <Icon className="size-[1.05rem] adm-brand" strokeWidth={2} />
            </span>
          )}
          <div className="min-w-0">
            {eyebrow && <p className="adm-eyebrow mb-0.5">{eyebrow}</p>}
            <h2 className="adm-display truncate text-[0.98rem] font-bold adm-ink">{title}</h2>
          </div>
        </div>
        {action}
      </div>
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
