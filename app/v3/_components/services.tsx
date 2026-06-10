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
    <section id="servicos" className="relative bg-[var(--bg-2)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <Overline>Serviços</Overline>
          <h2 className="v3-display mt-6 max-w-[20ch] text-[clamp(2rem,4.6vw,3.3rem)] text-[var(--fg)]">
            O catálogo completo, num só lugar.
          </h2>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-12 grid border-t border-[var(--line)] sm:grid-cols-2 sm:gap-x-14">
            {services.map((s, i) => (
              <div
                key={s.name}
                className="flex items-baseline gap-4 border-b border-[var(--line)] py-5"
              >
                <span className="v3-over w-8 shrink-0 text-[10px] text-[var(--muted)]">
                  0{i + 1}
                </span>
                <span className="v3-mid flex-1 text-lg text-[var(--fg)]">{s.name}</span>
                {s.tag && (
                  <span className="v3-over text-[10px] text-[var(--fg-2)]">{s.tag}</span>
                )}
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-6 text-sm text-[var(--muted)]">
            E também: embreagem, motor, parte elétrica e o que mais o seu carro precisar.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
