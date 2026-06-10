"use client";

import { ShieldCheck, Sparkles, Star, Timer } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { business } from "../_data/business";
import { AgendarButton, WhatsAppButton } from "./cta";
import { RatingGauge } from "./rating-gauge";

const EASE = [0.22, 1, 0.36, 1] as const;

const chips = [
  { icon: ShieldCheck, label: "Oficina higienizada" },
  { icon: Sparkles, label: "Preço justo" },
  { icon: Timer, label: "Serviço ágil" },
];

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  };

  return (
    <section id="topo" className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 aura" />
      <div className="pointer-events-none absolute inset-0 -z-10 blueprint blueprint-fade" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-28 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:gap-10 lg:pb-28 lg:pt-36">
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item}>
            <span className="tech-label inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-brand">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Curitiba/PR · {business.category}
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 font-display text-[2.05rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-6xl"
          >
            Seu carro nas mãos de{" "}
            <span className="relative whitespace-nowrap text-brand">
              quem cuida
              <UnderStroke />
            </span>{" "}
            de verdade.
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-xl text-lg leading-relaxed text-body"
          >
            Manutenção e reparo com diagnóstico honesto e oficina limpa. Você
            entende o que o seu carro precisa — e paga um preço justo por isso.
          </motion.p>

          <motion.div
            variants={item}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <AgendarButton />
            <WhatsAppButton
              label="Falar no WhatsApp"
              message="Olá! Vim pelo site da Auto Mecânica Mundial e gostaria de um orçamento."
            />
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <li className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <Star size={16} className="text-star" fill="currentColor" />
              {business.rating.toString().replace(".", ",")}
              <span className="font-normal text-muted">
                ({business.reviewCount} avaliações)
              </span>
            </li>
            {chips.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-1.5 text-sm text-body"
              >
                <c.icon size={16} className="text-brand" />
                {c.label}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Coluna direita: foto real + cards de dados flutuando (profundidade) */}
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] ring-1 ring-line shadow-lift">
            <Image
              src="/images/real-diagnostic.jpg"
              alt="Diagnóstico eletrônico com scanner em um BMW na Auto Mecânica Mundial"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 560px"
              className="object-cover object-top"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />

            <span className="tech-label absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-ink/70 px-3 py-1.5 text-white backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
              Ao vivo na oficina
            </span>

            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-surface/95 p-3 shadow-card backdrop-blur">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <ShieldCheck size={20} />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-bold text-ink">
                  Orçamento antes do serviço
                </div>
                <div className="text-xs text-muted">sem surpresa na conta</div>
              </div>
            </div>
          </div>

          {/* Velocímetro de nota: abaixo da imagem no mobile/tablet (sem
              sobrepor o card "Orçamento antes do serviço") e flutuando no
              canto só no desktop, onde há folga lateral entre as colunas. */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            className="mx-auto mt-6 w-[260px] max-w-full lg:absolute lg:-bottom-7 lg:-left-10 lg:mt-0 lg:w-[250px]"
          >
            <RatingGauge className="" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function UnderStroke() {
  const reduce = useReducedMotion();
  return (
    <svg
      className="absolute -bottom-2 left-0 h-3 w-full"
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <motion.path
        d="M2 8 C 50 2, 150 2, 198 7"
        stroke="var(--color-accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.7, ease: EASE }}
      />
    </svg>
  );
}
