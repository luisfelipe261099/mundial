import { Navigation } from "lucide-react";
import {
  business,
  fullAddress,
  mapsEmbedUrl,
  mapsLink,
} from "../../_data/business";
import { Reveal } from "./fx";
import { MonoTag, SectionIndex, WhatsAppCta } from "./ui";

export function Location() {
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: "Endereço", value: fullAddress },
    {
      label: "Telefone",
      value: (
        <a href={business.phoneHref} className="hover:text-[var(--signal)]">
          {business.phoneDisplay}
        </a>
      ),
    },
    {
      label: "Horário",
      value: (
        <div className="space-y-0.5">
          {business.hours.map((h) => (
            <div key={h.days} className="flex justify-between gap-6">
              <span>{h.days}</span>
              <span className="text-[var(--paper-2)]">{h.time}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section id="oficina" className="relative bg-[var(--ink-2)] py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <SectionIndex n="05" label="Onde estamos" />
          <h2 className="v2-display mt-7 max-w-[20ch] text-[clamp(2rem,5vw,3.4rem)] text-[var(--paper)]">
            Estamos no <span className="text-[var(--signal)]">Uberaba</span>, em Curitiba.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-10 lg:grid-cols-2">
          {/* Ficha técnica */}
          <Reveal>
            <div className="border-t border-[var(--line-2)]">
              {rows.map((r) => (
                <div
                  key={r.label}
                  className="grid grid-cols-[110px_1fr] gap-4 border-b border-[var(--line)] py-5"
                >
                  <span className="v2-mono pt-0.5 text-[10px] text-[var(--muted)]">{r.label}</span>
                  <div className="text-[var(--paper)]">{r.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppCta
                label="Agendar pelo WhatsApp"
                message="Olá! Gostaria de agendar um horário na Auto Mecânica Mundial."
              />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[3px] border border-[var(--line-2)] px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--paper)] transition-colors hover:border-[var(--paper)]"
              >
                <Navigation size={16} className="text-[var(--signal)]" />
                Como chegar
              </a>
            </div>
          </Reveal>

          {/* Mapa emoldurado */}
          <Reveal delay={0.1}>
            <div className="relative h-[360px] overflow-hidden rounded-[6px] border border-[var(--line-2)] lg:h-full lg:min-h-[420px]">
              <iframe
                src={mapsEmbedUrl}
                title={`Mapa — ${business.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full grayscale-[0.15] contrast-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--line-2)]" />
              <span className="pointer-events-none absolute left-3 top-3 h-4 w-4 border-l border-t border-[var(--signal)]" />
              <span className="pointer-events-none absolute right-3 top-3 h-4 w-4 border-r border-t border-[var(--signal)]" />
              <span className="pointer-events-none absolute bottom-3 left-3 h-4 w-4 border-b border-l border-[var(--signal)]" />
              <span className="pointer-events-none absolute bottom-3 right-3 h-4 w-4 border-b border-r border-[var(--signal)]" />
              <div className="pointer-events-none absolute left-4 top-4 z-[3] rounded-[3px] bg-[var(--ink)]/85 px-3 py-1.5 backdrop-blur-sm">
                <MonoTag>Uberaba · Curitiba/PR</MonoTag>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
