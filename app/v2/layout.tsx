import type { Metadata } from "next";
import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";
import { business } from "../_data/business";
import "./v2.css";

// Tipografia da Opção B — escolhida pra NÃO encostar na Opção A
// (Outfit/Work Sans/JetBrains). Display editorial com personalidade +
// grotesco limpo no corpo + mono "instrumento" nos micro-rótulos.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "600", "700", "800"],
});
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  weight: ["400", "500", "600", "700"],
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-spacemono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: `${business.name} — Opção B (Oficina Noturna)`,
  description:
    "Versão alternativa de layout (tema escuro editorial) para comparação. Auto Mecânica Mundial — Curitiba.",
  // Página de comparação interna: não indexar.
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v2-root ${bricolage.variable} ${hanken.variable} ${spaceMono.variable} relative min-h-screen overflow-x-hidden`}
    >
      <div className="grain-fixed" aria-hidden />
      {children}
    </div>
  );
}
