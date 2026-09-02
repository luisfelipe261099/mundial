import { Navigation } from "lucide-react";
import {
  business,
  fullAddress,
  mapsEmbedUrl,
  mapsLink,
} from "../../_data/business";
import { WhatsAppCta } from "./ui";

export function Location() {
  return (
    <section id="onde-estamos" className="scroll-mt-16 border-b border-[var(--linha)] bg-[var(--papel)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <h2 className="t-h2 text-[var(--tinta)]">Onde estamos</h2>
        <p className="t-lede mt-3 max-w-[46ch]">{fullAddress}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          {/* Ficha de contato e horário */}
          <div>
            <div className="divide-y divide-[var(--linha)] rounded-lg border border-[var(--linha)] bg-[var(--cartao)]">
              <div className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-4">
                <span className="t-small font-semibold text-[var(--tinta-2)]">Fixo</span>
                <a href={business.phoneHref} className="t-data font-semibold text-[var(--azul-link)] underline underline-offset-4">
                  {business.phoneDisplay}
                </a>
              </div>
              <div className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-4">
                <span className="t-small font-semibold text-[var(--tinta-2)]">WhatsApp</span>
                <span className="t-data text-[var(--tinta)]">{business.whatsappDisplay}</span>
              </div>
              {business.hours.map((h) => (
                <div key={h.days} className="grid grid-cols-[7.5rem_1fr] gap-4 px-5 py-4">
                  <span className="t-small font-semibold text-[var(--tinta-2)]">{h.days}</span>
                  <span className="t-data text-[var(--tinta)]">{h.time}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <WhatsAppCta message="Olá! Gostaria de agendar um horário na Auto Mecânica Mundial." />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--linha-2)] bg-[var(--cartao)] px-6 py-3.5 font-bold text-[var(--tinta)] transition-colors hover:border-[var(--tinta-2)]"
              >
                <Navigation size={17} className="text-[var(--azul-link)]" />
                Como chegar
              </a>
            </div>
          </div>

          {/* Mapa */}
          <div className="overflow-hidden rounded-lg border border-[var(--linha)] bg-[var(--cartao)]">
            <iframe
              src={mapsEmbedUrl}
              title={`Mapa — ${business.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-[340px] w-full lg:h-full lg:min-h-[400px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
