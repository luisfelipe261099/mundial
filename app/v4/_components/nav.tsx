"use client";

import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { business } from "../../_data/business";
import { WhatsAppPill } from "./ui";

const links = [
  { href: "#servicos", label: "Serviços" },
  { href: "#oficina", label: "A Oficina" },
  { href: "#avaliacoes", label: "Avaliações" },
  { href: "#contato", label: "Contato" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="frost fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[var(--dark)]/70">
      <nav className="mx-auto flex h-12 max-w-[1024px] items-center justify-between px-5 sm:px-6">
        <Link href="#topo" className="flex items-center gap-2">
          <Image
            src="/images/logo.png"
            alt={business.name}
            width={28}
            height={28}
            priority
            className="h-7 w-7 rounded-full"
          />
          <span className="v4-semi text-[15px] text-white">Mundial</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[12px] font-medium text-white/80 transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:block">
          <WhatsAppPill label="WhatsApp" className="px-4 py-1.5 text-[13px]" />
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          className="grid h-9 w-9 place-items-center rounded-full text-white md:hidden"
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
            className="overflow-hidden border-t border-white/10 bg-[var(--dark)]/90 md:hidden"
          >
            <div className="flex flex-col px-5 py-4">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-white/10 py-3.5 text-[15px] font-medium text-white/85 hover:text-white"
                >
                  {l.label}
                </a>
              ))}
              <WhatsAppPill className="mt-4 w-full" onClick={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
