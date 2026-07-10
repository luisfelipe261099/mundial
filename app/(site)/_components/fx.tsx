"use client";

import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

// Easing "mecânico" — arranque firme, assentamento seco. Diferente do
// ease suave da Opção A, combina com o tom industrial.
const EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  className,
  stagger = 0.08,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-70px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </motion.div>
  );
}

export function Item({
  children,
  className,
  y = 22,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduce ? { opacity: 0 } : { opacity: 0, y },
        show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** Contador que sobe quando entra na viewport. */
export function CountUp({
  to,
  decimals = 0,
  duration = 1.5,
  suffix = "",
  prefix = "",
  className,
}: {
  to: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      const raf = requestAnimationFrame(() => setVal(to));
      return () => cancelAnimationFrame(raf);
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setVal(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  const formatted = val.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/** Velocímetro de nota — semicírculo com arco animado e ponteiro. */
export function Gauge({ value, max = 5 }: { value: number; max?: number }) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(1, value / max));
  const R = 84;
  const CX = 100;
  const CY = 104;
  const arc = Math.PI * R; // comprimento do semicírculo
  const path = `M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`;
  const needleAngle = -90 + pct * 180; // -90° (esq) → +90° (dir)

  return (
    <svg viewBox="0 0 200 120" className="w-full" role="img" aria-label={`Nota ${value} de ${max}`}>
      {/* ticks da escala */}
      {Array.from({ length: 11 }).map((_, i) => {
        const a = (Math.PI * i) / 10;
        const x1 = CX - Math.cos(a) * (R + 10);
        const y1 = CY - Math.sin(a) * (R + 10);
        const x2 = CX - Math.cos(a) * (R + (i % 5 === 0 ? 2 : 6));
        const y2 = CY - Math.sin(a) * (R + (i % 5 === 0 ? 2 : 6));
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={i % 5 === 0 ? "var(--brass)" : "var(--line-2)"}
            strokeWidth={i % 5 === 0 ? 2 : 1}
          />
        );
      })}
      {/* trilho */}
      <path d={path} fill="none" stroke="var(--line)" strokeWidth="9" strokeLinecap="round" />
      {/* arco preenchido */}
      <motion.path
        d={path}
        fill="none"
        stroke="var(--signal)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={arc}
        initial={{ strokeDashoffset: reduce ? arc * (1 - pct) : arc }}
        whileInView={{ strokeDashoffset: arc * (1 - pct) }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
      />
      {/* ponteiro */}
      <motion.g
        initial={{ rotate: reduce ? needleAngle : -90 }}
        whileInView={{ rotate: needleAngle }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
        style={{ transformOrigin: `${CX}px ${CY}px` }}
      >
        <line x1={CX} y1={CY} x2={CX} y2={CY - R + 14} stroke="var(--paper)" strokeWidth="3" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r="6" fill="var(--paper)" />
        <circle cx={CX} cy={CY} r="2.5" fill="var(--ink)" />
      </motion.g>
    </svg>
  );
}
