import {
  business,
  fullAddress,
  mapsEmbedUrl,
  mapsLink,
} from "../../_data/business";
import { Reveal } from "./fx";
import { Overline, TextLink, WhatsAppPill } from "./ui";

export function Location() {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Endereço", value: fullAddress },
    {
      label: "Telefone",
      value: (
        <a href={business.phoneHref} className="hover:text-[var(--accent)]">
          {business.phoneDisplay}
        </a>
      ),
    },
    {
      label: "Horário",
      value: (
        <div className="space-y-1">
          {business.hours.map((h) => (
            <div key={h.days} className="flex justify-between gap-8">
              <span className="text-[var(--muted)]">{h.days}</span>
              <span>{h.time}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="contato" className="bg-[var(--bg)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1024px] px-5 sm:px-6">
        <Reveal>
          <Overline>Contato</Overline>
          <h2 className="v4-display mt-4 text-[clamp(2rem,4.6vw,3.3rem)] text-[var(--ink)]">
            Venha até a oficina.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <dl>
              {rows.map((r) => (
                <div key={r.label} className="border-t border-[var(--line)] py-5">
                  <dt className="text-sm font-medium text-[var(--muted)]">{r.label}</dt>
                  <dd className="mt-1 text-[1.15rem] text-[var(--ink)]">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-x-7 gap-y-4">
              <WhatsAppPill
                label="Agendar pelo WhatsApp"
                message="Olá! Gostaria de agendar um horário na Auto Mecânica Mundial."
              />
              <TextLink href={mapsLink} external>
                Como chegar
              </TextLink>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative h-[360px] overflow-hidden rounded-[24px] ring-1 ring-[var(--line)] lg:h-[440px]">
              <iframe
                src={mapsEmbedUrl}
                title={`Mapa — ${business.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
