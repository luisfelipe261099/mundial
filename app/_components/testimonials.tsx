import { ArrowUpRight, Quote } from "lucide-react";
import { business } from "../_data/business";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { SectionHeading } from "./section-heading";
import { Stars } from "./stars";

// Citações reais do perfil do Google. ⚠️ Adicione mais conforme coletar.
const reviews = [
  {
    quote: "Oficina limpa e dentro dos padrões de higienização.",
    author: "Cliente no Google",
    initial: "A",
  },
  {
    quote: "Agilidade, preço justo e serviço de primeira!",
    author: "Cliente no Google",
    initial: "M",
  },
];

export function Testimonials() {
  return (
    <section id="avaliacoes" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          index="03"
          eyebrow="Quem confia, recomenda"
          title="O que os clientes dizem"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {/* Painel agregado (prova social principal) */}
          <Reveal className="lg:col-span-1">
            <div className="flex h-full flex-col justify-between rounded-2xl bg-ink p-7 text-white shadow-lift">
              <div>
                <div className="tech-label text-white/50">Nota no Google</div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="font-display text-6xl font-extrabold leading-none">
                    {business.rating.toString().replace(".", ",")}
                  </span>
                  <span className="mb-1 text-white/50">/ 5</span>
                </div>
                <Stars value={business.rating} size={20} className="mt-3" />
                <p className="mt-3 text-sm text-white/70">
                  Baseado em {business.reviewCount} avaliações de clientes reais.
                </p>
              </div>
              <a
                href={business.googleReviewsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition-colors hover:text-white"
              >
                Ver avaliações no Google
                <ArrowUpRight size={16} />
              </a>
            </div>
          </Reveal>

          {/* Citações reais */}
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            {reviews.map((r) => (
              <StaggerItem key={r.quote} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-7 shadow-card">
                  <Quote size={28} className="text-brand/30" />
                  <blockquote className="mt-3 flex-1 font-display text-lg font-medium leading-snug text-ink">
                    {r.quote}
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-soft font-display font-bold text-brand">
                      {r.initial}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-ink">
                        {r.author}
                      </div>
                      <Stars value={5} size={13} />
                    </div>
                  </figcaption>
                </figure>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
