"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { business } from "../_data/business";
import { Stars } from "./stars";

const MAX = 5;
const VALUE = business.rating; // 4.7
const FRACTION = VALUE / MAX; // 0.94
const EASE = [0.22, 1, 0.36, 1] as const;

// Geometria do velocímetro (semicírculo superior).
const CX = 100;
const CY = 104;
const R = 84;
const NEEDLE = 62;

/**
 * Medidor animado tipo velocímetro — elemento "signature".
 * Une prova social (nota real) + tema automotivo. Ao entrar na tela,
 * o arco preenche, o ponteiro varre e o número conta até 4,7.
 */
export function RatingGauge({ className = "max-w-[330px]" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();

  const progress = useMotionValue(reduce ? 1 : 0);
  const [display, setDisplay] = useState(reduce ? VALUE : 0);

  // Ponteiro: θ vai de π (esquerda, nota 0) até π + FRACTION·π (nota 4,7).
  const x2 = useTransform(progress, (p) => {
    const theta = Math.PI + p * FRACTION * Math.PI;
    return CX + NEEDLE * Math.cos(theta);
  });
  const y2 = useTransform(progress, (p) => {
    const theta = Math.PI + p * FRACTION * Math.PI;
    return CY + NEEDLE * Math.sin(theta);
  });

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(progress, 1, { duration: 1.5, ease: EASE });
    const unsub = progress.on("change", (p) => setDisplay(p * VALUE));
    return () => {
      controls.stop();
      unsub();
    };
  }, [inView, reduce, progress]);

  return (
    <div
      ref={ref}
      className={`relative w-full rounded-3xl border border-line bg-surface/95 p-6 shadow-lift backdrop-blur ${className}`}
    >
      <div className="tech-label mb-1 text-muted">Avaliação · Google</div>

      <svg viewBox="0 0 200 124" className="w-full" aria-hidden="true">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--color-brand)" />
            <stop offset="100%" stopColor="var(--color-accent)" />
          </linearGradient>
        </defs>

        {/* Trilho de fundo */}
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="var(--color-line)"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Arco preenchido (anima pathLength 0 → FRACTION) */}
        <motion.path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="14"
          strokeLinecap="round"
          initial={{ pathLength: reduce ? FRACTION : 0 }}
          animate={inView ? { pathLength: FRACTION } : undefined}
          transition={{ duration: 1.5, ease: EASE }}
        />

        {/* Ponteiro */}
        <motion.line
          x1={CX}
          y1={CY}
          x2={x2}
          y2={y2}
          stroke="var(--color-ink)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r="7.5" fill="var(--color-ink)" />
        <circle cx={CX} cy={CY} r="3" fill="#fff" />
      </svg>

      <div className="-mt-6 flex flex-col items-center">
        <div className="font-display text-5xl font-extrabold tabular-nums text-ink">
          {display.toFixed(1).replace(".", ",")}
        </div>
        <Stars value={VALUE} size={20} className="mt-1" />
        <p className="mt-2 text-sm text-muted">
          {business.reviewCount} avaliações de clientes
        </p>
      </div>
    </div>
  );
}
