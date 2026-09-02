import { MessageCircle, Phone } from "lucide-react";
import { business, whatsappUrl } from "../../_data/business";

/* Barra de ação fixa, só no mobile: WhatsApp e Ligar na zona do polegar.
   Substitui o botão flutuante com anel pulsante. Estática, sem animação. */

export function MobileBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-px border-t border-[var(--linha)] bg-[var(--linha)] pb-[env(safe-area-inset-bottom)] md:hidden">
      <a
        href={whatsappUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-[var(--zap)] py-3.5 font-bold text-white"
      >
        <MessageCircle size={19} />
        WhatsApp
      </a>
      <a
        href={business.phoneHref}
        className="flex items-center justify-center gap-2 bg-[var(--cartao)] py-3.5 font-bold text-[var(--tinta)]"
      >
        <Phone size={18} className="text-[var(--azul-link)]" />
        Ligar
      </a>
    </div>
  );
}
