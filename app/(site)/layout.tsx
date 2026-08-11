import localFont from "next/font/local";
import "./v2.css";

// Tipografia do site principal (tema escuro editorial "Oficina Noturna").
// Arquivos locais em app/_fonts — ver o comentário no layout raiz.
const bricolage = localFont({
  src: "../_fonts/bricolage-var.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});
const hanken = localFont({
  src: "../_fonts/hanken-var.woff2",
  variable: "--font-hanken",
  weight: "100 900",
  display: "swap",
});
const spaceMono = localFont({
  src: [
    { path: "../_fonts/space-mono-400.woff2", weight: "400", style: "normal" },
    { path: "../_fonts/space-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-spacemono",
  display: "swap",
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
