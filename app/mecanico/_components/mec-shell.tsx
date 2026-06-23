"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, SignalHigh, Wifi, BatteryFull } from "lucide-react";
import { business } from "../../_data/business";

export default function MecShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/mecanico";
  const isDetail = path !== "/mecanico";

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[#05070c] sm:py-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-[var(--mec-bg)] sm:h-[860px] sm:max-h-[92dvh] sm:w-[400px] sm:rounded-[2.3rem] sm:border sm:border-[var(--mec-line)] sm:shadow-2xl">
        <div className="hidden shrink-0 items-center justify-between px-6 pb-1 pt-3 text-xs font-semibold mec-ink sm:flex">
          <span>9:41</span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <SignalHigh className="size-4" />
            <Wifi className="size-4" />
            <BatteryFull className="size-5" />
          </span>
        </div>

        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-[var(--mec-line)] px-4">
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
            {!isDetail && <p className="text-[0.65rem] font-medium mec-muted">Área do mecânico</p>}
          </div>
        </header>

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
