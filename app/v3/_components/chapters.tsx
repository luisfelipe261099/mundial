"use client";

import { Parallax, Reveal } from "./fx";
import { Overline } from "./ui";

type Chapter = {
  n: string;
  overline: string;
  title: string;
  body: string;
  img: string;
  alt: string;
  reverse?: boolean;
  id?: string;
};

const chapters: Chapter[] = [
  {
    n: "01",
    overline: "Diagnóstico",
    title: "A falha, localizada com precisão.",
    body: "Scanner LAUNCH e leitura eletrônica para identificar exatamente o que o carro tem — e te explicar, em português claro, antes de qualquer reparo.",
    img: "/images/v3/mechanic.jpg",
    alt: "Profissional fazendo diagnóstico eletrônico de um veículo com tablet",
  },
  {
    n: "02",
    overline: "Precisão",
    title: "Peças que duram, montagem no ponto.",
    body: "Óleo MOTUL, componentes de qualidade e torque correto. O tipo de capricho que prolonga a vida do seu carro — e que normalmente fica só nas concessionárias.",
    img: "/images/v3/brake-detail.jpg",
    alt: "Detalhe de freio de alto desempenho — disco e pinça",
    reverse: true,
  },
  {
    n: "03",
    overline: "A Oficina",
    title: "Estrutura real, aqui em Curitiba.",
    body: "Elevador, scanner e equipamento profissional num ambiente limpo e organizado, no bairro Uberaba. Venha tomar um café enquanto cuidamos do seu carro.",
    img: "/images/real-garage.jpg",
    alt: "Interior real da Auto Mecânica Mundial: carro no elevador e equipamentos",
    id: "oficina",
  },
];

export function Chapters() {
  return (
    <section id="competencias" className="relative bg-[var(--bg)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] space-y-24 px-5 sm:space-y-36 sm:px-8">
        {chapters.map((c) => (
          <div
            key={c.n}
            id={c.id}
            className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
          >
            <Parallax
              src={c.img}
              alt={c.alt}
              sizes="(max-width: 1024px) 100vw, 600px"
              className={`h-[56vh] min-h-[400px] rounded-[3px] lg:h-[76vh] ${
                c.reverse ? "lg:order-2" : ""
              }`}
            />
            <Reveal className={c.reverse ? "lg:order-1" : ""}>
              <div className="flex items-end gap-4">
                <span className="v3-display text-[clamp(3rem,7vw,5.5rem)] leading-[0.8] text-[var(--surface-2)]">
                  {c.n}
                </span>
                <Overline className="pb-2">{c.overline}</Overline>
              </div>
              <h2 className="v3-display mt-5 max-w-[14ch] text-[clamp(2rem,4.6vw,3.4rem)] text-[var(--fg)]">
                {c.title}
              </h2>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[var(--fg-2)]">
                {c.body}
              </p>
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
