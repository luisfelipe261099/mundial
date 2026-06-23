"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { adminNav } from "./nav-items";
import { business } from "../../_data/business";
import { logout } from "../../login/actions";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname() ?? "/oficina";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--ad-line)] px-5">
        <Image
          src="/images/logo.png"
          alt={business.name}
          width={34}
          height={34}
          className="size-8 rounded-full ring-1 ring-[var(--ad-line)]"
        />
        <div className="leading-tight">
          <p className="adm-display text-sm font-extrabold uppercase tracking-tight adm-ink">
            {business.shortName}
          </p>
          <p className="text-[0.65rem] font-medium adm-muted">Painel da oficina</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {adminNav.map((item) => {
          const active =
            item.href === "/oficina" ? path === "/oficina" : path.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--ad-brand)]/15 adm-brand"
                  : "adm-ink hover:bg-[var(--ad-surface-2)]"
              }`}
            >
              <Icon className="size-[1.15rem]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--ad-line)] p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium adm-muted transition-colors hover:bg-[var(--ad-surface-2)]"
        >
          <ExternalLink className="size-[1.15rem]" />
          Ver site público
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-[var(--ad-surface-2)]"
          >
            <LogOut className="size-[1.15rem]" />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
