"use client";

import { business } from "../../_data/business";
import { Reveal } from "./fx";
import { SectionIndex, Stars } from "./ui";

const small = [
  { quote: "Agilidade, preço justo e serviço de primeira!", who: "Cliente no Google" },
];

export function Reviews() {
  return (
    <section id="avaliacoes" className="relative overflow-hidden bg-[var(--ink)] py-24 sm:py-32">
      {/* aspas decorativas gigantes */}
      <span
        aria-hidden
        className="v2-display pointer-events-none absolute -right-4 top-8 select-none text-[22rem] leading-none text-[var(--ink-3)]"
      >
        ”
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionIndex n="04" label="Quem confia, recomenda" />
        </Reveal>

        <div className="mt-12 grid items-start gap-12 lg:grid-cols-[1.45fr_1fr]">
          {/* Pull-quote principal */}
          <Reveal>
            <span className="v2-display block text-[5rem] leading-[0.6] text-[var(--signal)]">“</span>
            <blockquote className="v2-display mt-2 text-[clamp(1.8rem,4.2vw,3.1rem)] leading-[1.1] text-[var(--paper)]">
              Oficina limpa e dentro dos padrões de higienização.
            </blockquote>
            <div className="mt-7 flex items-center gap-4">
              <Stars value={5} size={18} />
              <span className="v2-mono text-[11px] text-[var(--muted)]">Avaliação real · Google</span>
            </div>
          </Reveal>

          {/* Bloco de nota + quotes menores */}
          <div className="space-y-5">
            <Reveal delay={0.05}>
              <div className="rounded-[6px] border border-[var(--line-2)] bg-[var(--ink-2)] p-6">
                <div className="v2-mono text-[10px] text-[var(--muted)]">Nota no Google</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="v2-display text-5xl leading-none text-[var(--paper)]">
                    {business.rating.toString().replace(".", ",")}
                  </span>
                  <span className="v2-mono pb-1 text-[11px] text-[var(--muted)]">/ 5</span>
                </div>
                <div className="mt-3">
                  <Stars value={business.rating} size={16} />
                </div>
                <p className="mt-3 text-sm text-[var(--paper-2)]">
                  Baseado em {business.reviewCount} avaliações de clientes reais.
                </p>
                <a
                  href={business.googleReviewsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="v2-mono mt-4 inline-flex items-center gap-1.5 text-[11px] text-[var(--signal)] hover:underline"
                >
                  Ver no Google →
                </a>
              </div>
            </Reveal>

            {small.map((s, i) => (
              <Reveal key={i} delay={0.1 + i * 0.05}>
                <figure className="rounded-[6px] border border-[var(--line)] p-5">
                  <Stars value={5} size={14} />
                  <blockquote className="mt-3 text-[var(--paper)]">“{s.quote}”</blockquote>
                  <figcaption className="v2-mono mt-3 text-[10px] text-[var(--muted)]">{s.who}</figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
