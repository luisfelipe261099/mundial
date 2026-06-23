import type { LucideIcon } from "lucide-react";
import { Home, Car, Wrench, User, Calendar, FileText, Bell, FolderOpen } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// Bottom-nav: 4 abas (igual à imagem de referência).
export const bottomNav: NavItem[] = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/veiculos", label: "Veículos", icon: Car },
  { href: "/app/servicos", label: "Serviços", icon: Wrench },
  { href: "/app/perfil", label: "Perfil", icon: User },
];

// Drawer: o menu completo do cliente (os 7 itens do spec).
export const drawerNav: NavItem[] = [
  { href: "/app", label: "Início", icon: Home },
  { href: "/app/veiculos", label: "Meus Veículos", icon: Car },
  { href: "/app/agendar", label: "Agendamentos", icon: Calendar },
  { href: "/app/historico", label: "Histórico", icon: Wrench },
  { href: "/app/orcamentos", label: "Orçamentos", icon: FileText },
  { href: "/app/documentos", label: "Documentos", icon: FolderOpen },
  { href: "/app/notificacoes", label: "Notificações", icon: Bell },
  { href: "/app/perfil", label: "Perfil", icon: User },
];
