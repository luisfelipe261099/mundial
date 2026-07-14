"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, GraduationCap, X } from "lucide-react";
import { resolveTour, type Tour, type TourTheme } from "./tours";

// Prefixo das CSS vars de cada área (--app-* | --ad-* | --mec-*).
const VAR_PREFIX: Record<TourTheme, string> = {
  app: "app",
  oficina: "ad",
  mecanico: "mec",
};

const STORAGE_PREFIX = "mundial:tour:done:";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface Measure {
  step: number;
  rect: Rect | null;
}

function isVisible(el: Element): boolean {
  const r = el.getBoundingClientRect();
  return r.width > 4 && r.height > 4;
}

// Acha o primeiro alvo visível dentre os seletores do passo.
function findTarget(sel?: string | string[]): HTMLElement | null {
  if (!sel) return null;
  const list = Array.isArray(sel) ? sel : [sel];
  for (const s of list) {
    const nodes = document.querySelectorAll<HTMLElement>(s);
    for (const n of nodes) {
      if (isVisible(n)) return n;
    }
  }
  return null;
}

// Resolve o tour da rota atual e recria o runner (key) a cada troca de tour,
// zerando o estado sem setState síncrono dentro de efeito.
export default function GuidedTour({ theme }: { theme: TourTheme }) {
  const path = usePathname() ?? "";
  const tour = useMemo(() => resolveTour(theme, path), [theme, path]);
  if (!tour) return null;
  return <TourRunner key={tour.id} tour={tour} prefix={VAR_PREFIX[theme]} />;
}

