import { business } from "../../_data/business";
import { Stars } from "./ui";

/* Prova social sem juramento: a nota aparece UMA vez, impressa e exata, e o
   dispositivo principal é o link para conferir no Google. As citações abaixo
   são de avaliações reais do perfil — para adicionar mais, copie o texto
   exato do Google e inclua primeiro nome + inicial (ex.: "Marcos T."),
   nunca um nome inventado. */

const QUOTES = [
  {
    texto: "Oficina limpa e dentro dos padrões de higienização.",
    quem: "Avaliação no Google",
  },
  {
    texto: "Agilidade, preço justo e serviço de primeira!",
    quem: "Avaliação no Google",
  },
];

export function Reviews() {
  return (
    <section id="avaliacoes" className="scroll-mt-16 border-b border-[var(--linha)] bg-[var(--papel)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <h2 className="t-h2 text-[var(--tinta)]">O que os clientes dizem no Google</h2>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1.6fr]">
          {/* A nota, uma vez, estática. */}
          <div className="rounded-lg border border-[var(--linha)] bg-[var(--azul-nevoa)] p-6">
            <div className="flex items-end gap-2">
              <span className="font-[var(--font-work)] text-5xl font-bold leading-none text-[var(--tinta)]">
                {business.rating.toString().replace(".", ",")}
              </span>
              <span className="t-small pb-1 text-[var(--tinta-2)]">de 5</span>
            </div>
            <div className="mt-3">
              <Stars value={business.rating} size={18} />
            </div>
            <p className="t-small mt-3 text-[var(--tinta-2)]">
              Nota da oficina no Google, com {business.reviewCount} avaliações.
            </p>
            <a
              href={business.googleReviewsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-semibold text-[var(--azul-link)] underline underline-offset-4"
            >
              Ler as {business.reviewCount} avaliações no Google
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {QUOTES.map((q) => (
              <figure
                key={q.texto}
                className="flex flex-col rounded-lg border border-[var(--linha)] bg-[var(--cartao)] p-6"
              >
                <Stars value={5} size={15} />
                <blockquote className="mt-3 flex-1 text-[var(--tinta)]" style={{ textIndent: "-0.45em" }}>
                  “{q.texto}”
                </blockquote>
                <figcaption className="t-small mt-3 text-[var(--tinta-2)]">{q.quem}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
