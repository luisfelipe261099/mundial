import Image from "next/image";
import { business, fullAddress, whatsappUrl } from "../../_data/business";
import { InstagramIcon } from "../../_components/icons";

const nav = [
  { href: "#competencias", label: "Competências" },
  { href: "#oficina", label: "A Oficina" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#contato", label: "Contato" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt={business.name}
              width={38}
              height={38}
              className="h-9 w-9 rounded-full ring-1 ring-[var(--line-2)]"
            />
            <span className="v3-mid text-base uppercase tracking-[0.04em] text-[var(--fg)]">
              Auto Mecânica Mundial
            </span>
          </div>
          <p className="mt-4 max-w-sm leading-relaxed text-[var(--muted)]">
            Oficina mecânica de confiança em Curitiba. Diagnóstico preciso,
            peças de qualidade e o orçamento combinado antes.
          </p>
        </div>

        <div>
          <div className="v3-over mb-4 text-[10px] text-[var(--muted)]">Navegação</div>
          <ul className="space-y-2.5">
            {nav.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="text-sm text-[var(--fg-2)] hover:text-[var(--fg)]">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="v3-over mb-4 text-[10px] text-[var(--muted)]">Contato</div>
          <ul className="space-y-2.5 text-sm text-[var(--fg-2)]">
            <li className="text-[var(--muted)]">{fullAddress}</li>
            <li>
              <a href={business.phoneHref} className="hover:text-[var(--fg)]">
                {business.phoneDisplay}
              </a>
            </li>
            <li>
              <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--fg)]">
                WhatsApp {business.whatsappDisplay}
              </a>
            </li>
            <li>
              <a
                href={business.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-[var(--fg)]"
              >
                <InstagramIcon size={15} />
                {business.instagramHandle}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-2 px-5 py-6 sm:flex-row sm:px-8">
          <span className="v3-over text-[10px] text-[var(--muted)]">© 2026 {business.name}</span>
          <span className="v3-over text-[10px] text-[var(--muted)]">Curitiba · PR · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
