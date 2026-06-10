import { business } from "../../_data/business";
import { Reveal } from "./fx";
import { Overline, WhatsAppPill } from "./ui";

export function Closing() {
  return (
    <section className="relative overflow-hidden bg-[var(--dark)] py-28 text-center sm:py-36">
      <div className="glow pointer-events-none absolute inset-0" />
      <div className="relative z-10 mx-auto max-w-2xl px-5 sm:px-6">
        <Reveal>
          <Overline dark>{business.name}</Overline>
          <h2 className="v4-display mt-4 text-[clamp(2.4rem,6vw,4.2rem)] text-white">
            Vamos cuidar do seu carro.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[clamp(1.05rem,2.2vw,1.3rem)] leading-relaxed text-[var(--on-dark-2)]">
            Mande uma mensagem agora e receba um orçamento sem compromisso —
            direto com a oficina.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-x-7 gap-y-4 sm:flex-row">
            <WhatsAppPill message="Olá! Vim pelo site e quero um orçamento para o meu carro." />
            <a
              href={business.phoneHref}
              className="text-[15px] font-semibold text-[var(--link)] hover:underline underline-offset-4"
            >
              ou ligue · {business.phoneDisplay}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
