import { Quote } from "lucide-react";
import Image from "next/image";
import { business } from "../_data/business";
import { InstagramIcon } from "./icons";
import { Reveal } from "./motion";
import { Stars } from "./stars";

const gallery = [
  {
    src: "/images/real-diagnostic.jpg",
    alt: "Diagnóstico com scanner em um BMW",
    tall: true,
  },
  { src: "/images/real-garage.jpg", alt: "Carro no elevador da oficina", tall: false },
  {
    src: "/images/real-hybrid.jpg",
    alt: "Post sobre manutenção de veículos híbridos",
    tall: false,
  },
];

export function GarageBand() {
  return (
    <section className="relative overflow-hidden bg-ink py-24 text-white">
      {/* Fundo atmosférico: foto real da fachada, esmaecida */}
      <Image
        src="/images/real-storefront.jpg"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/60" />
      <div className="pointer-events-none absolute inset-0 blueprint opacity-[0.12]" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <div className="tech-label text-accent">Direto da oficina</div>
          <Quote size={40} className="mt-5 text-brand" />
          <blockquote className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
            “Oficina limpa e dentro dos padrões de higienização.”
          </blockquote>
          <div className="mt-6 flex items-center gap-3">
            <Stars value={5} size={18} />
            <span className="text-sm text-white/60">Avaliação real no Google</span>
          </div>
          <p className="mt-6 max-w-md text-white/70">
            Acompanhe o dia a dia da Auto Mecânica Mundial no Instagram —
            serviços, diagnósticos e os carros que passam pela oficina.
          </p>
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3.5 font-semibold text-ink transition-transform duration-200 hover:-translate-y-0.5"
          >
            <InstagramIcon size={20} />
            Seguir {business.instagramHandle}
          </a>
        </Reveal>

        <Reveal delay={0.1}>
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir o Instagram ${business.instagramHandle}`}
            className="grid grid-cols-2 gap-3"
          >
            {gallery.map((g) => (
              <div
                key={g.src}
                className={`group relative overflow-hidden rounded-2xl ring-1 ring-white/10 ${
                  g.tall ? "row-span-2 aspect-[3/4]" : "aspect-square"
                }`}
              >
                <Image
                  src={g.src}
                  alt={g.alt}
                  fill
                  sizes="(max-width: 1024px) 45vw, 260px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-ink/0 transition-colors duration-300 group-hover:bg-ink/20" />
              </div>
            ))}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
