"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Bell, ArrowLeft } from "lucide-react";

const TAB_ROOTS = ["/app", "/app/veiculos", "/app/servicos", "/app/perfil"];

function titleFor(path: string): string {
  if (path === "/app") return "";
  if (path === "/app/veiculos") return "Meus Veículos";
  if (path.startsWith("/app/veiculos/")) return "Veículo";
  if (path.startsWith("/app/servicos")) return "Serviços";
  if (path.startsWith("/app/agendar")) return "Agendamento";
  if (path === "/app/historico") return "Histórico";
  if (path.startsWith("/app/historico/")) return "Ordem de serviço";
  if (path === "/app/orcamentos") return "Orçamentos";
  if (path.startsWith("/app/orcamentos/")) return "Orçamento";
  if (path.startsWith("/app/acompanhar")) return "Acompanhar";
  if (path.startsWith("/app/solicitar")) return "Solicitar orçamento";
  if (path.startsWith("/app/documentos")) return "Documentos";
  if (path.startsWith("/app/notificacoes")) return "Notificações";
  if (path.startsWith("/app/perfil")) return "Perfil";
  return "";
}

// Detalhe/fluxo volta para o "pai" lógico; aba-raiz mostra o menu.
function parentFor(path: string): string {
  const seg = path.split("/").filter(Boolean);
  if (seg.length >= 3) return "/" + seg.slice(0, -1).join("/");
  return "/app";
}

export default function TopBar({ onMenu, unread }: { onMenu: () => void; unread: number }) {
  const path = usePathname() ?? "/app";
  const isTabRoot = TAB_ROOTS.includes(path);
  const title = titleFor(path);
  const naoLidas = unread;
  const showBell = !path.startsWith("/app/notificacoes");

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 px-4">
      <div className="flex w-10 justify-start">
        {isTabRoot ? (
          <button
            type="button"
            onClick={onMenu}
            aria-label="Abrir menu"
            className="grid size-10 place-items-center rounded-full text-[var(--app-ink)] transition-colors hover:bg-[var(--app-surface-2)] lg:hidden"
          >
            <Menu className="size-6" />
          </button>
        ) : (
          <Link
            href={parentFor(path)}
            aria-label="Voltar"
            className="grid size-10 place-items-center rounded-full text-[var(--app-ink)] transition-colors hover:bg-[var(--app-surface-2)]"
          >
            <ArrowLeft className="size-6" />
          </Link>
        )}
      </div>

      <h1 className="app-display truncate text-base font-bold t-ink">{title}</h1>

      <div className="flex w-10 justify-end">
        {showBell && (
          <Link
            href="/app/notificacoes"
            aria-label="Notificações"
            className="relative grid size-10 place-items-center rounded-full text-[var(--app-ink)] transition-colors hover:bg-[var(--app-surface-2)]"
          >
            <Bell className="size-6" />
            {naoLidas > 0 && (
              <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-[var(--app-brand)] px-1 text-[0.6rem] font-bold leading-none text-white">
                {naoLidas}
              </span>
            )}
          </Link>
        )}
      </div>
    </header>
  );
}
