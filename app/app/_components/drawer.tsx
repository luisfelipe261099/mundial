"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, MessageCircle, GraduationCap, LogOut } from "lucide-react";
import { drawerNav } from "./nav-items";
import { business, whatsappUrl } from "../../_data/business";
import { logout } from "../../login/actions";

export default function Drawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const path = usePathname() ?? "/app";

  return (
    <div
      className={`absolute inset-0 z-50 ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      {/* backdrop */}
      <button
        type="button"
        tabIndex={open ? 0 : -1}
        aria-label="Fechar menu"
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* painel */}
      <nav
        className={`absolute inset-y-0 left-0 flex w-[80%] max-w-[300px] flex-col border-r border-[var(--app-line)] bg-[var(--app-surface)] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-6">
          <div className="flex items-center gap-2.5">
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
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-9 place-items-center rounded-full text-[var(--app-ink)] hover:bg-[var(--app-surface-2)]"
          >
            <X className="size-5" />
          </button>
        </div>

        <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {drawerNav.map((item) => {
            const active =
              item.href === "/app" ? path === "/app" : path.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium transition-colors ${
                    active
                      ? "bg-[var(--app-brand)]/15 t-brand"
                      : "t-ink hover:bg-[var(--app-surface-2)]"
                  }`}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="space-y-1 border-t border-[var(--app-line)] p-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.dispatchEvent(new Event("mundial:tour:open"));
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.95rem] font-medium t-brand transition-colors hover:bg-[var(--app-surface-2)]"
          >
            <GraduationCap className="size-5" />
            Tutorial desta tela
          </button>
          <a
            href={whatsappUrl("Olá! Falo pelo app e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-medium t-ink transition-colors hover:bg-[var(--app-surface-2)]"
          >
            <MessageCircle className="size-5 text-emerald-400" />
            Falar no WhatsApp
          </a>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[0.95rem] font-medium text-rose-300/90 transition-colors hover:bg-[var(--app-surface-2)]"
            >
              <LogOut className="size-5" />
              Sair
            </button>
          </form>
        </div>
      </nav>
    </div>
  );
}
