import Image from "next/image";
import { WhatsAppCta } from "./ui";

/* O processo no lugar do slogan: preço é a maior ansiedade em oficina, e a
   resposta honesta é mostrar como o orçamento funciona — não inventar
   métrica. Foto real da baia em cor integral, com legenda factual. */

const PASSOS = [
  {
    titulo: "Você chama no WhatsApp ou liga",
    texto: "Descreve o problema do jeito que ele aparece — barulho, luz no painel, o que for.",
  },
  {
    titulo: "Diagnóstico na oficina",
    texto: "Scanner e elevador para achar a causa. O mecânico mostra a peça e explica o que encontrou.",
  },
  {
    titulo: "Orçamento por escrito no WhatsApp",
    texto: "Preço fechado de peças e mão de obra antes de qualquer serviço. Sem compromisso.",
  },
  {
    titulo: "Só fazemos o que você aprovar",
    texto: "Aprovou, a gente executa pelo preço combinado. Sem surpresa na hora de pagar.",
  },
];

export function Process() {
  return (
    <section id="como-funciona" className="scroll-mt-16 border-b border-[var(--linha)] bg-[var(--cimento)]">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <div>
          <h2 className="t-h2 text-[var(--tinta)]">Como funciona aqui</h2>

          <ol className="mt-8 space-y-6">
            {PASSOS.map((p, i) => (
              <li key={p.titulo} className="flex gap-4">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-[var(--azul)] font-[var(--font-work)] text-[0.9375rem] font-bold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="t-h3 text-[var(--tinta)]">{p.titulo}</h3>
                  <p className="t-small mt-1 max-w-[46ch] text-[var(--tinta-2)]">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <WhatsAppCta className="mt-8" message="Olá! Vim pelo site e queria descrever um problema do meu carro." />
        </div>

        <figure className="foto-card">
          <div className="relative aspect-[3/4] max-h-[560px] overflow-hidden rounded-[5px] lg:aspect-[4/5]">
            <Image
              src="/images/real-garage.jpg"
              alt="Carro erguido no elevador da Auto Mecânica Mundial, com máquina Tecnomotor e óleo Motul na baia"
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
          <figcaption className="t-small px-2 pb-1 pt-2.5 text-[var(--tinta-2)]">
            Renault no elevador — troca de fluido de câmbio com a máquina Tecnomotor.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
