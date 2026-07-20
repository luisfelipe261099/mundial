"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { HelpCircle, Menu, Search } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { adminNav } from "./nav-items";
import { WelcomeTour } from "@/app/_components/welcome-tour";
import { adminTourSteps } from "./admin-tour-steps";

function titleFor(path: string): string {
  if (path.startsWith("/oficina/ordens/")) return "Ordem de Serviço";
  const match = [...adminNav]
    .filter((i) => (i.href === "/oficina" ? path === "/oficina" : path.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Painel";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "MM";
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminShell({
  children,
  userName = "Administrador",
}: {
  children: React.ReactNode;
  userName?: string;
}) {
  const [open, setOpen] = useState(false);
  const path = usePathname() ?? "/oficina";
  const title = titleFor(path);

  return (
    <div className="min-h-dvh">
      <WelcomeTour storageKey="tutorial-tour-visto-admin" papel="admin" steps={adminTourSteps} />

      {/* sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[var(--ad-line)] bg-[var(--ad-surface)] lg:block">
        <SidebarNav />
      </aside>

      {/* drawer mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            open ? "opacity-100" : "opacity-0"
          }`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 border-r border-[var(--ad-line)] bg-[var(--ad-surface)] shadow-2xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarNav onNavigate={() => setOpen(false)} />
        </aside>
      </div>

      {/* conteúdo */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--ad-line)] bg-[var(--ad-bg)]/85 px-4 backdrop-blur-md lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            className="grid size-9 place-items-center rounded-lg adm-ink hover:bg-[var(--ad-surface-2)] lg:hidden"
          >
            <Menu className="size-6" />
          </button>

          <div className="min-w-0 flex-1">
            <p className="adm-eyebrow leading-none">Oficina</p>
            <h1 className="adm-display mt-1 truncate text-lg font-bold leading-none adm-ink">
              {title}
            </h1>
          </div>

          {/* busca (protótipo — afordância visual) */}
          <div className="hidden items-center gap-2 rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-muted lg:flex lg:w-72">
            <Search className="size-4 shrink-0" />
            <span className="flex-1 truncate">Buscar cliente, placa, OS…</span>
            <kbd className="adm-mono rounded border border-[var(--ad-line-2)] px-1.5 py-0.5 text-[0.6rem] tracking-normal adm-muted">
              ⌘K
            </kbd>
          </div>

          <Link
            href="/tutorial?papel=admin"
            aria-label="Como usar o painel"
            className="grid size-9 shrink-0 place-items-center rounded-lg adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            <HelpCircle className="size-5" />
          </Link>

          {/* bloco do usuário */}
          <div className="flex shrink-0 items-center gap-2.5 sm:border-l sm:border-[var(--ad-line)] sm:pl-3.5">
            <div className="hidden text-right leading-tight lg:block">
              <p className="truncate text-sm font-semibold adm-ink">{userName}</p>
              <p className="adm-eyebrow leading-none">Administrador</p>
            </div>
            <span className="adm-display grid size-9 shrink-0 place-items-center rounded-full bg-[var(--ad-brand)] text-sm font-bold text-white ring-2 ring-[var(--ad-brand)]/25">
              {initials(userName)}
            </span>
          </div>
        </header>

        <main className="mx-auto max-w-[1200px] p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
