"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, LogOut } from "lucide-react";
import { drawerNav } from "./nav-items";
import { business, whatsappUrl } from "../../_data/business";
import { logout } from "../../login/actions";

// Menu lateral — só no desktop (lg+). No mobile quem manda é a bottom-nav + drawer.
export function AppSidebar({ unread }: { unread: number }) {
  const path = usePathname() ?? "/app";

  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-[var(--app-line)] bg-[var(--app-surface)] lg:flex">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <Image
          src="/images/logo.png"
          alt={business.name}
          width={36}
          height={36}
          className="size-9 rounded-full ring-1 ring-[var(--app-line)]"
        />
        <span className="app-display text-lg font-extrabold uppercase tracking-tight t-ink">
          {business.shortName}
          <span className="t-brand">.</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {drawerNav.map((item) => {
          const active = item.href === "/app" ? path === "/app" : path.startsWith(item.href);
          const Icon = item.icon;
          const badge = item.href === "/app/notificacoes" && unread > 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "bg-[var(--app-brand)]/15 t-brand" : "t-ink hover:bg-[var(--app-surface-2)]"
              }`}
            >
              <Icon className="size-5" />
              <span className="flex-1">{item.label}</span>
              {badge && (
                <span className="grid min-h-5 min-w-5 place-items-center rounded-full bg-[var(--app-brand)] px-1 text-[0.65rem] font-bold text-white">
                  {unread}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--app-line)] p-3">
        <a
          href={whatsappUrl("Olá! Falo pelo app e gostaria de atendimento.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium t-ink transition-colors hover:bg-[var(--app-surface-2)]"
        >
          <MessageCircle className="size-5 text-emerald-400" />
          Falar no WhatsApp
        </a>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-300/90 transition-colors hover:bg-[var(--app-surface-2)]"
          >
            <LogOut className="size-5" />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
