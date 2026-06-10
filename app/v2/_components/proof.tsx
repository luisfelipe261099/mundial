"use client";

import Image from "next/image";
import { business } from "../../_data/business";
import { CountUp, Reveal } from "./fx";
import { SectionIndex } from "./ui";

const diffs = [
  {
    title: "Oficina limpa e higienizada",
    desc: "Ambiente organizado e dentro dos padrões — sinal de cuidado com o seu carro.",
  },
  {
    title: "Preço combinado antes",
    desc: "Você aprova o orçamento antes de qualquer serviço. Sem surpresa na conta.",
  },
  {
    title: "Agilidade no atendimento",
    desc: "Seu tempo importa: serviço de primeira, ágil e sem enrolação.",
  },
  {
    title: "Diagnóstico honesto",
    desc: "Explicamos o que o carro precisa agora — e o que pode esperar.",
  },
];

export function Proof() {
  return (
    <section id="confianca" className="relative bg-[var(--ink-2)] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          {/* Texto + diferenciais */}
          <div className="lg:col-span-7">
            <Reveal>
              <SectionIndex n="03" label="Por que a Mundial" />
              <h2 className="v2-display mt-7 max-w-[16ch] text-[clamp(2rem,5.2vw,3.7rem)] text-[var(--paper)]">
                Confiança que aparece{" "}
                <span className="text-[var(--signal)]">nas avaliações</span>.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--paper-2)]">
                Nota {business.rating.toString().replace(".", ",")} com{" "}
                {business.reviewCount} avaliações no Google não é sorte. É oficina
                limpa, preço combinado antes e diagnóstico que explica.
              </p>
            </Reveal>

            <div className="mt-10">
              {diffs.map((d, i) => (
                <Reveal key={d.title} delay={i * 0.06}>
                  <div className="flex items-baseline gap-5 border-t border-[var(--line)] py-5">
                    <span className="v2-mono shrink-0 text-[11px] text-[var(--signal)]">
                      0{i + 1}
                    </span>
                    <div>
                      <h3 className="v2-display text-xl text-[var(--paper)]">{d.title}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">{d.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          {/* Foto tratada */}
          <div className="lg:col-span-5">
            <Reveal delay={0.1}>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] border border-[var(--line-2)]">
                <Image
                  src="/images/real-garage.jpg"
                  alt="Interior da Auto Mecânica Mundial: carro no elevador e equipamentos de diagnóstico"
                  fill
                  sizes="(max-width: 1024px) 100vw, 440px"
                  className="duotone object-cover"
                />
                <div className="signal-tint" />
                <div className="grain" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-[3] p-6">
                  <div className="v2-mono mb-1.5 text-[10px] text-[var(--signal)]">Estrutura completa</div>
                  <p className="text-sm text-[var(--paper)]">
                    Elevador, scanner e equipamento profissional na nossa oficina.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Faixa de números (count-up) */}
        <Reveal delay={0.1}>
          <div className="mt-16 grid grid-cols-1 divide-y divide-[var(--line)] border-y border-[var(--line)] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <Stat value={business.rating} decimals={1} label="Nota no Google" />
            <Stat value={business.reviewCount} label="Avaliações reais" />
            <Stat value={100} suffix="%" label="Orçamento aprovado antes" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Stat({
  value,
  decimals = 0,
  suffix = "",
  label,
}: {
  value: number;
  decimals?: number;
  suffix?: string;
  label: string;
}) {
  return (
    <div className="px-2 py-8 text-center sm:px-6">
      <CountUp
        to={value}
        decimals={decimals}
        suffix={suffix}
        className="v2-display block text-[clamp(2.8rem,6vw,4.5rem)] leading-none text-[var(--paper)]"
      />
      <div className="v2-mono mt-3 text-[10px] text-[var(--muted)]">{label}</div>
    </div>
  );
}
