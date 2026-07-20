"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Papel } from "@/app/tutorial/_data/conteudo";
import "@/app/tutorial/tutorial.css";

export interface TourStep {
  titulo: string;
  texto: string;
}

export function WelcomeTour({
  storageKey,
  papel,
  steps,
}: {
  storageKey: string;
  papel: Papel;
  steps: TourStep[];
}) {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (localStorage.getItem(storageKey)) return;
    const raf = requestAnimationFrame(() => setAberto(true));
    return () => cancelAnimationFrame(raf);
  }, [storageKey]);

  function fechar() {
    localStorage.setItem(storageKey, "1");
    setAberto(false);
  }

  if (!aberto) return null;
  const atual = steps[passo];
  const ultimo = passo === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm sm:items-center">
      <div className="tut-root w-full max-w-sm">
        <div className="tut-hero tut-rise">
          <div className="relative p-5">
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-[var(--tut-muted)] hover:bg-[var(--tut-surface-2)]"
          >
            <X className="size-4" />
          </button>

          {/* stepper */}
          <div className="mb-3.5 flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`tut-dot ${
                  i === passo ? "tut-dot-active" : i < passo ? "tut-dot-done" : "tut-dot-todo"
                }`}
              />
            ))}
          </div>

          <p className="tut-eyebrow tut-brand-c mb-1.5">
            Bem-vindo · {passo + 1}/{steps.length}
          </p>
          <h2 className="tut-display mb-2 text-lg text-[var(--tut-ink)]">{atual.titulo}</h2>
          <p className="mb-5 text-sm leading-relaxed text-[var(--tut-ink-2)]">{atual.texto}</p>
          <div className="flex items-center justify-between gap-3">
            <button type="button" onClick={fechar} className="text-sm font-semibold text-[var(--tut-muted)] hover:text-[var(--tut-ink-2)]">
              Pular
            </button>
            {ultimo ? (
              <Link
                href={`/tutorial?papel=${papel}`}
                onClick={fechar}
                className="rounded-xl bg-[var(--tut-brand)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
              >
                Ver manual completo
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setPasso((p) => p + 1)}
                className="rounded-xl bg-[var(--tut-brand)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
              >
                Próximo
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
