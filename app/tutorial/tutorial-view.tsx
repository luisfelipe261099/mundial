"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  LayoutDashboard,
  Wrench,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { conteudoPorPapel, papelLabel, type Papel } from "./_data/conteudo";

const PAPEIS: Papel[] = ["admin", "mecanico", "cliente"];
const PAPEL_ICON: Record<Papel, LucideIcon> = {
  admin: LayoutDashboard,
  mecanico: Wrench,
  cliente: Smartphone,
};

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
      <Link
        href="/login"
        className="tut-eyebrow mb-6 inline-flex items-center gap-1 hover:text-[var(--tut-ink-2)]"
      >
        <ChevronLeft className="size-3.5" /> Voltar ao login
      </Link>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="tut-hero mb-6 p-6">
        <p className="tut-eyebrow tut-brand-c">Central de treinamento</p>
        <h1 className="tut-display-xl mt-2 text-[2rem] text-[var(--tut-ink)]">
          Como usar a Oficina Noturna
        </h1>
        <p className="mt-2 text-sm text-[var(--tut-ink-2)]">
          Um guia passo a passo, tela por tela. Escolha seu papel e avance no seu ritmo.
        </p>
      </section>

      {/* ── Abas de papel ────────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-2">
        {PAPEIS.map((p) => {
          const Icon = PAPEL_ICON[p];
          const on = p === papel;
          return (
            <button
              key={p}
              type="button"
              onClick={() => trocarPapel(p)}
              aria-pressed={on}
              className={`tut-card flex flex-col items-center gap-1.5 px-2 py-3 text-xs font-semibold transition-colors ${
                on
                  ? "border-[var(--tut-brand)] bg-[var(--tut-signal-soft)] text-[var(--tut-ink)]"
                  : "text-[var(--tut-muted)] hover:text-[var(--tut-ink-2)]"
              }`}
            >
              <Icon className={`size-5 ${on ? "tut-brand-c" : ""}`} strokeWidth={2} />
              {papelLabel[p]}
            </button>
          );
        })}
      </div>

      {/* ── Progresso ────────────────────────────────────────────────── */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="tut-eyebrow">
          Passo {passo + 1} <span className="text-[var(--tut-line-2)]">/ {passos.length}</span>
        </p>
        <div className="flex items-center gap-1.5">
          {passos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ir para o passo ${i + 1}`}
              onClick={() => setPasso(i)}
              className={`tut-dot ${
                i === passo ? "tut-dot-active" : i < passo ? "tut-dot-done" : "tut-dot-todo"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Passo atual ──────────────────────────────────────────────── */}
      <div key={`${papel}-${passo}`} className="tut-card tut-rise overflow-hidden">
        <div className="relative aspect-[16/10] border-b border-[var(--tut-line)] bg-[var(--tut-surface-2)]">
          <Image
            src={atual.imagem}
            alt={atual.titulo}
            fill
            sizes="(max-width: 680px) 100vw, 640px"
            className="object-cover object-top"
          />
          <span className="tut-eyebrow absolute left-4 top-4 rounded-full border border-[var(--tut-line-2)] bg-black/50 px-2.5 py-1 backdrop-blur">
            {papelLabel[papel]}
          </span>
        </div>
        <div className="p-5">
          <h2 className="tut-display mb-2.5 text-xl text-[var(--tut-ink)]">{atual.titulo}</h2>
          <p className="text-sm leading-relaxed text-[var(--tut-ink-2)]">{atual.texto}</p>
        </div>
      </div>

      {/* ── Navegação ────────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setPasso((p) => Math.max(0, p - 1))}
          disabled={passo === 0}
          className="tut-card flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-[var(--tut-ink)] transition-opacity disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Anterior
        </button>
        {passo === passos.length - 1 ? (
          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-xl bg-[var(--tut-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
          >
            Concluir
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setPasso((p) => Math.min(passos.length - 1, p + 1))}
            className="flex items-center gap-1.5 rounded-xl bg-[var(--tut-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
          >
            Próximo <ArrowRight className="size-4" />
          </button>
        )}
      </div>
    </main>
  );
}
