"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav, type NavItem } from "./nav-items";

// A aba "Serviços" também acende nos fluxos que vivem dentro do hub.
const SERVICOS_PREFIXOS = [
  "/app/servicos",
  "/app/agendar",
  "/app/historico",
  "/app/orcamentos",
];

function isActive(item: NavItem, path: string): boolean {
  if (item.href === "/app") return path === "/app";
  if (item.href === "/app/servicos")
    return SERVICOS_PREFIXOS.some((p) => path.startsWith(p));
  return path.startsWith(item.href);
}

export default function BottomNav() {
  const path = usePathname() ?? "/app";

  return (
    <nav className="shrink-0 border-t border-[var(--app-line)] bg-[var(--app-surface)]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <ul className="flex items-stretch justify-around px-2 pt-1.5">
        {bottomNav.map((item) => {
          const active = isActive(item, path);
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="relative flex flex-col items-center gap-1 rounded-xl py-1.5 transition-colors"
              >
                <span
                  className={`absolute top-0 h-0.5 w-7 rounded-full transition-colors ${
                    active ? "bg-[var(--app-brand-2)]" : "bg-transparent"
                  }`}
                />
                <Icon
                  className="size-6 transition-colors"
                  style={{ color: active ? "var(--app-brand-2)" : "var(--app-muted)" }}
                  strokeWidth={active ? 2.4 : 2}
                />
                <span
                  className="text-[0.68rem] font-semibold transition-colors"
                  style={{ color: active ? "var(--app-brand-2)" : "var(--app-muted)" }}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
