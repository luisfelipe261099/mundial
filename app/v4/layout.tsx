import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { business } from "../_data/business";
import "./v4.css";

// Tipografia da Opção D — uma única família limpa (Manrope) em vários pesos,
// no espírito de sistema tipográfico único da Apple.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${business.name} — Opção D (Essencial)`,
  description:
    "Versão alternativa de layout (minimalista sofisticado) para comparação. Auto Mecânica Mundial — Curitiba.",
  robots: { index: false, follow: false },
};

export default function V4Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`v4-root ${manrope.variable} relative min-h-screen overflow-x-hidden`}>
      {children}
    </div>
  );
}
