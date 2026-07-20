import Link from "next/link";
import { CalendarPlus, FileText, CircleDot, BatteryCharging, ChevronRight } from "lucide-react";

// Ação primária em destaque + secundárias em lista editorial.
// (Antes: 4 ladrilhos de ícone iguais — "app de brinquedo". Agora tem hierarquia.)
const PRIMARY = {
  label: "Agendar serviço",
  desc: "Escolha o serviço e o melhor horário",
  href: "/app/agendar",
  icon: CalendarPlus,
};
const SECONDARY = [
  { label: "Pedir orçamento", desc: "Receba uma proposta sem compromisso", href: "/app/orcamentos", icon: FileText },
  { label: "Pneus", desc: "Troca, rodízio e alinhamento", href: "/app/agendar?servico=pneus", icon: CircleDot },
  { label: "Bateria", desc: "Teste e substituição", href: "/app/agendar?servico=bateria", icon: BatteryCharging },
];

export function QuickActions() {
  const Primary = PRIMARY.icon;
  return (
    <div className="space-y-2.5">
      <Link
        href={PRIMARY.href}
        className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-[var(--app-brand)] to-[#1b5fe0] p-4 shadow-[0_16px_40px_-18px_rgba(47,123,255,0.7)] transition-transform active:scale-[0.99]"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15">
          <Primary className="size-6 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="app-display font-bold text-white">{PRIMARY.label}</p>
          <p className="text-xs text-white/80">{PRIMARY.desc}</p>
        </div>
        <ChevronRight className="size-5 shrink-0 text-white/80" />
      </Link>

      <div className="app-card divide-y divide-[var(--app-line)] overflow-hidden">
        {SECONDARY.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.label}
              href={a.href}
              className="flex items-center gap-3.5 p-4 transition-colors hover:bg-[var(--app-surface-2)]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--app-surface-3)] ring-1 ring-inset ring-[var(--app-line-2)]">
                <Icon className="size-5 t-brand" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold t-ink">{a.label}</p>
                <p className="text-xs t-muted">{a.desc}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 t-muted" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
