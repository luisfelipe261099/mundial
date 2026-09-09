import { business } from "../../_data/business";
import { WhatsAppCta } from "./ui";

/* Perguntas que as pessoas realmente digitam no Google antes de escolher
   oficina. Cada resposta é texto indexável e alimenta o FAQPage do JSON-LD
   (rich result de perguntas na busca) — as duas fontes leem esta lista. */

export const PERGUNTAS: { p: string; r: string }[] = [
  {
    p: "Onde fica a Auto Mecânica Mundial?",
    r: "Ficamos na Rua Eduardo Victor Piechnik, 149, no bairro Uberaba, em Curitiba/PR (CEP 81560-700). É o prédio azul com o letreiro da oficina, fácil de achar na rua. Atendemos também moradores do Boqueirão, Hauer, Cajuru, Jardim das Américas, Capão da Imbuia, Prado Velho e Guabirotuba.",
  },
  {
    p: "Qual o horário de funcionamento?",
    r: "Abrimos de segunda a sexta das 8h às 18h e aos sábados das 8h às 12h. Domingo não abrimos. Se precisar deixar o carro fora desse horário, fale com a gente antes pelo WhatsApp.",
  },
  {
    p: "Preciso agendar ou posso chegar direto?",
    r: "Pode chegar direto, mas agendar pelo WhatsApp evita espera — principalmente para serviços que ocupam o elevador, como troca de óleo, freios e câmbio automático. Mande uma mensagem contando o que o carro tem e a gente marca o melhor horário.",
  },
  {
    p: "Vocês fazem orçamento sem compromisso?",
    r: "Sim. Fazemos o diagnóstico, mostramos a peça e enviamos o orçamento por escrito no seu WhatsApp, com preço fechado de peças e mão de obra. Nada é executado sem a sua aprovação, e você não paga nada para receber o orçamento.",
  },
  {
    p: "Quanto custa uma troca de óleo?",
    r: "O valor depende do óleo e dos filtros que o seu carro pede — o manual de cada modelo especifica viscosidade e quantidade. Mande o modelo, o ano e a quilometragem no WhatsApp que passamos o preço fechado na hora, sem surpresa na conta.",
  },
  {
    p: "Quais carros e marcas vocês atendem?",
    r: "Atendemos as principais marcas do mercado — Volkswagen, Fiat, Chevrolet, Toyota, Honda, Hyundai, Renault e outras — em carros de passeio, incluindo veículos híbridos, que exigem manutenção especializada.",
  },
  {
    p: "Vocês fazem manutenção de câmbio automático e CVT?",
    r: "Fazemos. A troca de fluido é feita com máquina Tecnomotor e com aquecimento do fluido, o que atende também os carros equipados com válvula termostática, que só aceitam a troca na temperatura correta de trabalho.",
  },
  {
    p: "Que equipamentos vocês usam no diagnóstico?",
    r: "Trabalhamos com scanners Bosch, LAUNCH, Delphi e Doutor-IE Connect, além da máquina Tecnomotor para câmbio. Com eles lemos a injeção eletrônica e os módulos do carro para achar a causa do problema, e não só o sintoma.",
  },
  {
    p: "A oficina emite nota fiscal?",
    r: "Sim, emitimos nota fiscal de serviço (NFS-e) direto pelo nosso sistema, com envio do PDF e do XML da nota.",
  },
  {
    p: "Quais as formas de pagamento?",
    r: "Aceitamos dinheiro, PIX, cartão de débito e cartão de crédito. Combine as condições com a gente na hora de aprovar o orçamento.",
  },
];

export function Faq() {
  return (
    <section id="duvidas" className="scroll-mt-16 border-b border-[var(--linha)] bg-[var(--papel)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <h2 className="t-h2 text-[var(--tinta)]">Perguntas frequentes</h2>
        <p className="t-lede mt-3 max-w-[58ch]">
          O que a gente mais responde no WhatsApp. Se a sua dúvida não estiver
          aqui, é só chamar.
        </p>

        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {PERGUNTAS.map((f) => (
            <details
              key={f.p}
              className="group rounded-lg border border-[var(--linha)] bg-[var(--cartao)] px-5 py-4"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-[var(--font-work)] font-semibold text-[var(--tinta)] [&::-webkit-details-marker]:hidden">
                <h3 className="text-[1.0625rem] leading-snug">{f.p}</h3>
                <span
                  aria-hidden
                  className="shrink-0 text-xl leading-none text-[var(--azul-link)] transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="t-small mt-3 max-w-[62ch] text-[var(--tinta-2)]">{f.r}</p>
            </details>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <WhatsAppCta message="Olá! Vim pelo site e fiquei com uma dúvida sobre o serviço." />
          <p className="t-small text-[var(--tinta-2)]">
            Ou ligue {business.phoneDisplay} em horário comercial.
          </p>
        </div>
      </div>
    </section>
  );
}
