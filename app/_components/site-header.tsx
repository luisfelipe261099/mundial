"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { business } from "../_data/business";
import { AgendarButton, WhatsAppButton } from "./cta";
import { InstagramIcon } from "./icons";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#diferenciais", label: "Diferenciais" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#localizacao", label: "Localização" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line bg-surface/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <Link href="#topo" className="flex items-center gap-2.5">
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={40}
            height={40}
            priority
            className="h-10 w-10 rounded-full ring-1 ring-line"
          />
          <span className="font-display text-lg font-extrabold uppercase leading-none tracking-tight text-ink">
            {business.shortName}
            <span className="text-accent">.</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-body transition-colors hover:text-brand"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={business.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram da Auto Mecânica Mundial"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <InstagramIcon size={18} />
          </a>
          <AgendarButton label="Agendar" className="px-5 py-2.5 text-sm" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="grid h-10 w-10 place-items-center rounded-lg border border-line bg-surface text-ink md:hidden"
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
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b border-line bg-surface md:hidden"
          >
            <div className="flex flex-col gap-1 px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-body hover:bg-brand-soft hover:text-brand"
                >
                  {l.label}
                </a>
              ))}
              <AgendarButton className="mt-2" onClick={() => setOpen(false)} />
              <WhatsAppButton label="Falar no WhatsApp" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
