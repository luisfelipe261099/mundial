import { MessageCircle, Phone } from "lucide-react";
import { business, whatsappUrl } from "../../_data/business";

/* Primitivos do site. Caixa de frase, cantos suaves, sem uppercase e sem
   tracking — botão de gente, não de instrumento. Sem hooks: servem em
   server e client components. */

export function WhatsAppCta({
  label = "Chamar no WhatsApp",
  message,
  className = "",
  onClick,
}: {
  label?: string;
  message?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2.5 rounded-md bg-[var(--zap)] px-6 py-3.5 text-[1.0625rem] font-bold text-white transition-colors hover:bg-[var(--zap-2)] ${className}`}
    >
      <MessageCircle size={19} />
      {label}
    </a>
  );
}

export function LigarCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={business.phoneHref}
      className={`inline-flex items-center justify-center gap-2.5 rounded-md border border-[var(--linha-2)] bg-[var(--cartao)] px-6 py-3.5 text-[1.0625rem] font-bold text-[var(--tinta)] transition-colors hover:border-[var(--tinta-2)] ${className}`}
    >
      <Phone size={18} className="text-[var(--azul-link)]" />
      Ligar {business.phoneDisplay}
    </a>
  );
}

export function PhoneCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={business.phoneHref}
      className={`inline-flex items-center gap-2 font-semibold text-[var(--tinta)] transition-colors hover:text-[var(--azul-link)] ${className}`}
    >
      <Phone size={16} className="text-[var(--azul-link)]" />
      <span className="whitespace-nowrap">{business.phoneDisplay}</span>
    </a>
  );
}

/** Ícone do Instagram em SVG (o lucide-react removeu os ícones de marca). */
export function InstagramIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

/** Estrelas com nota fracionária — âmbar como no Google, estáticas. */
export function Stars({
  value,
  size = 16,
  className = "",
}: {
  value: number;
  size?: number;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const star =
    "M12 2.6l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 18.02 6.16 21.17l1.11-6.5L2.55 10.07l6.53-.95L12 2.6Z";
  return (
    <span
      className={`relative inline-flex ${className}`}
      style={{ width: size * 5 + 4 * 4, height: size }}
      aria-label={`${value} de 5 estrelas`}
      role="img"
    >
      <span className="absolute inset-0 flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="text-[var(--linha-2)]">
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
      <span className="absolute inset-0 flex gap-1 overflow-hidden" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="shrink-0 text-[#f59e0b]">
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
    </span>
  );
}
