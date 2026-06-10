import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { business } from "./_data/business";

// Página de seleção: o cliente abre cada proposta e escolhe a favorita.
// As quatro versões vivem em /v1–/v4. Não indexar (é tela interna de escolha).
export const metadata: Metadata = {
  title: "Escolha a versão — Auto Mecânica Mundial",
  description: "Quatro propostas de site para a Auto Mecânica Mundial. Abra cada uma e escolha a melhor.",
  robots: { index: false, follow: false },
};

const options = [
  {
    href: "/v1",
    letter: "A",
    name: "Confiança Clara",
    desc: "Clara e acolhedora, no azul de confiança. Direta e fácil de navegar.",
    img: "/previews/v1.png",
  },
  {
    href: "/v2",
    letter: "B",
    name: "Oficina Noturna",
    desc: "Escura e cinematográfica, com energia automotiva e ar editorial.",
    img: "/previews/v2.png",
  },
  {
    href: "/v3",
    letter: "C",
    name: "Grande Marca",
    desc: "Sofisticada, no padrão das montadoras. Imersiva e premium.",
    img: "/previews/v3.png",
  },
  {
    href: "/v4",
    letter: "D",
    name: "Essencial",
    desc: "Minimalista no estilo Apple. Elegante e direta ao ponto.",
    img: "/previews/v4.png",
  },
];

export default function Chooser() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-bg">
      <div className="pointer-events-none absolute inset-0 -z-10 aura" />
      <div className="pointer-events-none absolute inset-0 -z-10 blueprint blueprint-fade opacity-60" />

      <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-24">
        {/* Cabeçalho */}
        <div className="flex items-center gap-2.5">
          <Image src="/images/logo.png" alt={business.name} width={40} height={40} className="h-10 w-10 rounded-full ring-1 ring-line" />
          <span className="font-display text-lg font-extrabold uppercase tracking-tight text-ink">
            {business.shortName}<span className="text-accent">.</span>
          </span>
        </div>

        {/* Título */}
        <div className="mt-12 max-w-2xl">
          <span className="tech-label inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-brand">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Proposta de site · {business.name}
          </span>
          <h1 className="mt-6 font-display text-[2.1rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
            Escolha a sua versão favorita.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-body">
            Criamos quatro caminhos diferentes para o site da oficina. Abra cada
            um, compare com calma e escolha o que mais combina com a Mundial.
          </p>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {options.map((o, i) => (
            <Link
              key={o.href}
              href={o.href}
              className="group block overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
            >
              <div className="relative aspect-[16/10] overflow-hidden border-b border-line bg-bg">
                <Image
                  src={o.img}
                  alt={`Prévia da versão ${o.letter} — ${o.name}`}
                  fill
                  priority={i < 2}
                  sizes="(max-width: 640px) 100vw, 520px"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute left-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-bold text-white shadow-card">
                  {o.letter}
                </span>
              </div>
              <div className="p-6">
                <h2 className="font-display text-xl font-bold text-ink">{o.name}</h2>
                <p className="mt-2 text-sm leading-relaxed text-body">{o.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
                  Ver versão
                  <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <p className="mt-10 text-sm text-muted">
          Dica: dentro de cada versão há um seletor <strong className="font-semibold text-body">A · B · C · D</strong> no canto inferior para pular entre elas — e o link “Versão” volta para esta tela.
        </p>
      </div>
    </main>
  );
}
