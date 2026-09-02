import { LigarCta, WhatsAppCta } from "./ui";

export function Closing() {
  return (
    <section className="bg-[var(--papel)]">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        <h2 className="t-h2 max-w-[20ch] text-[var(--tinta)]">Precisando de mecânico?</h2>
        <p className="t-lede mt-3 max-w-[52ch]">
          Chame no WhatsApp ou ligue. Orçamento sem compromisso, resposta em
          horário comercial.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <WhatsAppCta message="Olá! Vim pelo site e gostaria de um orçamento para o meu carro." />
          <LigarCta />
        </div>
      </div>
    </section>
  );
}
