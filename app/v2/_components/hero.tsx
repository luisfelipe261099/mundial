"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { business } from "../../_data/business";
import { Gauge } from "./fx";
import { AgendarCta, MonoTag, Stars, WhatsAppCta } from "./ui";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
  };

  return (
    <section id="topo" className="relative min-h-[100svh] overflow-hidden bg-[var(--ink)]">
      {/* Foto tratada sangrando da direita */}
      <div className="absolute inset-0 z-0">
        <div className="absolute right-0 top-0 h-full w-full lg:w-[60%]">
          <Image
            src="/images/real-diagnostic.jpg"
            alt="Diagnóstico eletrônico com scanner em um BMW na Auto Mecânica Mundial"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="duotone object-cover object-[center_30%]"
          />
          <div className="signal-tint" />
          <div className="grain" />
          {/* feather pro escuro (esquerda) + base */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--ink)] via-[var(--ink)]/55 to-[var(--ink)]/5 lg:via-[var(--ink)]/35 lg:to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent" />
          <div className="vignette" />
        </div>
      </div>

      {/* Rótulo vertical na borda (detalhe editorial) */}
      <div className="pointer-events-none absolute left-5 top-1/2 z-10 hidden -translate-y-1/2 xl:block">
        <span className="v2-mono block -rotate-180 text-[10px] tracking-[0.4em] text-[var(--muted)] [writing-mode:vertical-rl]">
          Auto Mecânica Mundial — Est. Curitiba
        </span>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-center px-5 pb-20 pt-28 sm:px-8"
      >
        <motion.div variants={item}>
          <MonoTag>Nº 01 — Oficina em Curitiba · Uberaba</MonoTag>
        </motion.div>

        <motion.h1
          variants={item}
          className="v2-display mt-7 max-w-[15ch] text-[clamp(2.7rem,8.5vw,6.4rem)] text-[var(--paper)]"
        >
          Entra com dúvida,{" "}
          <span className="relative inline-block text-[var(--signal)]">
            sai com confiança
            <motion.span
              aria-hidden
              className="absolute -bottom-1 left-0 h-[5px] w-full origin-left bg-[var(--signal)]"
              initial={{ scaleX: reduce ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.9, ease: EASE }}
            />
          </span>
          .
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--paper-2)]"
        >
          Scanner, elevador e mão de obra que explica cada peça antes de trocar.
          Você aprova o orçamento — a gente executa. Sem surpresa na conta.
        </motion.p>

        <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
          <WhatsAppCta message="Olá! Vim pelo site da Auto Mecânica Mundial e gostaria de um orçamento." />
          <AgendarCta />
        </motion.div>

        {/* Cluster de instrumentos */}
        <motion.div
          variants={item}
          className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-[var(--line)] pt-6"
        >
          <div className="flex items-center gap-2.5">
            <Stars value={business.rating} size={16} />
            <span className="v2-display text-lg text-[var(--paper)]">
              {business.rating.toString().replace(".", ",")}
            </span>
            <span className="v2-mono text-[10px] text-[var(--muted)]">Google</span>
          </div>
          <span className="hidden h-8 w-px bg-[var(--line)] sm:block" />
          <div>
            <div className="v2-display text-lg text-[var(--paper)]">{business.reviewCount}</div>
            <div className="v2-mono text-[10px] text-[var(--muted)]">avaliações reais</div>
          </div>
          <span className="hidden h-8 w-px bg-[var(--line)] sm:block" />
          <div>
            <div className="v2-display text-lg text-[var(--paper)]">100%</div>
            <div className="v2-mono text-[10px] text-[var(--muted)]">orçamento aprovado antes</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Velocímetro flutuante (desktop) */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.7, ease: EASE }}
        className="absolute bottom-10 right-8 z-10 hidden w-[230px] rounded-[6px] border border-[var(--line-2)] bg-[var(--ink-2)]/85 p-5 backdrop-blur-md xl:block"
      >
        <div className="v2-mono mb-1 text-[10px] text-[var(--muted)]">Nota no Google</div>
        <Gauge value={business.rating} />
        <div className="-mt-6 text-center">
          <span className="v2-display text-3xl text-[var(--paper)]">
            {business.rating.toString().replace(".", ",")}
          </span>
          <span className="v2-mono ml-1 text-[10px] text-[var(--muted)]">/ 5</span>
        </div>
      </motion.div>

      {/* Cue de rolagem */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex xl:left-8 xl:translate-x-0 xl:items-start">
        <span className="v2-mono text-[10px] text-[var(--muted)]">Rolar</span>
        <motion.span
          className="h-8 w-px bg-gradient-to-b from-[var(--signal)] to-transparent"
          animate={reduce ? {} : { scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </div>
    </section>
  );
}
