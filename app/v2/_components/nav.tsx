"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { business } from "../../_data/business";
import { WhatsAppCta } from "./ui";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#confianca", label: "Confiança" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#oficina", label: "Oficina" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "border-b border-[var(--line)] bg-[var(--ink)]/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8">
        <Link href="#topo" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={38}
            height={38}
            priority
            className="h-9 w-9 rounded-full ring-1 ring-[var(--line-2)]"
          />
          <span className="v2-display text-[1.15rem] uppercase leading-none tracking-tight text-[var(--paper)]">
            Mundial<span className="text-[var(--signal)]">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="v2-mono text-[11px] text-[var(--paper-2)] transition-colors hover:text-[var(--paper)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          <WhatsAppCta label="WhatsApp" className="px-5 py-2.5 text-xs" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-[3px] border border-[var(--line-2)] text-[var(--paper)] lg:hidden"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-[var(--line)] bg-[var(--ink)] lg:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-5">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="v2-mono border-b border-[var(--line)] py-3.5 text-xs text-[var(--paper-2)] hover:text-[var(--signal)]"
                >
                  {l.label}
                </a>
              ))}
              <WhatsAppCta className="mt-4" onClick={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
