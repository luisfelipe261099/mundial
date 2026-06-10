"use client";

import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { whatsappUrl } from "../../_data/business";

const versions = [
  { href: "/v1", label: "A" },
  { href: "/v2", label: "B" },
  { href: "/v3", label: "C" },
  { href: "/v4", label: "D" },
];

export function Floating() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Seletor de versão A · B · C (C ativa) */}
      <div className="fixed bottom-5 left-5 z-50 flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)]/90 p-1 backdrop-blur-md">
        <Link href="/" className="v3-over px-2 text-[9px] text-[var(--muted)] transition-colors hover:text-[var(--fg)]">Versão</Link>
        {versions.map((v) =>
          v.label === "C" ? (
            <span
              key={v.label}
              className="v3-over grid h-7 w-7 place-items-center rounded-full bg-[var(--fg)] text-[11px] text-[var(--bg)]"
            >
              {v.label}
            </span>
          ) : (
            <Link
              key={v.label}
              href={v.href}
              className="v3-over grid h-7 w-7 place-items-center rounded-full text-[11px] text-[var(--fg-2)] transition-colors hover:bg-white/10"
            >
              {v.label}
            </Link>
          ),
        )}
      </div>

      {/* FAB WhatsApp */}
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
            className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[var(--fg)] text-[var(--bg)] shadow-[0_18px_40px_-12px_rgba(0,0,0,0.8)] sm:bottom-7 sm:right-7"
          >
            {!reduce && (
              <span className="absolute inset-0 animate-ping rounded-full bg-white/30" />
            )}
            <MessageCircle size={26} className="relative" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
