import Link from "next/link";
import { CalendarPlus, FileText, CircleDot, BatteryCharging } from "lucide-react";

const ACTIONS = [
  { label: "Agendar serviço", href: "/app/agendar", icon: CalendarPlus },
  { label: "Orçamento", href: "/app/orcamentos", icon: FileText },
  { label: "Pneus", href: "/app/agendar?servico=pneus", icon: CircleDot },
  { label: "Bateria", href: "/app/agendar?servico=bateria", icon: BatteryCharging },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {ACTIONS.map((a) => {
        const Icon = a.icon;
        return (
          <Link
            key={a.label}
            href={a.href}
            className="app-card-2 flex flex-col items-center gap-2 px-1 py-3.5 text-center transition-colors hover:border-[var(--app-brand)]/50"
          >
            <Icon className="size-6 t-brand" />
            <span className="text-[0.68rem] font-semibold leading-tight t-ink">{a.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
