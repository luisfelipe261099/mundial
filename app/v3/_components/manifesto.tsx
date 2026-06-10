import { Reveal } from "./fx";
import { Overline } from "./ui";

export function Manifesto() {
  return (
    <section className="relative bg-[var(--bg)] py-28 text-center sm:py-40">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <Overline className="justify-center" line={false}>
            <span className="h-px w-8 bg-[var(--line-2)]" /> Filosofia <span className="h-px w-8 bg-[var(--line-2)]" />
          </Overline>
        </Reveal>
        <Reveal delay={0.05}>
          <p className="v3-mid mx-auto mt-9 max-w-4xl text-[clamp(1.6rem,3.9vw,3rem)] leading-[1.18] text-[var(--fg)]">
            Tratamos o seu carro com o rigor que as grandes marcas reservam aos
            delas.{" "}
            <span className="text-[var(--muted)]">
              Diagnóstico que explica, peças que duram e o preço combinado antes
              de tudo.
            </span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
