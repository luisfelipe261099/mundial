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
      {/* Seletor de versão A · B · C · D (D ativa) */}
      <div className="frost fixed bottom-5 left-5 z-50 flex items-center gap-1 rounded-full border border-[var(--line)] bg-white/80 p-1 shadow-sm">
        <Link href="/" className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] transition-colors hover:text-[var(--ink)]">Versão</Link>
        {versions.map((v) =>
          v.label === "D" ? (
            <span
              key={v.label}
              className="grid h-7 w-7 place-items-center rounded-full bg-[var(--accent)] text-[12px] font-semibold text-white"
            >
              {v.label}
            </span>
          ) : (
            <Link
              key={v.label}
              href={v.href}
              className="grid h-7 w-7 place-items-center rounded-full text-[12px] font-semibold text-[var(--ink-2)] transition-colors hover:bg-[var(--bg-2)]"
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
            className="fixed bottom-5 right-5 z-50 grid h-14 w-14 place-items-center rounded-full bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30 sm:bottom-7 sm:right-7"
          >
            {!reduce && <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/30" />}
            <MessageCircle size={26} className="relative" />
          </motion.a>
        )}
      </AnimatePresence>
    </>
  );
}
