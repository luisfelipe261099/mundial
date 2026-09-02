import Image from "next/image";
import { MapPin, Clock } from "lucide-react";
import { business } from "../../_data/business";
import { LigarCta, Stars, WhatsAppCta } from "./ui";

/* Dobra que responde as 4 perguntas de quem chegou por "oficina perto de
   mim": é confiável? onde fica? quanto custa? como falo? Tudo estático —
   nada entra animado, nada conta pra cima. */

export function Hero() {
  return (
    <section id="topo" className="border-b border-[var(--linha)] bg-[var(--papel)]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div>
          <p className="t-label">Oficina mecânica · Uberaba, Curitiba/PR</p>

          <h1 className="t-display mt-4 max-w-[21ch] text-[var(--tinta)]">
            Mecânica sem susto: orçamento por escrito antes de qualquer serviço.
          </h1>

          <p className="t-lede mt-5 max-w-[54ch]">
            Diagnóstico com scanner, elevador e mecânico que explica cada peça
            antes de trocar. Você aprova o orçamento no WhatsApp — a gente
            executa pelo preço combinado.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <WhatsAppCta message="Olá! Vim pelo site e gostaria de um orçamento para o meu carro." />
            <LigarCta />
          </div>

          {/* Linha de fatos — estática, cada item verificável. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-[var(--linha)] pt-6">
            <a
              href={business.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5"
            >
              <Stars value={business.rating} size={17} />
              <span className="t-small font-semibold text-[var(--tinta)]">
                {business.rating.toString().replace(".", ",")}
              </span>
              <span className="t-small text-[var(--tinta-2)] underline underline-offset-4">
                {business.reviewCount} avaliações no Google
              </span>
            </a>
            <span className="t-small flex items-center gap-1.5 text-[var(--tinta-2)]">
              <MapPin size={15} className="shrink-0 text-[var(--azul-link)]" />
              {business.address.street} — {business.address.district}
            </span>
            <span className="t-small flex items-center gap-1.5 text-[var(--tinta-2)]">
              <Clock size={15} className="shrink-0 text-[var(--azul-link)]" />
              Seg–Sex 8h–18h · Sáb 8h–12h
            </span>
          </div>
        </div>

        {/* Foto real, cor integral, sem filtro — com legenda factual. */}
        <figure className="foto-card">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[5px]">
            <Image
              src="/images/real-diagnostic.jpg"
              alt="Mecânico da Auto Mecânica Mundial fazendo diagnóstico com scanner em um BMW de capô aberto, na frente da oficina"
              fill
              priority
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="t-small px-2 pb-1 pt-2.5 text-[var(--tinta-2)]">
            Diagnóstico com scanner na porta da oficina, no Uberaba.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
