import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { business, whatsappUrl } from "../../_data/business";

/* Primitivos da Opção B. Botões SHARP (cantos retos), caps + mono — o
   oposto das pílulas arredondadas da Opção A. Sem hooks: servem tanto em
   server quanto em client components. */

export function WhatsAppCta({
  label = "Orçamento no WhatsApp",
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
      className={`group inline-flex items-center justify-center gap-2.5 rounded-[3px] bg-[var(--signal)] px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white transition-all duration-200 hover:bg-[var(--signal-2)] hover:shadow-[0_0_0_1px_var(--signal),0_18px_40px_-18px_var(--signal)] ${className}`}
    >
      <MessageCircle size={18} className="transition-transform duration-200 group-hover:-rotate-12" />
      {label}
    </a>
  );
}

export function AgendarCta({
  label = "Agendar horário",
  message = "Olá! Quero agendar um horário para o meu carro na Auto Mecânica Mundial.",
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
      className={`group inline-flex items-center justify-center gap-2 rounded-[3px] border border-[var(--line-2)] bg-transparent px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-[var(--paper)] transition-all duration-200 hover:border-[var(--paper)] hover:bg-[var(--paper)] hover:text-[var(--ink)] ${className}`}
    >
      {label}
      <ArrowUpRight size={18} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
}

export function PhoneCta({ className = "" }: { className?: string }) {
  return (
    <a
      href={business.phoneHref}
      className={`inline-flex items-center gap-2 text-sm font-semibold text-[var(--paper)] transition-colors hover:text-[var(--signal)] ${className}`}
    >
      <Phone size={16} className="text-[var(--signal)]" />
      {business.phoneDisplay}
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

/** Micro-rótulo "instrumento": ponto sinal + texto mono. */
export function MonoTag({
  children,
  className = "",
  dot = true,
}: {
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}) {
  return (
    <span
      className={`v2-mono inline-flex items-center gap-2 text-[11px] text-[var(--paper-2)] ${className}`}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-[var(--signal)]" />}
      {children}
    </span>
  );
}

/** Índice de seção tipo "Nº 01 — RÓTULO" com régua. */
export function SectionIndex({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="v2-display text-[var(--signal)] text-lg leading-none">
        {n}
      </span>
      <span className="h-px w-10 bg-[var(--line-2)]" />
      <span className="v2-mono text-[11px] text-[var(--paper-2)]">{label}</span>
    </div>
  );
}

/** Estrelas (preenchidas em sinal) com nota fracionária. */
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
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="text-[var(--line-2)]">
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
      <span className="absolute inset-0 flex gap-1 overflow-hidden" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="shrink-0 text-[var(--signal)]">
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
    </span>
  );
}
