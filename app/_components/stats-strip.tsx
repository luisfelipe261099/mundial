import { business } from "../_data/business";
import { Reveal } from "./motion";

const stats = [
  { value: business.rating.toString().replace(".", ","), label: "nota no Google" },
  { value: `${business.reviewCount}`, label: "avaliações reais" },
  { value: "100%", label: "orçamento antes do serviço" },
  { value: "Uberaba", label: "bairro · Curitiba" },
];

export function StatsStrip() {
  return (
    <Reveal className="border-y border-line bg-surface">
      <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-5 sm:grid-cols-4 sm:divide-x sm:px-6">
        {stats.map((s) => (
          <div key={s.label} className="px-2 py-7 text-center">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <div className="font-display text-3xl font-extrabold text-ink sm:text-4xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-muted">{s.label}</div>
            </dd>
          </div>
        ))}
      </dl>
    </Reveal>
  );
}
