"use client";

import { business } from "../../_data/business";
import { Parallax, Reveal } from "./fx";
import { Overline, Stars } from "./ui";

export function Testimonial() {
  return (
    <section
      id="avaliacoes"
      className="relative flex h-[82vh] min-h-[520px] w-full items-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <Parallax
          src="/images/v3/hero-garage.jpg"
          alt="Carro em oficina, ambiente noturno"
          className="h-full w-full"
          sizes="100vw"
          range={80}
        />
      </div>
      <div className="scrim-full" />
      <div className="absolute inset-0 bg-[var(--bg)]/25" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <Overline className="justify-center">Avaliações</Overline>
          <div className="mt-7 flex justify-center">
            <Stars value={5} size={20} />
          </div>
          <blockquote className="v3-display mx-auto mt-7 max-w-3xl text-[clamp(1.8rem,4.4vw,3.2rem)] leading-[1.12] text-[var(--fg)]">
            “Oficina limpa e dentro dos padrões de higienização.”
          </blockquote>
          <p className="mt-7 text-[var(--fg-2)]">
            Cliente no Google · {business.rating.toString().replace(".", ",")} de 5 com{" "}
            {business.reviewCount} avaliações
          </p>
          <a
            href={business.googleReviewsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="v3-over mt-5 inline-block text-[11px] text-[var(--fg)] underline-offset-4 hover:underline"
          >
            Ver no Google →
          </a>
        </Reveal>
      </div>
    </section>
  );
}
