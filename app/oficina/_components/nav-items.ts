import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Car,
  ClipboardList,
  CalendarDays,
  Package,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const adminNav: AdminNavItem[] = [
  { href: "/oficina", label: "Dashboard", icon: LayoutDashboard },
  { href: "/oficina/clientes", label: "Clientes", icon: Users },
  { href: "/oficina/veiculos", label: "Veículos", icon: Car },
  { href: "/oficina/ordens", label: "Ordens de Serviço", icon: ClipboardList },
  { href: "/oficina/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/oficina/estoque", label: "Estoque", icon: Package },
  { href: "/oficina/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/oficina/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/oficina/configuracoes", label: "Configurações", icon: Settings },
];
