import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "../../_data/business";

/* Lista escaneável, sem hover-teatro: o card inteiro é um link de WhatsApp
   com a mensagem do serviço já preenchida. Funciona igual no toque. */

const SERVICOS = [
  {
    nome: "Troca de óleo e filtros",
    desc: "Óleo Motul e filtros com especificação do manual do seu carro.",
    msg: "Olá! Vim pelo site e quero um orçamento de troca de óleo.",
  },
  {
    nome: "Freios e suspensão",
    desc: "Pastilhas, discos, amortecedores — peça mostrada antes de trocar.",
    msg: "Olá! Vim pelo site e quero um orçamento de freios ou suspensão.",
  },
  {
    nome: "Diagnóstico eletrônico",
    desc: "Scanner LAUNCH para ler a injeção e achar a causa, não o sintoma.",
    msg: "Olá! Vim pelo site e preciso de um diagnóstico eletrônico.",
  },
  {
    nome: "Câmbio automático e CVT",
    desc: "Troca de fluido com máquina Tecnomotor, do jeito que o câmbio pede.",
    msg: "Olá! Vim pelo site e quero um orçamento para câmbio automático.",
  },
  {
    nome: "Veículos híbridos",
    desc: "Manutenção especializada para híbridos, cada vez mais comuns em Curitiba.",
    msg: "Olá! Vim pelo site e tenho um carro híbrido para manutenção.",
  },
  {
    nome: "Revisão completa",
    desc: "Revisão preventiva ponto a ponto, do motor à parte elétrica.",
    msg: "Olá! Vim pelo site e quero agendar uma revisão completa.",
  },
];

const MARCAS = ["volkswagen", "fiat", "chevrolet", "toyota", "honda", "hyundai"];

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-16">
      {/* Faixa azul — a mesma relação figura/fundo do letreiro no prédio.
          Único bloco azul da página. */}
      <div className="bg-[var(--azul)]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
          <h2 className="t-h2 text-white">O que fazemos</h2>
          <p className="mt-2 max-w-[54ch] text-[1.0625rem] text-[#cdd9ea]">
            De troca de óleo a câmbio automático e híbridos. E também:
            alinhamento, balanceamento, injeção eletrônica, embreagem, motor e
            elétrica.
          </p>
        </div>
      </div>

      <div className="border-b border-[var(--linha)] bg-[var(--papel)]">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICOS.map((s) => (
              <li key={s.nome}>
                <a
                  href={whatsappUrl(s.msg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full flex-col rounded-lg border border-[var(--linha)] bg-[var(--cartao)] p-5 transition-colors hover:border-[var(--azul)]"
                >
                  <h3 className="t-h3 text-[var(--tinta)]">{s.nome}</h3>
                  <p className="t-small mt-1.5 flex-1 text-[var(--tinta-2)]">{s.desc}</p>
                  <span className="t-small mt-4 inline-flex items-center gap-1.5 font-semibold text-[var(--azul-link)]">
                    <MessageCircle size={15} />
                    Pedir orçamento
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-10 border-t border-[var(--linha)] pt-7">
            <p className="t-small font-semibold text-[var(--tinta-2)]">
              Atendemos as principais marcas
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-4">
              {MARCAS.map((m) => (
                <Image
                  key={m}
                  src={`/images/brands/${m}.png`}
                  alt={m.charAt(0).toUpperCase() + m.slice(1)}
                  width={64}
                  height={28}
                  className="h-7 w-auto opacity-60 grayscale"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