function TourRunner({ tour, prefix: p }: { tour: Tour; prefix: string }) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [measure, setMeasure] = useState<Measure | null>(null);
  const rafRef = useRef<number | null>(null);

  const storageKey = `${STORAGE_PREFIX}${tour.id}`;
  const total = tour.steps.length;

  // Mede o alvo do passo `s` e guarda (assíncrono — dentro de callbacks).
  const measureStep = useCallback(
    (s: number) => {
      const target = findTarget(tour.steps[s]?.sel);
      if (!target) {
        setMeasure({ step: s, rect: null });
        return;
      }
      const r = target.getBoundingClientRect();
      setMeasure({ step: s, rect: { top: r.top, left: r.left, width: r.width, height: r.height } });
    },
    [tour],
  );

  const markDone = useCallback(() => {
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* storage indisponível */
    }
  }, [storageKey]);

  const finish = useCallback(() => {
    setRunning(false);
    markDone();
  }, [markDone]);

  // Abertura sob demanda pelo menu ("Tutorial"), via evento global.
  useEffect(() => {
    const onOpen = () => {
      setStep(0);
      setMeasure(null);
      setRunning(true);
    };
    window.addEventListener("mundial:tour:open", onOpen);
    return () => window.removeEventListener("mundial:tour:open", onOpen);
  }, []);

  // Auto-start uma vez por página (na primeira visita). setState só no timeout.
  useEffect(() => {
    let done = false;
    try {
      done = localStorage.getItem(storageKey) === "1";
    } catch {
      done = false;
    }
    if (done) return;
    const t = setTimeout(() => setRunning(true), 650);
    return () => clearTimeout(t);
  }, [storageKey]);

  // Ao trocar de passo: rola o alvo pra vista e mede (setState no timeout/rAF).
  useEffect(() => {
    if (!running) return;
    const target = findTarget(tour.steps[step]?.sel);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    const t = setTimeout(() => measureStep(step), target ? 320 : 0);
    return () => clearTimeout(t);
  }, [running, step, tour, measureStep]);

  // Acompanha scroll/resize enquanto roda.
  useEffect(() => {
    if (!running) return;
    const onMove = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => measureStep(step));
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running, step, measureStep]);

  // Trava o scroll do body durante o tour (efeito colateral, não setState).
  useEffect(() => {
    if (!running) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [running]);

  // Teclado: setas e ESC (setState em handler — ok).
  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") setStep((s) => Math.min(s + 1, total - 1));
      else if (e.key === "ArrowLeft") setStep((s) => Math.max(s - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, total, finish]);

  const current = tour.steps[step];
  const isLast = step === total - 1;
  const ready = measure?.step === step;
  const rect = ready ? measure?.rect ?? null : null;

  const surface = `var(--${p}-surface)`;
  const surface2 = `var(--${p}-surface-2)`;
  const ink = `var(--${p}-ink)`;
  const muted = `var(--${p}-muted)`;
  const line = `var(--${p}-line)`;
  const brand = `var(--${p}-brand)`;

  // Botão flutuante para (re)abrir o tutorial da página.
  if (!running) {
    return (
      <button
        type="button"
        onClick={() => {
          setStep(0);
          setMeasure(null);
          setRunning(true);
        }}
        aria-label="Abrir tutorial desta tela"
        className="fixed bottom-20 right-4 z-[80] flex items-center gap-2 rounded-full px-4 py-3 text-sm font-semibold shadow-lg transition-transform hover:scale-105 active:scale-95 lg:bottom-6"
        style={{ background: brand, color: "#fff" }}
      >
        <GraduationCap className="size-5" />
        <span className="hidden sm:inline">Tutorial</span>
      </button>
    );
  }

  // Geometria do spotlight + posição do card.
  const pad = 8;
  const spot = rect
    ? {
        top: Math.max(rect.top - pad, 6),
        left: Math.max(rect.left - pad, 6),
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      }
    : null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 360;
  const vh = typeof window !== "undefined" ? window.innerHeight : 640;
  const cardW = Math.min(340, vw - 24);

  let cardTop: number;
  let cardLeft: number;
  if (spot) {
    const below = spot.top + spot.height + 12;
    cardTop = vh - below > 240 ? below : Math.max(spot.top - 12 - 232, 12);
    cardLeft = Math.min(Math.max(spot.left, 12), vw - cardW - 12);
  } else {
    cardTop = vh / 2 - 130;
    cardLeft = vw / 2 - cardW / 2;
  }

  return (
    <div className="fixed inset-0 z-[90]" aria-live="polite" role="dialog" aria-modal="true">
      {/* Overlay + recorte (spotlight) via box-shadow gigante. */}
      {spot ? (
        <div
          className="pointer-events-none absolute transition-all duration-300"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            borderRadius: 12,
            boxShadow: "0 0 0 9999px rgba(2,6,16,0.72)",
            outline: `2px solid ${brand}`,
          }}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: "rgba(2,6,16,0.72)" }} />
      )}

      {/* Card do passo */}
      <div
        className="no-scrollbar absolute overflow-y-auto rounded-2xl border p-4 shadow-2xl transition-all duration-200"
        style={{
          top: cardTop,
          left: cardLeft,
          width: cardW,
          maxHeight: "min(78vh, 560px)",
          background: surface,
          borderColor: line,
          color: ink,
        }}
      >
        <div className="mb-1 flex items-center justify-between">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold"
            style={{ background: surface2, color: brand }}
          >
            <GraduationCap className="size-3.5" />
            Passo {step + 1} de {total}
          </span>
          <button
            type="button"
            onClick={finish}
            aria-label="Fechar tutorial"
            className="grid size-7 place-items-center rounded-full"
            style={{ color: muted }}
          >
            <X className="size-4" />
          </button>
        </div>

        <h3 className="text-base font-bold leading-tight" style={{ color: ink }}>
          {current.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: muted }}>
          {current.body}
        </p>

        {/* Progresso */}
        <div className="mt-3 flex gap-1">
          {tour.steps.map((_, i) => (
            <span
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ background: i <= step ? brand : line }}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <button type="button" onClick={finish} className="text-xs font-semibold" style={{ color: muted }}>
            Pular tutorial
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => Math.max(s - 1, 0))}
                className="inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                style={{ borderColor: line, color: ink }}
              >
                <ChevronLeft className="size-4" />
                Voltar
              </button>
            )}
            {isLast ? (
              <button
                type="button"
                onClick={finish}
                className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold text-white"
                style={{ background: brand }}
              >
                Concluir
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
                className="inline-flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-bold text-white"
                style={{ background: brand }}
              >
                Próximo
                <ChevronRight className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
