"use client";

import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Reveal } from "./fx";
import { SectionIndex } from "./ui";

type Service = { name: string; desc: string; img: string };

const services: Service[] = [
  { name: "Diagnóstico eletrônico", desc: "Scanner LAUNCH lê a falha com precisão antes de qualquer peça.", img: "/images/real-diagnostic.jpg" },
  { name: "Troca de óleo & filtros", desc: "Óleo MOTUL e filtros, com checagem completa de níveis.", img: "/images/real-garage.jpg" },
  { name: "Freios & suspensão", desc: "Pastilhas, discos, amortecedores e direção no ponto.", img: "/images/real-garage.jpg" },
  { name: "Câmbio automático · CVT", desc: "Troca de fluido com equipamento Tecnomotor.", img: "/images/real-diagnostic.jpg" },
  { name: "Veículos híbridos", desc: "Manutenção especializada pra carros híbridos.", img: "/images/real-diagnostic.jpg" },
  { name: "Revisão completa", desc: "Revisão preventiva ponto a ponto, do motor à elétrica.", img: "/images/real-garage.jpg" },
];

export function Services() {
  const [active, setActive] = useState(0);

  return (
    <section id="servicos" className="relative bg-[var(--ink)] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionIndex n="02" label="O que fazemos" />
          <h2 className="v2-display mt-7 max-w-[18ch] text-[clamp(2rem,5.2vw,3.7rem)] text-[var(--paper)]">
            Tudo que seu carro precisa,{" "}
            <span className="text-[var(--signal)]">num lugar só</span>.
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_minmax(340px,440px)]">
          {/* Lista */}
          <div onMouseLeave={() => setActive(0)}>
            <ul className="border-t border-[var(--line)]">
            {services.map((s, i) => (
              <li key={s.name}>
                <div
                  onMouseEnter={() => setActive(i)}
                  className="group grid cursor-default grid-cols-[auto_1fr] items-center gap-x-5 gap-y-1 border-b border-[var(--line)] py-6 md:grid-cols-[auto_1fr_auto]"
                >
                  <span
                    className={`v2-mono text-[11px] transition-colors ${
                      active === i ? "text-[var(--signal)]" : "text-[var(--muted)]"
                    }`}
                  >
                    0{i + 1}
                  </span>
                  <span
                    className={`v2-display flex items-center gap-3 text-[clamp(1.35rem,3vw,2.15rem)] transition-all duration-300 ${
                      active === i
                        ? "translate-x-2 text-[var(--paper)]"
                        : "text-[var(--paper-2)]"
                    }`}
                  >
                    {s.name}
                    <ArrowUpRight
                      size={22}
                      className={`shrink-0 text-[var(--signal)] transition-all duration-300 ${
                        active === i ? "opacity-100" : "-translate-x-2 opacity-0"
                      }`}
                    />
                  </span>
                  <span className="col-start-2 max-w-[30ch] text-sm leading-snug text-[var(--muted)] md:col-start-3 md:text-right">
                    {s.desc}
                  </span>
                </div>
              </li>
            ))}
            </ul>
            <p className="mt-6 text-sm text-[var(--muted)]">
              E também: alinhamento, balanceamento, injeção eletrônica, embreagem, motor e elétrica.
            </p>
          </div>

          {/* Preview com crossfade (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] border border-[var(--line-2)]">
                {services.map((s, i) => (
                  <div
                    key={s.name}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      active === i ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={s.img}
                      alt={s.name}
                      fill
                      sizes="440px"
                      className="duotone object-cover"
                    />
                  </div>
                ))}
                <div className="signal-tint" />
                <div className="grain" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--ink)] via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-[3] p-6">
                  <div className="v2-mono mb-2 text-[10px] text-[var(--signal)]">
                    Serviço 0{active + 1} / 0{services.length}
                  </div>
                  <div className="v2-display text-2xl text-[var(--paper)]">
                    {services[active].name}
                  </div>
                </div>
                {/* colchetes técnicos */}
                <span className="absolute left-3 top-3 z-[3] h-4 w-4 border-l border-t border-[var(--signal)]" />
                <span className="absolute right-3 top-3 z-[3] h-4 w-4 border-r border-t border-[var(--signal)]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
