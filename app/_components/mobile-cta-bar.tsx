"use client";

import { CalendarDays, MessageCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { whatsappUrl } from "../_data/business";

/**
 * Barra de CTA fixa só no mobile (< md). Aparece depois de rolar o hero e
 * mantém "Agendar" + "WhatsApp" sempre ao alcance do polegar. No desktop o
 * cabeçalho já tem o botão "Agendar" fixo, então a barra fica escondida.
 */
export function MobileCtaBar() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: 90 }}
          animate={reduce ? { opacity: 1 } : { y: 0 }}
          exit={reduce ? { opacity: 0 } : { y: 90 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 bottom-0 z-40 flex gap-2.5 border-t border-line bg-surface/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
          <Link
            href="/agendar"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3.5 font-semibold text-white shadow-lift transition-transform active:translate-y-px"
          >
            <CalendarDays size={19} />
            Agendar
          </Link>
          <a
            href={whatsappUrl(
              "Olá! Vim pelo site da Auto Mecânica Mundial e gostaria de um orçamento.",
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 font-semibold text-white shadow-accent transition-transform active:translate-y-px"
          >
            <MessageCircle size={19} />
            WhatsApp
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
