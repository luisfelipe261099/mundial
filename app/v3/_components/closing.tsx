"use client";

import { business } from "../../_data/business";
import { Parallax, Reveal } from "./fx";
import { Overline, WhatsAppPrimary } from "./ui";

export function Closing() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <div className="absolute inset-0">
        <Parallax
          src="/images/v3/showroom.jpg"
          alt="Automóvel de luxo em estúdio escuro"
          className="h-full w-full"
          sizes="100vw"
          range={80}
        />
      </div>
      <div className="scrim-full" />
      <div className="absolute inset-0 bg-[var(--bg)]/30" />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-28 text-center">
        <Reveal>
          <Overline className="justify-center">{business.name} · Curitiba</Overline>
          <h2 className="v3-display mx-auto mt-6 max-w-[16ch] text-[clamp(2.4rem,6.5vw,4.8rem)] text-[var(--fg)]">
            Agende o cuidado que o seu carro merece.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--fg-2)]">
            Mande uma mensagem agora e receba um orçamento sem compromisso —
            direto com a oficina.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <WhatsAppPrimary
              label="Falar no WhatsApp"
              message="Olá! Vim pelo site e quero um orçamento para o meu carro."
            />
            <a
              href={business.phoneHref}
              className="v3-over text-[11px] text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
            >
              ou ligue · {business.phoneDisplay}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
