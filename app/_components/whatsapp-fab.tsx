"use client";

import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { whatsappUrl } from "../_data/business";

/** Botão flutuante de WhatsApp — aparece após rolar e pulsa sutilmente. */
export function WhatsAppFab() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={whatsappUrl()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Falar no WhatsApp"
          initial={{ opacity: 0, scale: 0.6, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: "spring", stiffness: 320, damping: 22 }}
          /* Escondido no mobile: lá quem cobre o WhatsApp é a MobileCtaBar.
             No desktop/tablet (md+) o FAB aparece normalmente. */
          className="fixed bottom-5 right-5 z-40 hidden h-14 w-14 place-items-center rounded-full bg-accent text-white shadow-accent sm:bottom-7 sm:right-7 md:grid"
        >
          {!reduce && (
            <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
          )}
          <MessageCircle size={26} className="relative" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
