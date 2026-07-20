"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, HelpCircle, LogOut } from "lucide-react";
import { business } from "../../_data/business";
import { logout } from "../../login/actions";
import { WelcomeTour } from "@/app/_components/welcome-tour";
import { mecTourSteps } from "./mec-tour-steps";

// Responsivo: mobile ocupa a tela; desktop centraliza o conteúdo (sem frame
// de celular). Top bar fixa, conteúdo rola por dentro.
export default function MecShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/mecanico";
  const isDetail = path !== "/mecanico";

  return (
    <div className="flex h-dvh flex-col bg-[var(--mec-bg)]">
      <WelcomeTour storageKey="tutorial-tour-visto-mecanico" papel="mecanico" steps={mecTourSteps} />

      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--mec-line)] bg-[var(--mec-surface)]/60 px-4 backdrop-blur">
        {isDetail ? (
          <Link
            href="/mecanico"
            aria-label="Voltar"
            className="grid size-10 place-items-center rounded-full mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
          >
            <ArrowLeft className="size-6" />
          </Link>
        ) : (
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={34}
            height={34}
            className="size-8 rounded-full ring-1 ring-[var(--mec-line)]"
          />
        )}
        <div className="min-w-0 flex-1 leading-tight">
          <p className="mec-display truncate text-sm font-bold mec-ink">
            {isDetail ? "Ordem de Serviço" : business.shortName}
          </p>
          <p className="mec-eyebrow leading-none">{isDetail ? "Painel do mecânico" : "Área do mecânico"}</p>
        </div>
        <Link
          href="/tutorial?papel=mecanico"
          aria-label="Como usar"
          className="grid size-10 place-items-center rounded-full mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
        >
          <HelpCircle className="size-5" />
        </Link>
        <form action={logout}>
          <button
            type="submit"
            aria-label="Sair"
            className="grid size-10 place-items-center rounded-full mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
          >
            <LogOut className="size-5" />
          </button>
        </form>
      </header>

      <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl">{children}</div>
      </main>
    </div>
  );
}
