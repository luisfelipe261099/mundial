"use client";

import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { whatsappUrl } from "../../_data/business";

export function Floating() {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Seletor de versão A · B · C (B ativa) */}
      <div className="fixed bottom-5 left-5 z-50 flex items-center gap-1 rounded-full border border-[var(--line-2)] bg-[var(--ink-2)]/90 p-1 backdrop-blur-md">
        <Link href="/" className="v2-mono px-2 text-[9px] text-[var(--muted)] transition-colors hover:text-[var(--paper)]">Versão</Link>
        {[
          { href: "/v1", label: "A" },
          { href: "/v2", label: "B" },
          { href: "/v3", label: "C" },
          { href: "/v4", label: "D" },
        ].map((v) =>
          v.label === "B" ? (
            <span
              key={v.label}
              className="v2-mono grid h-7 w-7 place-items-center rounded-full bg-[var(--signal)] text-[11px] text-white"
            >
              {v.label}
            </span>
          ) : (
            <Link
              key={v.label}
              href={v.href}
              className="v2-mono grid h-7 w-7 place-items-center rounded-full text-[11px] text-[var(--paper-2)] transition-colors hover:bg-[var(--ink-4)]"
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
            className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[var(--signal)] text-white shadow-[0_18px_40px_-12px_var(--signal)] sm:bottom-7 sm:right-7"
          >
            {!reduce && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--signal)]/40" />
            )}
            <MessageCircle size={26} className="relative" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
