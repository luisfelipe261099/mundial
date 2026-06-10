import Image from "next/image";
import { mapsLink, whatsappUrl } from "../../_data/business";
import { Reveal } from "./fx";
import { Overline, TextLink } from "./ui";

function Feature({
  id,
  overline,
  title,
  body,
  img,
  alt,
  cta,
  reverse,
  gray,
}: {
  id?: string;
  overline: string;
  title: string;
  body: string;
  img: string;
  alt: string;
  cta: React.ReactNode;
  reverse?: boolean;
  gray?: boolean;
}) {
  return (
    <section
      id={id}
      className={`py-24 sm:py-32 ${gray ? "bg-[var(--bg-2)]" : "bg-[var(--bg)]"}`}
    >
      <div className="mx-auto grid max-w-[1024px] items-center gap-12 px-5 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <Reveal className={reverse ? "lg:order-2" : ""}>
          <Overline>{overline}</Overline>
          <h2 className="v4-display mt-4 text-[clamp(2rem,4.4vw,3.2rem)] text-[var(--ink)]">{title}</h2>
          <p className="mt-5 max-w-md text-[clamp(1.05rem,2vw,1.2rem)] leading-relaxed text-[var(--ink-2)]">
            {body}
          </p>
          <div className="mt-6">{cta}</div>
        </Reveal>
        <Reveal delay={0.1} className={reverse ? "lg:order-1" : ""}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[var(--bg-2)]">
            <Image src={img} alt={alt} fill sizes="(max-width: 1024px) 100vw, 480px" className="object-cover" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Showcase() {
  return (
    <>
      <Feature
        overline="Diagnóstico"
        title="A falha, localizada na hora."
        body="Scanner LAUNCH e leitura eletrônica para mostrar exatamente o que o carro tem — e te explicar, em português claro, antes de qualquer reparo."
        img="/images/v3/mechanic.jpg"
        alt="Profissional fazendo diagnóstico eletrônico com tablet"
        cta={
          <TextLink href={whatsappUrl("Olá! Quero um diagnóstico na Auto Mecânica Mundial.")} external>
            Falar no WhatsApp
          </TextLink>
        }
      />
      <Feature
        id="oficina"
        gray
        reverse
        overline="A Oficina"
        title="Estrutura real, em Curitiba."
        body="Elevador, scanner e equipamento profissional num ambiente limpo e organizado, no bairro Uberaba. Venha tomar um café enquanto cuidamos do seu carro."
        img="/images/real-garage.jpg"
        alt="Interior real da Auto Mecânica Mundial: carro no elevador e equipamentos"
        cta={
          <TextLink href={mapsLink} external>
            Como chegar
          </TextLink>
        }
      />
    </>
  );
}
