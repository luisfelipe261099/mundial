import { business } from "../_data/business";
import { AgendarButton, WhatsAppButton } from "./cta";
import { Reveal } from "./motion";

export function FinalCta() {
  return (
    <section id="contato" className="px-5 py-16 sm:px-6 sm:py-24">
      <Reveal className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-center sm:px-16 sm:py-20">
          {/* Atmosfera dentro do bloco escuro */}
          <div className="pointer-events-none absolute inset-0 blueprint opacity-[0.18]" />
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/25 blur-3xl" />

          <div className="relative">
            <div className="tech-label text-white/50">
              Auto Mecânica Mundial · Curitiba
            </div>
            <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
              Pronto para resolver o seu carro com tranquilidade?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
              Mande uma mensagem agora e receba um orçamento sem compromisso.
              Atendimento ágil e direto com a oficina.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <AgendarButton label="Agendar horário" className="px-8 py-4 text-base" />
              <WhatsAppButton
                label="Falar no WhatsApp"
                message="Olá! Vim pelo site e quero um orçamento para o meu carro."
                className="px-8 py-4 text-base"
              />
            </div>

            <p className="mt-6 text-sm text-white/50">
              Ou ligue para {business.phoneDisplay}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
