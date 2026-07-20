"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, GraduationCap, LogOut } from "lucide-react";
import { adminNav } from "./nav-items";
import { business } from "../../_data/business";
import { logout } from "../../login/actions";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname() ?? "/oficina";

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--ad-line)] px-5">
        <span className="relative isolate">
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={34}
            height={34}
            className="size-8 rounded-full ring-1 ring-[var(--ad-line-strong)]"
          />
          <span className="absolute -inset-1 -z-10 rounded-full bg-[var(--ad-brand)]/25 blur-md" />
        </span>
        <div className="leading-tight">
          <p className="adm-display text-sm font-extrabold uppercase tracking-tight adm-ink">
            {business.shortName}
            <span className="adm-brand">.</span>
          </p>
          <p className="adm-eyebrow text-[0.6rem]">Painel da oficina</p>
        </div>
      </div>

      <nav data-tour="adm-nav" className="flex-1 space-y-1 overflow-y-auto p-3">
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
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-gradient-to-r from-[var(--ad-brand)]/25 to-[var(--ad-brand)]/5 adm-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] ring-1 ring-[var(--ad-brand)]/25"
                  : "adm-muted hover:bg-[var(--ad-surface-2)] hover:text-[var(--ad-ink)]"
              }`}
            >
              <span
                className={`absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--ad-brand-2)] transition-opacity ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <Icon
                className={`size-[1.15rem] transition-colors ${
                  active ? "text-[var(--ad-brand-2)]" : "group-hover:text-[var(--ad-brand-2)]"
                }`}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-[var(--ad-line)] p-3">
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            window.dispatchEvent(new Event("mundial:tour:open"));
          }}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium adm-brand transition-colors hover:bg-[var(--ad-surface-2)]"
        >
          <GraduationCap className="size-[1.15rem]" />
          Tutorial desta tela
        </button>
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium adm-muted transition-colors hover:bg-[var(--ad-surface-2)] hover:text-[var(--ad-ink)]"
        >
          <ExternalLink className="size-[1.15rem]" />
          Ver site público
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-300/90 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          >
            <LogOut className="size-[1.15rem]" />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
