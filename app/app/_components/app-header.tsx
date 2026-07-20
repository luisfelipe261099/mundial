// Cabeçalho de página editorial do app do cliente — sobrescrito + título
// grande + descrição, com faixa opcional de mini-stats (dado real).
export function AppHeader({
  eyebrow,
  title,
  description,
  stats,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  stats?: { label: string; value: string; accent?: boolean }[];
}) {
  return (
    <div>
      <p className="app-eyebrow t-brand">{eyebrow}</p>
      <h1 className="app-display-xl mt-2 text-[1.9rem] t-ink">{title}</h1>
      {description && <p className="mt-2 text-sm t-muted">{description}</p>}
      {stats && stats.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
          {stats.map((s, i) => (
            <div key={i} className="flex items-baseline gap-1.5">
              <span className={`app-display text-lg font-bold ${s.accent ? "t-accent" : "t-ink"}`}>
                {s.value}
              </span>
              <span className="app-eyebrow">{s.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
