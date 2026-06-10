import { Clock, MapPin, Navigation, Phone } from "lucide-react";
import {
  business,
  fullAddress,
  mapsEmbedUrl,
  mapsLink,
} from "../_data/business";
import { Reveal } from "./motion";
import { SectionHeading } from "./section-heading";
import { WhatsAppButton } from "./cta";

export function Location() {
  return (
    <section id="localizacao" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          index="04"
          eyebrow="Onde estamos"
          title="Venha tomar um café enquanto cuidamos do seu carro"
          description="Estamos no bairro Uberaba, em Curitiba. Agende pelo WhatsApp e evite espera."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Informações */}
          <Reveal className="flex flex-col gap-5">
            <InfoRow icon={MapPin} title="Endereço">
              {fullAddress}
            </InfoRow>

            <InfoRow icon={Phone} title="Telefone">
              <a href={business.phoneHref} className="hover:text-brand">
                {business.phoneDisplay}
              </a>
            </InfoRow>

            <InfoRow icon={Clock} title="Horário de funcionamento">
              <ul className="space-y-1">
                {business.hours.map((h) => (
                  <li key={h.days} className="flex justify-between gap-6">
                    <span>{h.days}</span>
                    <span className="font-medium text-ink">{h.time}</span>
                  </li>
                ))}
              </ul>
            </InfoRow>

            <div className="mt-1 flex flex-col gap-3 sm:flex-row">
              <WhatsAppButton
                label="Agendar pelo WhatsApp"
                message="Olá! Gostaria de agendar um horário na Auto Mecânica Mundial."
              />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface px-6 py-3.5 font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand"
              >
                <Navigation size={18} />
                Como chegar
              </a>
            </div>
          </Reveal>

          {/* Mapa */}
          <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-2xl border border-line shadow-card">
              <iframe
                title={`Mapa — ${business.name}`}
                src={mapsEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[340px] w-full sm:h-full sm:min-h-[420px]"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function InfoRow({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof MapPin;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <div className="font-display text-sm font-bold uppercase tracking-wide text-ink">
          {title}
        </div>
        <div className="mt-1.5 text-body">{children}</div>
      </div>
    </div>
  );
}
