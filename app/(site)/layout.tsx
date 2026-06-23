import { Bricolage_Grotesque, Hanken_Grotesk, Space_Mono } from "next/font/google";
import "./v2.css";

// Tipografia do site principal (tema escuro editorial "Oficina Noturna").
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

// Sem metadata própria: o site herda o SEO real do layout raiz (indexável).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v2-root ${bricolage.variable} ${hanken.variable} ${spaceMono.variable} relative min-h-screen overflow-x-hidden`}
    >
      <div className="grain-fixed" aria-hidden />
      {children}
    </div>
  );
}
