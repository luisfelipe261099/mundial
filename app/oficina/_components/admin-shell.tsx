"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { SidebarNav } from "./sidebar-nav";
import { adminNav } from "./nav-items";
import GuidedTour from "../../_components/tour/guided-tour";

function titleFor(path: string): string {
  if (path.startsWith("/oficina/ordens/")) return "Ordem de Serviço";
  const match = [...adminNav]
    .filter((i) => (i.href === "/oficina" ? path === "/oficina" : path.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length)[0];
  return match?.label ?? "Painel";
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const path = usePathname() ?? "/oficina";
  const title = titleFor(path);

  return (
    <div className="min-h-dvh">
      {/* sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[var(--ad-line)] bg-[var(--ad-surface)]/80 backdrop-blur-xl lg:block">
        <SidebarNav />
      </aside>

      {/* drawer mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
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
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[var(--ad-line)] bg-[var(--ad-bg)]/75 px-4 backdrop-blur-xl lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Abrir menu"
            data-tour="adm-menu"
            className="grid size-9 place-items-center rounded-lg adm-ink transition-colors hover:bg-[var(--ad-surface-2)] lg:hidden"
          >
            <Menu className="size-6" />
          </button>
          <h1 className="adm-display flex-1 truncate text-lg font-bold adm-ink">{title}</h1>
          <div className="hidden w-56 items-center gap-2 rounded-xl border border-[var(--ad-line-strong)] bg-[rgba(7,10,19,0.45)] px-3 py-2 text-sm adm-muted transition-colors hover:border-[rgba(148,163,184,0.35)] sm:flex">
            <Search className="size-4" />
            Buscar…
          </div>
          <span className="adm-display grid size-9 shrink-0 place-items-center rounded-full bg-[image:var(--ad-grad)] text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_6px_14px_-6px_rgba(37,99,235,0.6)]">
            MM
          </span>
        </header>

        <main className="mx-auto max-w-[1200px] p-5 lg:p-8">{children}</main>
      </div>

      <GuidedTour theme="oficina" />
    </div>
  );
}
