"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { business } from "../../_data/business";
import { PhoneCta, WhatsAppCta } from "./ui";

const LINKS = [
  { href: "#servicos", label: "Serviços" },
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#onde-estamos", label: "Onde estamos" },
];

export function Nav() {
  const [aberto, setAberto] = useState(false);
  const [rolou, setRolou] = useState(false);

  useEffect(() => {
    const fn = () => setRolou(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-[var(--papel)] transition-shadow ${
        rolou ? "border-[var(--linha)] shadow-[0_1px_2px_rgb(0_0_0_/_0.05)]" : "border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#topo" className="flex min-w-0 items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt=""
            width={34}
            height={34}
            className="size-[34px] shrink-0 rounded-full"
          />
          <span className="truncate font-[var(--font-work)] text-[1.0625rem] font-bold leading-tight text-[var(--tinta)]">
            Auto Mecânica Mundial
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Seções do site">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="t-small font-semibold text-[var(--tinta-2)] transition-colors hover:text-[var(--tinta)]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <PhoneCta className="t-small" />
          <WhatsAppCta label="WhatsApp" className="!px-4 !py-2.5 !text-[0.9375rem]" />
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="grid size-10 place-items-center rounded-md border border-[var(--linha)] md:hidden"
          aria-expanded={aberto}
          aria-label={aberto ? "Fechar menu" : "Abrir menu"}
        >
          {aberto ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {aberto && (
        <div className="border-t border-[var(--linha)] bg-[var(--cartao)] px-5 py-4 md:hidden">
          <nav className="flex flex-col" aria-label="Seções do site">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setAberto(false)}
                className="border-b border-[var(--linha)] py-3 font-semibold text-[var(--tinta)] last:border-0"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <WhatsAppCta onClick={() => setAberto(false)} />
            <a
              href={business.phoneHref}
              className="text-center font-semibold text-[var(--azul-link)] underline underline-offset-4"
            >
              Ligar {business.phoneDisplay}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
