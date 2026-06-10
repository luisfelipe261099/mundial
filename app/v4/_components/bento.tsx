import Image from "next/image";
import { Reveal } from "./fx";
import { Overline } from "./ui";

export function Bento() {
  return (
    <section id="diferenciais" className="bg-[var(--bg)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1024px] px-5 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <Overline>Por que a Mundial</Overline>
            <h2 className="v4-display mt-4 text-[clamp(2rem,4.6vw,3.3rem)] text-[var(--ink)]">
              Confiança em cada detalhe.
            </h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-6">
          {/* Card largo + imagem */}
          <Reveal className="lg:col-span-4">
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[var(--bg-2)]">
              <div className="p-8 sm:p-10">
                <h3 className="v4-semi text-[1.6rem] text-[var(--ink)]">Preço combinado antes.</h3>
                <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed text-[var(--ink-2)]">
                  Você aprova o orçamento antes de qualquer serviço. Peças de
                  qualidade e montagem no ponto — sem surpresa na conta.
                </p>
              </div>
              <div className="relative mt-auto h-44 sm:h-52">
                <Image src="/images/v3/brake-detail.jpg" alt="Detalhe de freio de alto desempenho" fill sizes="(max-width:1024px) 100vw, 640px" className="object-cover" />
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-2">
            <div className="h-full rounded-[28px] bg-[var(--bg-2)] p-8 sm:p-10">
              <h3 className="v4-semi text-[1.6rem] text-[var(--ink)]">Oficina limpa.</h3>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-[var(--ink-2)]">
                Ambiente higienizado e organizado — cuidado que se vê.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.06} className="lg:col-span-2">
            <div className="h-full rounded-[28px] bg-[var(--bg-2)] p-8 sm:p-10">
              <h3 className="v4-semi text-[1.6rem] text-[var(--ink)]">Agilidade.</h3>
              <p className="mt-3 text-[1.05rem] leading-relaxed text-[var(--ink-2)]">
                Serviço de primeira, no tempo certo. Seu tempo importa.
              </p>
            </div>
          </Reveal>

          {/* Card largo + imagem */}
          <Reveal delay={0.06} className="lg:col-span-4">
            <div className="flex h-full flex-col overflow-hidden rounded-[28px] bg-[var(--bg-2)]">
              <div className="p-8 sm:p-10">
                <h3 className="v4-semi text-[1.6rem] text-[var(--ink)]">Híbridos & câmbio CVT.</h3>
                <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed text-[var(--ink-2)]">
                  Manutenção especializada em veículos híbridos e troca de fluido
                  de câmbio automático com equipamento Tecnomotor.
                </p>
              </div>
              <div className="relative mt-auto h-44 sm:h-52">
                <Image src="/images/v3/engine-bay.jpg" alt="Detalhe de motor em manutenção" fill sizes="(max-width:1024px) 100vw, 640px" className="object-cover" />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
