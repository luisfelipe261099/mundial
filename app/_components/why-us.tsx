import {
  BadgeDollarSign,
  SearchCheck,
  Sparkles,
  Star,
  Timer,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { business } from "../_data/business";
import { Reveal, Stagger, StaggerItem } from "./motion";

type Edge = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

// Diferenciais ancorados nas avaliações reais do Google.
const edges: Edge[] = [
  {
    icon: Sparkles,
    title: "Oficina limpa e higienizada",
    desc: "Ambiente organizado e dentro dos padrões de higienização — sinal de cuidado com o seu carro.",
  },
  {
    icon: BadgeDollarSign,
    title: "Preço justo e transparente",
    desc: "Você aprova o orçamento antes de qualquer serviço. Sem surpresa na conta no final.",
  },
  {
    icon: Timer,
    title: "Agilidade no atendimento",
    desc: "Seu tempo importa: serviço de primeira, ágil e sem enrolação.",
  },
  {
    icon: SearchCheck,
    title: "Diagnóstico honesto",
    desc: "Explicamos o que o carro realmente precisa — e o que pode esperar.",
  },
];

export function WhyUs() {
  return (
    <section
      id="diferenciais"
      className="relative overflow-hidden py-20 sm:py-28"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 bg-brand-soft/40" />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
        {/* Foto real + selo de nota flutuante */}
        <Reveal>
          <div className="bracket-corners relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/images/real-garage.jpg"
              alt="Veículo no elevador durante manutenção na Auto Mecânica Mundial, com equipamento de diagnóstico e ferramentas profissionais"
              fill
              sizes="(max-width: 1024px) 90vw, 520px"
              className="object-cover object-center"
            />
            {/* Selo de nota: dentro da imagem no mobile/tablet (imagem ocupa
                a largura toda, sem espaço à direita) e flutuando pra fora só
                no desktop, onde a imagem vive na coluna esquerda do grid. */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lift lg:-bottom-5 lg:-right-6">
              <span className="font-display text-3xl font-extrabold text-ink">
                {business.rating.toString().replace(".", ",")}
              </span>
              <div className="leading-tight">
                <div className="flex text-star">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                  ))}
                </div>
                <div className="text-xs text-muted">
                  {business.reviewCount} avaliações
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Texto + diferenciais */}
        <div>
          <Reveal>
            <div className="tech-label flex items-center gap-2 text-accent">
              <span>02</span>
              <span className="h-px w-6 bg-accent/40" />
              <span className="text-muted">Por que a Mundial</span>
            </div>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Confiança que aparece nas avaliações
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-body">
              Nota {business.rating.toString().replace(".", ",")} com{" "}
              {business.reviewCount} avaliações no Google não acontece por acaso.
            </p>
          </Reveal>

          <Stagger className="mt-8 flex flex-col gap-5">
            {edges.map((e) => (
              <StaggerItem key={e.title}>
                <div className="flex gap-4">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-accent shadow-card">
                    <e.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-body">
                      {e.desc}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
