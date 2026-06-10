import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { whatsappUrl } from "../../_data/business";

/* Primitivos da Opção C — monocromático premium. Ação primária BRANCA
   (texto escuro), secundária em contorno fino. Sem hooks. */

export function WhatsAppPrimary({
  label = "Falar no WhatsApp",
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
      className={`group inline-flex items-center justify-center gap-2.5 rounded-[2px] bg-[var(--fg)] px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--bg)] transition-all duration-200 hover:bg-white ${className}`}
    >
      <MessageCircle size={17} />
      {label}
    </a>
  );
}

export function GhostCta({
  label = "Agendar horário",
  href = "/agendar",
  className = "",
  onClick,
}: {
  label?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2 rounded-[2px] border border-[var(--line-2)] px-8 py-4 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--fg)] transition-all duration-200 hover:border-[var(--fg)] hover:bg-white/5 ${className}`}
    >
      {label}
      <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
    </Link>
  );
}

/** Overline minimalista: traço + texto tracked. */
export function Overline({
  children,
  className = "",
  line = true,
}: {
  children: React.ReactNode;
  className?: string;
  line?: boolean;
}) {
  return (
    <span className={`v3-over inline-flex items-center gap-3 text-[11px] text-[var(--fg-2)] ${className}`}>
      {line && <span className="h-px w-8 bg-[var(--line-2)]" />}
      {children}
    </span>
  );
}

/** Estrelas monocromáticas (preenchidas em off-white). */
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
      style={{ width: size * 5 + 4 * 3, height: size }}
      role="img"
      aria-label={`${value} de 5 estrelas`}
    >
      <span className="absolute inset-0 flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="text-[var(--line-2)]">
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
      <span className="absolute inset-0 flex gap-[3px] overflow-hidden" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className="shrink-0 text-[var(--fg)]">
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
    </span>
  );
}
