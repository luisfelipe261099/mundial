// Mapeia categoria de serviço → ícone + classe de chip colorido, e status →
// classe de badge. Sem hooks: pode ser usado em Server e Client Components.
import type { LucideIcon } from "lucide-react";
import {
  Droplet,
  Disc,
  FileText,
  CalendarCheck,
  Gauge,
  Zap,
  CircleDot,
  BatteryCharging,
  Wrench,
  Tag,
  Receipt,
  FileCheck2,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  oleo: Droplet,
  freio: Disc,
  filtro: FileText,
  revisao: CalendarCheck,
  suspensao: Gauge,
  eletrica: Zap,
  pneus: CircleDot,
  bateria: BatteryCharging,
  geral: Wrench,
  promo: Tag,
  ipva: Receipt,
  licenciamento: FileCheck2,
};

export function categoriaIcon(cat: string): LucideIcon {
  return ICONS[cat] ?? Wrench;
}

export function CatChip({
  categoria,
  className = "",
}: {
  categoria: string;
  className?: string;
}) {
  const Icon = categoriaIcon(categoria);
  return (
    <span className={`chip chip-${categoria} ${className}`}>
      <Icon className="size-5" strokeWidth={2} aria-hidden />
    </span>
  );
}

export const agendamentoBadge: Record<string, string> = {
  Agendado: "badge badge-agendado",
  Confirmado: "badge badge-confirmado",
  "Em andamento": "badge badge-andamento",
  Finalizado: "badge badge-finalizado",
};

export const orcamentoBadge: Record<string, { cls: string; label: string }> = {
  pendente: { cls: "badge badge-pendente", label: "Pendente" },
  aprovado: { cls: "badge badge-aprovado", label: "Aprovado" },
  rejeitado: { cls: "badge badge-rejeitado", label: "Rejeitado" },
};

export const manutencaoBadge: Record<string, { cls: string; label: string }> = {
  ok: { cls: "badge badge-ok", label: "Em dia" },
  proxima: { cls: "badge badge-proxima", label: "Próxima" },
  vencida: { cls: "badge badge-vencida", label: "Vencida" },
};
