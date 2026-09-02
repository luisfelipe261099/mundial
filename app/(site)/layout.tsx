import localFont from "next/font/local";
import "./v2.css";

// Tipografia do site: Work Sans (títulos/UI) + Hanken Grotesk (corpo) +
// JetBrains Mono só para dados tabulares (horário, telefone). Arquivos
// locais em app/_fonts — ver o comentário no layout raiz.
const workSans = localFont({
  src: "../_fonts/work-sans-var.woff2",
  variable: "--font-work",
  weight: "100 900",
  display: "swap",
});
const hanken = localFont({
  src: "../_fonts/hanken-var.woff2",
  variable: "--font-hanken",
  weight: "100 900",
  display: "swap",
});
const jetbrains = localFont({
  src: "../_fonts/jetbrains-mono-var.woff2",
  variable: "--font-mono-site",
  weight: "100 800",
  display: "swap",
});

// Sem metadata própria: o site herda o SEO real do layout raiz (indexável).
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`v2-root ${workSans.variable} ${hanken.variable} ${jetbrains.variable} relative min-h-screen overflow-x-hidden`}
    >
      {children}
    </div>
  );
}
