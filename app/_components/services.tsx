import {
  BatteryCharging,
  ClipboardCheck,
  Cog,
  Cpu,
  Disc3,
  Droplet,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { SectionHeading } from "./section-heading";

type Service = {
  icon: LucideIcon;
  title: string;
  desc: string;
};

// Serviços reais da oficina (confirmados no Instagram @mecanicamundialcwb).
const services: Service[] = [
  {
    icon: Cpu,
    title: "Diagnóstico eletrônico",
    desc: "Scanner LAUNCH para identificar a falha com precisão.",
  },
  {
    icon: BatteryCharging,
    title: "Veículos híbridos",
    desc: "Manutenção especializada para carros híbridos.",
  },
  {
    icon: Cog,
    title: "Câmbio automático e CVT",
    desc: "Troca de fluido com equipamento Tecnomotor.",
  },
  {
    icon: Droplet,
    title: "Troca de óleo e filtros",
    desc: "Óleo MOTUL e filtros, com checagem de níveis.",
  },
  {
    icon: Disc3,
    title: "Freios e suspensão",
    desc: "Pastilhas, discos, amortecedores e direção.",
  },
  {
    icon: ClipboardCheck,
    title: "Revisão completa",
    desc: "Revisão preventiva ponto a ponto.",
  },
];

export function Services() {
  return (
    <section id="servicos" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          index="01"
          eyebrow="O que fazemos"
          title="Serviços para manter o seu carro rodando"
          description="Do básico do dia a dia ao reparo técnico — tudo com diagnóstico transparente e peças de qualidade."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-12">
          {/* Foto real em destaque */}
          <Reveal className="lg:col-span-5">
            <div className="bracket-corners relative h-72 overflow-hidden rounded-2xl shadow-card lg:h-full">
              <Image
                src="/images/real-garage.jpg"
                alt="Interior da Auto Mecânica Mundial: carro no elevador e equipamentos de diagnóstico"
                fill
                sizes="(max-width: 1024px) 90vw, 440px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="tech-label text-accent">Estrutura completa</div>
                <p className="mt-2 max-w-xs font-display text-xl font-bold leading-snug text-white">
                  Elevador, scanner e equipamento profissional na nossa oficina.
                </p>
              </div>
            </div>
          </Reveal>

          {/* Cartões de serviço */}
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {services.map((s) => (
              <StaggerItem key={s.title}>
                <article className="group flex h-full gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-lift">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand transition-colors duration-300 group-hover:bg-brand group-hover:text-white">
                    <s.icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-body">
                      {s.desc}
                    </p>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          E também: alinhamento e balanceamento, injeção eletrônica, embreagem,
          motor e elétrica.
        </p>
      </div>
    </section>
  );
}
