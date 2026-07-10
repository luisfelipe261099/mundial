"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { conteudoPorPapel, papelLabel, type Papel } from "./_data/conteudo";

const PAPEIS: Papel[] = ["admin", "mecanico", "cliente"];

export function TutorialView({ papelInicial }: { papelInicial: Papel }) {
  const [papel, setPapel] = useState<Papel>(papelInicial);
  const [passo, setPasso] = useState(0);
  const passos = conteudoPorPapel[papel];
  const atual = passos[passo];

  function trocarPapel(novo: Papel) {
    setPapel(novo);
    setPasso(0);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/login" className="tut-mono mb-6 inline-flex items-center gap-1 text-xs text-[var(--tut-muted)]">
        <ChevronLeft className="size-3.5" /> Voltar ao login
      </Link>

      <h1 className="tut-display mb-1 text-2xl text-[var(--tut-ink)]">Como usar a Oficina Noturna</h1>
      <p className="mb-6 text-sm text-[var(--tut-ink-2)]">Escolha seu papel para ver o passo a passo.</p>

      <div className="mb-6 flex gap-2">
        {PAPEIS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => trocarPapel(p)}
            className={`tut-card flex-1 px-3 py-2 text-sm font-semibold transition-colors ${
              p === papel
                ? "border-[var(--tut-brand)] bg-[var(--tut-signal-soft)] text-[var(--tut-ink)]"
                : "text-[var(--tut-muted)]"
            }`}
          >
            {papelLabel[p]}
          </button>
        ))}
      </div>

      <div key={`${papel}-${passo}`} className="tut-card tut-rise p-5">
        <p className="tut-mono mb-2 text-[0.65rem] text-[var(--tut-muted)]">
          Passo {passo + 1} de {passos.length}
        </p>
        <h2 className="tut-display mb-3 text-lg text-[var(--tut-ink)]">{atual.titulo}</h2>
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-[var(--tut-line)]">
          <Image src={atual.imagem} alt={atual.titulo} fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover object-top" />
        </div>
        <p className="text-sm leading-relaxed text-[var(--tut-ink-2)]">{atual.texto}</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPasso((p) => Math.max(0, p - 1))}
          disabled={passo === 0}
          className="tut-card flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[var(--tut-ink)] disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Anterior
        </button>
        <button
          type="button"
          onClick={() => setPasso((p) => Math.min(passos.length - 1, p + 1))}
          disabled={passo === passos.length - 1}
          className="tut-card flex items-center gap-1.5 border-[var(--tut-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--tut-ink)] disabled:opacity-40"
        >
          Próximo <ArrowRight className="size-4" />
        </button>
      </div>
    </main>
  );
}
