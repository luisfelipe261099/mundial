import { business } from "../../_data/business";
import { Reveal } from "./fx";
import { Overline, Stars, TextLink } from "./ui";

export function Testimonial() {
  return (
    <section id="avaliacoes" className="bg-[var(--bg-2)] py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 text-center sm:px-6">
        <Reveal>
          <Overline>Avaliações</Overline>
          <div className="mt-6 flex justify-center">
            <Stars value={5} size={20} />
          </div>
          <blockquote className="v4-semi mt-7 text-[clamp(1.7rem,3.8vw,2.7rem)] leading-[1.18] text-[var(--ink)]">
            “Oficina limpa e dentro dos padrões de higienização.”
          </blockquote>
          <p className="mt-7 text-[15px] text-[var(--muted)]">
            Cliente no Google · {business.rating.toString().replace(".", ",")} de 5 com{" "}
            {business.reviewCount} avaliações
          </p>
          <div className="mt-6 flex justify-center">
            <TextLink href={business.googleReviewsUrl} external>
              Ver no Google
            </TextLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
