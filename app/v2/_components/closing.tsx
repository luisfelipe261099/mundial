import { business } from "../../_data/business";
import { Reveal } from "./fx";
import { MonoTag, PhoneCta, WhatsAppCta } from "./ui";

export function Closing() {
  return (
    <section className="relative overflow-hidden bg-[var(--ink)] py-28 sm:py-36">
      {/* atmosfera: brilho sinal + grão + régua diagonal */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60rem_30rem_at_50%_-20%,var(--signal-soft),transparent_60%)]" />
      <div className="diag pointer-events-none absolute inset-0 opacity-[0.04]" />
      <div className="grain" />

      <div className="relative z-10 mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <MonoTag className="justify-center">{business.name} · Curitiba</MonoTag>
          <h2 className="v2-display mx-auto mt-6 max-w-[15ch] text-[clamp(2.4rem,7vw,5rem)] text-[var(--paper)]">
            Bora resolver o seu carro{" "}
            <span className="text-[var(--signal)]">com tranquilidade</span>?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[var(--paper-2)]">
            Manda uma mensagem agora e recebe um orçamento sem compromisso.
            Atendimento ágil e direto com a oficina.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <WhatsAppCta
              label="Falar no WhatsApp"
              message="Olá! Vim pelo site e quero um orçamento para o meu carro."
            />
            <span className="v2-mono text-[11px] text-[var(--muted)]">ou</span>
            <PhoneCta />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
