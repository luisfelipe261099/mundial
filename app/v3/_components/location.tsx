import { ArrowRight } from "lucide-react";
import {
  business,
  mapsEmbedUrl,
  mapsLink,
} from "../../_data/business";
import { Reveal } from "./fx";
import { Overline, WhatsAppPrimary } from "./ui";

export function Location() {
  const a = business.address;
  return (
    <section id="contato" className="relative bg-[var(--bg-2)] py-24 sm:py-32">
      <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
        <Reveal>
          <Overline>Contato</Overline>
          <h2 className="v3-display mt-6 max-w-[16ch] text-[clamp(2rem,4.6vw,3.3rem)] text-[var(--fg)]">
            Venha até a oficina.
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_1.15fr]">
          {/* Dados */}
          <Reveal>
            <div className="border-t border-[var(--line)]">
              <Row label="Endereço">
                <span className="v3-mid text-xl text-[var(--fg)]">{a.street}</span>
                <span className="mt-1 block text-[var(--fg-2)]">
                  {a.district} · {a.city}/{a.state} · {a.zip}
                </span>
              </Row>
              <Row label="Telefone">
                <a href={business.phoneHref} className="v3-mid text-xl text-[var(--fg)] hover:text-white">
                  {business.phoneDisplay}
                </a>
              </Row>
              <Row label="Horário">
                <div className="space-y-1 text-[var(--fg-2)]">
                  {business.hours.map((h) => (
                    <div key={h.days} className="flex justify-between gap-8">
                      <span>{h.days}</span>
                      <span className="text-[var(--fg)]">{h.time}</span>
                    </div>
                  ))}
                </div>
              </Row>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <WhatsAppPrimary
                label="Agendar pelo WhatsApp"
                message="Olá! Gostaria de agendar um horário na Auto Mecânica Mundial."
              />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-[2px] border border-[var(--line-2)] px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--fg)] transition-colors hover:border-[var(--fg)]"
              >
                Como chegar
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          {/* Mapa monocromático */}
          <Reveal delay={0.1}>
            <div className="relative h-[360px] overflow-hidden rounded-[3px] border border-[var(--line)] lg:h-[460px]">
              <iframe
                src={mapsEmbedUrl}
                title={`Mapa — ${business.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full grayscale-[0.85] contrast-[1.05] brightness-[0.92]"
              />
              <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[var(--line)]" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[88px_1fr] gap-4 border-b border-[var(--line)] py-6">
      <span className="v3-over pt-1.5 text-[10px] text-[var(--muted)]">{label}</span>
      <div>{children}</div>
    </div>
  );
}
