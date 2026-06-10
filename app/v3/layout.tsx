import type { Metadata } from "next";
import { Archivo, Instrument_Sans } from "next/font/google";
import { business } from "../_data/business";
import "./v3.css";

// Tipografia da Opção C — grotesca confiante (Archivo, pesos altos) p/ títulos
// + Instrument Sans no corpo. Sem repetir nenhuma das outras versões.
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["500", "600", "700", "800", "900"],
});
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: `${business.name} — Opção C (Grande Marca)`,
  description:
    "Versão alternativa de layout (padrão montadora, imersivo) para comparação. Auto Mecânica Mundial — Curitiba.",
  robots: { index: false, follow: false },
};

export default function V3Layout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v3-root ${archivo.variable} ${instrument.variable} relative min-h-screen overflow-x-hidden`}
    >
      {children}
    </div>
  );
}
