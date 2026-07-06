import Image from "next/image";
import {
  business,
  fullAddress,
  whatsappUrl,
} from "../../_data/business";
import { InstagramIcon } from "./ui";

const nav = [
  { href: "#servicos", label: "Serviços" },
  { href: "#confianca", label: "Confiança" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#oficina", label: "Oficina" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--ink)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt={business.name}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full ring-1 ring-[var(--line-2)]"
            />
            <span className="v2-display text-lg uppercase tracking-tight text-[var(--paper)]">
              Auto Mecânica Mundial
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--muted)]">
            Oficina mecânica de confiança em Curitiba. Diagnóstico honesto,
            oficina limpa e preço combinado antes do serviço.
          </p>
        </div>

        <div>
          <div className="v2-mono mb-4 text-[10px] text-[var(--muted)]">Navegação</div>
          <ul className="space-y-2.5">
            {nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-[var(--paper-2)] hover:text-[var(--signal)]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="v2-mono mb-4 text-[10px] text-[var(--muted)]">Contato</div>
          <ul className="space-y-2.5 text-sm text-[var(--paper-2)]">
            <li className="text-[var(--muted)]">{fullAddress}</li>
            <li>
              <a href={business.phoneHref} className="hover:text-[var(--signal)]">
                {business.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--signal)]"
              >
                WhatsApp {business.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-[var(--signal)]"
              >
                <InstagramIcon size={15} />
                {business.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-5 py-6 sm:flex-row sm:px-8">
          <span className="v2-mono text-[10px] text-[var(--muted)]">
            © 2026 {business.name}. Todos os direitos reservados.
          </span>
          <span className="v2-mono text-[10px] text-[var(--muted)]">Curitiba · PR · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
