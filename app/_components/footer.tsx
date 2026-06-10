import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import { business, fullAddress, whatsappUrl } from "../_data/business";
import { InstagramIcon } from "./icons";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#localizacao", label: "Localização" },
  { href: "#contato", label: "Contato" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt={business.name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full ring-1 ring-line"
            />
            <span className="font-display text-lg font-extrabold uppercase leading-tight tracking-tight text-ink">
              {business.name}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-body">
            Oficina mecânica de confiança em Curitiba. Diagnóstico honesto,
            oficina limpa e preço justo para o seu carro.
          </p>
        </div>

        <nav className="flex flex-col gap-2.5" aria-label="Rodapé">
          <div className="font-display text-sm font-bold uppercase tracking-wide text-ink">
            Navegação
          </div>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm text-body transition-colors hover:text-brand"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3 text-sm text-body">
          <div className="font-display text-sm font-bold uppercase tracking-wide text-ink">
            Contato
          </div>
          <p className="flex items-start gap-2.5">
            <MapPin size={16} className="mt-0.5 shrink-0 text-brand" />
            {fullAddress}
          </p>
          <a
            href={business.phoneHref}
            className="flex items-center gap-2.5 hover:text-brand"
          >
            <Phone size={16} className="shrink-0 text-brand" />
            {business.phoneDisplay}
          </a>
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 hover:text-brand"
          >
            <MessageCircle size={16} className="shrink-0 text-brand" />
            WhatsApp {business.whatsappDisplay}
          </a>
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 hover:text-brand"
          >
            <InstagramIcon size={16} className="shrink-0 text-brand" />
            {business.instagramHandle}
          </a>
          <p className="flex items-center gap-2.5">
            <Clock size={16} className="shrink-0 text-brand" />
            Seg–Sex 08h–18h · Sáb 08h–12h
          </p>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 text-xs text-muted sm:flex-row sm:px-6">
          <span>
            © {year} {business.name}. Todos os direitos reservados.
          </span>
          <span className="tech-label">Curitiba · PR · Brasil</span>
        </div>
      </div>
    </footer>
  );
}
