import { Reveal } from "./fx";
import { Overline } from "./ui";

const services = [
  { name: "Diagnóstico eletrônico", tag: "Scanner LAUNCH" },
  { name: "Troca de óleo & filtros", tag: "Óleo MOTUL" },
  { name: "Freios & suspensão", tag: "" },
  { name: "Câmbio automático · CVT", tag: "Tecnomotor" },
  { name: "Veículos híbridos", tag: "Especializado" },
  { name: "Injeção eletrônica", tag: "" },
  { name: "Revisão completa", tag: "Preventiva" },
  { name: "Alinhamento & balanceamento", tag: "" },
];

export function Services() {
  return (
    <section id="servicos" className="bg-[var(--bg-2)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1024px] px-5 sm:px-6">
        <Reveal>
          <div className="max-w-2xl">
            <Overline>Serviços</Overline>
            <h2 className="v4-display mt-4 text-[clamp(2rem,4.6vw,3.3rem)] text-[var(--ink)]">
              Tudo o que o seu carro precisa.
            </h2>
          </div>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-12 grid sm:grid-cols-2 sm:gap-x-14">
            {services.map((s) => (
              <div
                key={s.name}
                className="flex items-baseline justify-between gap-4 border-t border-[var(--line)] py-5"
              >
                <span className="v4-semi text-[1.15rem] text-[var(--ink)]">{s.name}</span>
                {s.tag && <span className="text-sm text-[var(--muted)]">{s.tag}</span>}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-8 text-[15px] text-[var(--muted)]">
            E também: embreagem, motor, parte elétrica e o que mais o seu carro precisar.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
