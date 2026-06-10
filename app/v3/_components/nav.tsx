"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { business } from "../../_data/business";
import { ScrollProgress } from "./fx";
import { WhatsAppPrimary } from "./ui";

const links = [
  { href: "#competencias", label: "Competências" },
  { href: "#oficina", label: "A Oficina" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#contato", label: "Contato" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? "border-b border-[var(--line)] bg-[var(--bg)]/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <ScrollProgress />
      <nav className="mx-auto flex h-[76px] max-w-[1280px] items-center justify-between px-5 sm:px-8">
        <Link href="#topo" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={38}
            height={38}
            priority
            className="h-9 w-9 rounded-full ring-1 ring-[var(--line-2)]"
          />
          <span className="v3-mid text-[1.05rem] uppercase leading-none tracking-[0.04em] text-[var(--fg)]">
            Mundial
          </span>
        </Link>

        <div className="hidden items-center gap-9 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="v3-over text-[10px] text-[var(--fg-2)] transition-colors hover:text-[var(--fg)]"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:block">
          <WhatsAppPrimary label="WhatsApp" className="px-5 py-2.5 text-[11px]" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-[2px] border border-[var(--line-2)] text-[var(--fg)] lg:hidden"
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
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-[var(--line)] bg-[var(--bg)] lg:hidden"
          >
            <div className="flex flex-col px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="v3-over border-b border-[var(--line)] py-4 text-[11px] text-[var(--fg-2)] hover:text-[var(--fg)]"
                >
                  {l.label}
                </a>
              ))}
              <WhatsAppPrimary className="mt-4 w-full" onClick={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
