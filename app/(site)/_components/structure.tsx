import Image from "next/image";
import { business } from "../../_data/business";
import { InstagramIcon } from "./ui";

/* Mostrar > afirmar: fotos reais em cor integral com legenda de jornal.
   A foto da fachada tem arte de divulgação embutida no topo, então entra
   com recorte que enquadra só o prédio (object-position baixo). */

export function Structure() {
  return (
    <section className="border-b border-[var(--linha)] bg-[var(--cimento)]">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <h2 className="t-h2 text-[var(--tinta)]">A oficina</h2>
        <p className="t-lede mt-3 max-w-[58ch]">
          Prédio azul na Rua Eduardo Victor Piechnik, no Uberaba. Baias com
          elevador, scanner LAUNCH e máquina Tecnomotor — e oficina limpa, que
          é sinal de cuidado com o seu carro.
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {/* Recortes limpos das fotos de divulgação (a arte com texto fica fora). */}
          <figure className="foto-card">
            <div className="relative aspect-[21/10] overflow-hidden rounded-[5px]">
              <Image
                src="/images/fachada.jpg"
                alt="Fachada azul da Auto Mecânica Mundial, com letreiro e portão aberto"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="t-small px-2 pb-1 pt-2.5 text-[var(--tinta-2)]">
              A fachada azul — fácil de achar na rua.
            </figcaption>
          </figure>

          <figure className="foto-card">
            <div className="relative aspect-[21/10] overflow-hidden rounded-[5px]">
              <Image
                src="/images/hibrido.jpg"
                alt="Toyota Corolla híbrido atendido na Auto Mecânica Mundial"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="t-small px-2 pb-1 pt-2.5 text-[var(--tinta-2)]">
              Híbridos também entram na baia.
            </figcaption>
          </figure>
        </div>

        <a
          href={business.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center gap-2 font-semibold text-[var(--azul-link)] underline underline-offset-4"
        >
          <InstagramIcon size={18} />
          Acompanhe o dia a dia no {business.instagramHandle}
        </a>
      </div>
    </section>
  );
}
