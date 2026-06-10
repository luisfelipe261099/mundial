import { ArrowLeft, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Booking } from "../_components/booking";
import { Footer } from "../_components/footer";
import { SiteHeader } from "../_components/site-header";
import { WhatsAppFab } from "../_components/whatsapp-fab";
import { business } from "../_data/business";

export const metadata: Metadata = {
  title: `Agendar horário — ${business.name}`,
  description:
    "Escolha a data e o horário para o serviço do seu carro na Auto Mecânica Mundial. Confirmação rápida pelo WhatsApp, sem compromisso.",
};

export default function AgendarPage() {
  return (
    <>
      <SiteHeader />
      <main className="pt-16">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 aura" />
          <div className="pointer-events-none absolute inset-0 -z-10 blueprint blueprint-fade" />

          <div className="mx-auto max-w-6xl px-5 pb-8 pt-12 sm:px-6 sm:pt-16">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-brand"
            >
              <ArrowLeft size={16} />
              Voltar para o início
            </Link>

            <div className="tech-label mt-6 flex items-center gap-2 text-accent">
              <span>Agendamento</span>
              <span className="h-px w-6 bg-accent/40" />
              <span className="text-muted">Online</span>
            </div>
            <h1 className="mt-3 max-w-2xl font-display text-[2.05rem] font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
              Agende o horário do seu carro
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-body">
              Escolha o melhor dia e horário. A confirmação é feita pelo
              WhatsApp — rápido, sem custo e sem compromisso.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm text-body">
              <ShieldCheck size={16} className="text-brand" />
              Nota {business.rating.toString().replace(".", ",")} no Google ·{" "}
              {business.reviewCount} avaliações
            </p>
          </div>
        </section>

        <Booking />
      </main>
      <Footer />
      <WhatsAppFab />
    </>
  );
}
