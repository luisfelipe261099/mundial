"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { adminNavSections } from "./nav-items";
import { business } from "../../_data/business";
import { logout } from "../../login/actions";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname() ?? "/oficina";

  return (
    <div className="flex h-full flex-col">
      {/* Lockup da marca */}
      <div className="flex h-16 items-center gap-2.5 border-b border-[var(--ad-line)] px-5">
        <Image
          src="/images/logo.png"
          alt={business.name}
          width={36}
          height={36}
          className="size-9 rounded-full ring-1 ring-[var(--ad-line-2)]"
        />
        <div className="min-w-0 leading-tight">
          <p className="adm-display truncate text-sm font-extrabold uppercase tracking-tight adm-ink">
            {business.shortName}
          </p>
          <p className="flex items-center gap-1.5 text-[0.62rem] font-medium adm-muted">
            <span className="inline-block size-1.5 rounded-full bg-[var(--ad-up)]" />
            Painel da oficina
          </p>
        </div>
      </div>

      {/* Navegação agrupada */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 no-scrollbar">
        {adminNavSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <p className="adm-eyebrow px-3 pb-1">{section.title}</p>
            {section.items.map((item) => {
              const active =
                item.href === "/oficina" ? path === "/oficina" : path.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "bg-[var(--ad-brand)]/12 adm-brand"
                      : "adm-ink hover:bg-[var(--ad-surface-2)]"
                  }`}
                >
                  {/* Filete de acento no item ativo */}
                  <span
                    className={`absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--ad-brand)] transition-opacity ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <Icon
                    className={`size-[1.15rem] shrink-0 ${
                      active ? "adm-brand" : "adm-muted group-hover:adm-ink"
                    }`}
                    strokeWidth={2}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Rodapé */}
      <div className="space-y-1 border-t border-[var(--ad-line)] p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium adm-muted transition-colors hover:bg-[var(--ad-surface-2)] hover:adm-ink"
        >
          <ExternalLink className="size-[1.15rem]" strokeWidth={2} />
          Ver site público
        </Link>
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-rose-300 transition-colors hover:bg-rose-500/10"
          >
            <LogOut className="size-[1.15rem]" strokeWidth={2} />
            Sair
          </button>
        </form>
      </div>
    </div>
  );
}
