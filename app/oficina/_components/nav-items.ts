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
  KeyRound,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  title: string;
  items: AdminNavItem[];
}

// Navegação agrupada por área — dá estrutura editorial à sidebar.
export const adminNavSections: AdminNavSection[] = [
  {
    title: "Operação",
    items: [
      { href: "/oficina", label: "Dashboard", icon: LayoutDashboard },
      { href: "/oficina/clientes", label: "Clientes", icon: Users },
      { href: "/oficina/veiculos", label: "Veículos", icon: Car },
      { href: "/oficina/ordens", label: "Ordens de Serviço", icon: ClipboardList },
      { href: "/oficina/agenda", label: "Agenda", icon: CalendarDays },
    ],
  },
  {
    title: "Gestão",
    items: [
      { href: "/oficina/estoque", label: "Estoque", icon: Package },
      { href: "/oficina/financeiro", label: "Financeiro", icon: Wallet },
      { href: "/oficina/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    title: "Sistema",
    items: [
      { href: "/oficina/acessos", label: "Acessos", icon: KeyRound },
      { href: "/oficina/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

// Lista achatada — usada pelo titleFor (match de prefixo) no AdminShell.
export const adminNav: AdminNavItem[] = adminNavSections.flatMap((s) => s.items);
