import Link from "next/link";

// Cabeçalho de seção reutilizável: "Título" + ação opcional ("Ver todos").
export function SectionHeading({
  title,
  actionLabel,
  actionHref,
}: {
  title: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="app-display text-[1.05rem] font-bold t-ink">{title}</h2>
      {actionHref && actionLabel && (
        <Link href={actionHref} className="text-sm font-semibold t-brand">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
