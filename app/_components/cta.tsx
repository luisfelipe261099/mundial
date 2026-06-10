import { CalendarDays, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import { business, whatsappUrl } from "../_data/business";

/** Botão primário "Agendar horário" (azul da marca). Leva para /agendar. */
export function AgendarButton({
  label = "Agendar horário",
  className = "",
  onClick,
}: {
  label?: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/agendar"
      onClick={onClick}
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-brand px-6 py-3.5 font-semibold text-white shadow-lift transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-strong active:translate-y-0 ${className}`}
    >
      <CalendarDays size={20} />
      {label}
    </Link>
  );
}

/** Botão primário de WhatsApp (acento laranja). Min-height 52px (touch-target). */
export function WhatsAppButton({
  label = "Orçamento no WhatsApp",
  message,
  className = "",
}: {
  label?: string;
  message?: string;
  className?: string;
}) {
  return (
    <a
      href={whatsappUrl(message)}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-3.5 font-semibold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-strong active:translate-y-0 ${className}`}
    >
      <MessageCircle
        size={20}
        className="transition-transform duration-200 group-hover:rotate-[-8deg]"
      />
      {label}
    </a>
  );
}

/** Botão secundário "Ligar" (contorno). */
export function PhoneButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={business.phoneHref}
      className={`inline-flex items-center justify-center gap-2.5 rounded-full border border-line bg-surface px-6 py-3.5 font-semibold text-ink transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:text-brand ${className}`}
    >
      <Phone size={18} />
      {business.phoneDisplay}
    </a>
  );
}
