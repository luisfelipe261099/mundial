import { business } from "../../_data/business";
import { CountUp, Reveal } from "./fx";

export function Numbers() {
  const stats = [
    { value: business.rating, decimals: 1, suffix: "", label: "Nota no Google" },
    { value: business.reviewCount, decimals: 0, suffix: "", label: "Avaliações reais" },
    { value: 100, decimals: 0, suffix: "%", label: "Orçamento aprovado antes" },
  ];
  return (
    <section className="relative bg-[var(--bg)] py-24 sm:py-28">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <div className="grid grid-cols-1 divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-y-0">
          {stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <div className="px-2 py-12 text-center md:px-8">
                <CountUp
                  to={s.value}
                  decimals={s.decimals}
                  suffix={s.suffix}
                  className="v3-display block text-[clamp(3.5rem,8vw,6rem)] leading-none text-[var(--fg)]"
                />
                <div className="v3-over mt-5 text-[10px] text-[var(--fg-2)]">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
