import Image from "next/image";
import { business, fullAddress, whatsappUrl } from "../../_data/business";
import { InstagramIcon } from "../../_components/icons";

const nav = [
  { href: "#servicos", label: "Serviços" },
  { href: "#oficina", label: "A Oficina" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#contato", label: "Contato" },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg-2)]">
      <div className="mx-auto max-w-[1024px] px-5 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <Image src="/images/logo.png" alt={business.name} width={30} height={30} className="h-[30px] w-[30px] rounded-full" />
              <span className="v4-semi text-[15px] text-[var(--ink)]">Auto Mecânica Mundial</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
              Oficina mecânica de confiança em Curitiba. Diagnóstico preciso,
              peças de qualidade e o orçamento combinado antes.
            </p>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-[var(--ink)]">Navegação</div>
            <ul className="mt-4 space-y-2.5">
              {nav.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)]">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[13px] font-semibold text-[var(--ink)]">Contato</div>
            <ul className="mt-4 space-y-2.5 text-[13px] text-[var(--muted)]">
              <li>{fullAddress}</li>
              <li>
                <a href={business.phoneHref} className="hover:text-[var(--ink)]">{business.phoneDisplay}</a>
              </li>
              <li>
                <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer" className="hover:text-[var(--ink)]">
                  WhatsApp {business.whatsappDisplay}
                </a>
              </li>
              <li>
                <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-[var(--ink)]">
                  <InstagramIcon size={14} />
                  {business.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-[var(--line)] pt-6 text-[12px] text-[var(--muted)] sm:flex-row">
          <span>© 2026 {business.name}. Todos os direitos reservados.</span>
          <span>Curitiba · PR · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
