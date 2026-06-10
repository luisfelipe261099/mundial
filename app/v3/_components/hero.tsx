"use client";

import { motion, useReducedMotion } from "motion/react";
import { business } from "../../_data/business";
import { Parallax } from "./fx";
import { GhostCta, Overline, Stars, WhatsAppPrimary } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };

  return (
    <section id="topo" className="relative h-[100svh] min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Parallax
          src="/images/v3/cars-dark.jpg"
          alt="Carros esportivos em piso reflexivo — padrão de alto desempenho"
          className="h-full w-full"
          sizes="100vw"
          priority
          range={90}
        />
      </div>
      {/* scrim direcional: escurece base + esquerda (onde fica o texto),
          deixando os carros visíveis no resto do quadro */}
      <div className="scrim-b" />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/85 via-[var(--bg)]/25 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-20 sm:px-8 sm:pb-24">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-3xl">
          <motion.div variants={item}>
            <Overline>{business.name} — Curitiba</Overline>
          </motion.div>
          <motion.h1
            variants={item}
            className="v3-display mt-6 text-[clamp(2.7rem,7.5vw,6rem)] text-[var(--fg)]"
          >
            Seu carro no padrão das grandes marcas.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--fg-2)]"
          >
            Diagnóstico preciso, peças de qualidade e o orçamento combinado
            antes. A oficina de bairro com mentalidade de montadora.
          </motion.p>
          <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <WhatsAppPrimary message="Olá! Vim pelo site da Auto Mecânica Mundial e gostaria de um orçamento." />
            <GhostCta />
          </motion.div>
          <motion.div variants={item} className="mt-8 flex items-center gap-3">
            <Stars value={business.rating} size={16} />
            <span className="text-sm text-[var(--fg-2)]">
              <span className="font-semibold text-[var(--fg)]">
                {business.rating.toString().replace(".", ",")}
              </span>{" "}
              no Google · {business.reviewCount} avaliações
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Cue de rolagem */}
      <div className="pointer-events-none absolute bottom-8 right-8 z-10 hidden items-center gap-3 lg:flex">
        <span className="v3-over text-[10px] text-[var(--fg-2)]">Rolar</span>
        <motion.span
          className="block h-10 w-px bg-gradient-to-b from-[var(--fg)] to-transparent"
          animate={reduce ? {} : { scaleY: [0.4, 1, 0.4], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "top" }}
        />
      </div>
    </section>
  );
}
