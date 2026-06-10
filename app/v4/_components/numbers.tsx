import { business } from "../../_data/business";
import { CountUp, Reveal } from "./fx";

export function Numbers() {
  const stats = [
    { value: business.rating, decimals: 1, suffix: "", label: "Nota no Google" },
    { value: business.reviewCount, decimals: 0, suffix: "", label: "Avaliações reais" },
    { value: 100, decimals: 0, suffix: "%", label: "Orçamento aprovado antes" },
  ];
  return (
    <section className="bg-[var(--bg)] py-20 sm:py-28">
      <div className="mx-auto grid max-w-[1024px] gap-y-12 px-5 text-center sm:grid-cols-3 sm:px-6">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <CountUp
              to={s.value}
              decimals={s.decimals}
              suffix={s.suffix}
              className="v4-display block text-[clamp(3.5rem,8vw,5.5rem)] text-[var(--ink)]"
            />
            <div className="mt-3 text-[15px] font-medium text-[var(--muted)]">{s.label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
