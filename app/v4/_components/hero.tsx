"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { business } from "../../_data/business";
import { Overline, Stars, TextLink, WhatsAppPill } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();
  const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 28 },
    show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
  };

  return (
    <section id="topo" className="relative overflow-hidden bg-[var(--dark)] pb-20 pt-28 text-center sm:pt-32">
      <div className="glow pointer-events-none absolute inset-0" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-3xl px-5"
      >
        <motion.div variants={item}>
          <Overline dark>{business.name}</Overline>
        </motion.div>
        <motion.h1
          variants={item}
          className="v4-display mt-4 text-[clamp(2.6rem,7vw,5rem)] text-white"
        >
          O cuidado que seu carro merece.
        </motion.h1>
        <motion.p
          variants={item}
          className="mx-auto mt-6 max-w-xl text-[clamp(1.1rem,2.4vw,1.4rem)] leading-relaxed text-[var(--on-dark-2)]"
        >
          Diagnóstico preciso, peças de qualidade e transparência total. Mecânica
          de bairro em Curitiba, com padrão de concessionária.
        </motion.p>
        <motion.div variants={item} className="mt-8 flex flex-col items-center justify-center gap-x-7 gap-y-4 sm:flex-row">
          <WhatsAppPill message="Olá! Vim pelo site da Auto Mecânica Mundial e gostaria de um orçamento." />
          <TextLink href="/agendar" dark>Agendar horário</TextLink>
        </motion.div>
        <motion.div variants={item} className="mt-8 flex items-center justify-center gap-2.5">
          <Stars value={business.rating} size={15} tone="light" />
          <span className="text-sm text-[var(--on-dark-2)]">
            <span className="font-semibold text-white">{business.rating.toString().replace(".", ",")}</span>{" "}
            no Google · {business.reviewCount} avaliações
          </span>
        </motion.div>
      </motion.div>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 0.5, ease: EASE }}
        className="relative z-10 mx-auto mt-16 max-w-5xl px-5"
      >
        <div className="relative aspect-[16/10] overflow-hidden rounded-[24px] ring-1 ring-white/10">
          <Image
            src="/images/v3/cars-dark.jpg"
            alt="Automóveis de alto desempenho em ambiente premium"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </motion.div>
    </section>
  );
}
