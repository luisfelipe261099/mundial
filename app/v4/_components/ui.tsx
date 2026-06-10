import { ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import { whatsappUrl } from "../../_data/business";

/* Primitivos da Opção D — Apple. Pílula azul (ação), link de texto com
   chevron (secundária), overline em azul. Sem hooks. */

export function WhatsAppPill({
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
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 py-3 text-[15px] font-semibold text-white transition-all duration-200 hover:bg-[var(--accent-2)] ${className}`}
    >
      <MessageCircle size={17} />
      {label}
    </a>
  );
}

/** Link de texto azul com chevron — secundária estilo Apple ("Saiba mais ›"). */
export function TextLink({
  children,
  href = "/agendar",
  external = false,
  className = "",
  dark = false,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  className?: string;
  dark?: boolean;
  onClick?: () => void;
}) {
  const color = dark ? "text-[var(--link)]" : "text-[var(--accent)]";
  const cls = `group inline-flex items-center gap-0.5 text-[15px] font-semibold ${color} hover:underline underline-offset-4 ${className}`;
  const inner = (
    <>
      {children}
      <ChevronRight size={17} className="transition-transform duration-200 group-hover:translate-x-0.5" />
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={cls}>
      {inner}
    </Link>
  );
}

/** Overline: pequeno rótulo em azul (categoria da seção). */
export function Overline({
  children,
  className = "",
  dark = false,
}: {
  children: React.ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <span className={`text-base font-semibold ${dark ? "text-[var(--link)]" : "text-[var(--accent)]"} ${className}`}>
      {children}
    </span>
  );
}

/** Estrelas refinadas. tone "ink" (claro) ou "light" (escuro). */
export function Stars({
  value,
  size = 16,
  tone = "ink",
  className = "",
}: {
  value: number;
  size?: number;
  tone?: "ink" | "light";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const star =
    "M12 2.6l2.92 5.92 6.53.95-4.72 4.6 1.11 6.5L12 18.02 6.16 21.17l1.11-6.5L2.55 10.07l6.53-.95L12 2.6Z";
  const fill = tone === "light" ? "text-white" : "text-[var(--ink)]";
  const track = tone === "light" ? "text-white/25" : "text-[var(--line)]";
  return (
    <span
      className={`relative inline-flex ${className}`}
      style={{ width: size * 5 + 3 * 3, height: size }}
      role="img"
      aria-label={`${value} de 5 estrelas`}
    >
      <span className="absolute inset-0 flex gap-[3px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={track}>
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
      <span className="absolute inset-0 flex gap-[3px] overflow-hidden" style={{ width: `${pct}%` }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" className={`shrink-0 ${fill}`}>
            <path d={star} fill="currentColor" />
          </svg>
        ))}
      </span>
    </span>
  );
}
