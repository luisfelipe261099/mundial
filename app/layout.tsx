import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { business, fullAddress, mapsLink, siteUrl } from "./_data/business";

// Fontes hospedadas no próprio projeto (app/_fonts, subset latino).
// Antes vinham do next/font/google, que baixa do Google durante o build — uma
// falha de rede lá derrubava o deploy inteiro e a Vercel mantinha a versão
// anterior no ar sem aviso. Agora o build não depende de rede externa.
// Cinco delas são variáveis: um arquivo só cobre toda a faixa de peso.
const outfit = localFont({
  src: "./_fonts/outfit-var.woff2",
  variable: "--font-outfit",
  weight: "100 900",
  display: "swap",
});

const workSans = localFont({
  src: "./_fonts/work-sans-var.woff2",
  variable: "--font-work-sans",
  weight: "100 900",
  display: "swap",
});

const jetBrainsMono = localFont({
  src: "./_fonts/jetbrains-mono-var.woff2",
  variable: "--font-mono-tech",
  weight: "100 800",
  display: "swap",
});

// Fontes de marca "Oficina Noturna" — mesmas do site (v2), agora disponíveis
// para o app do cliente e o painel da oficina, para coesão de plataforma.
// Bricolage = display-pôster; Space Mono = rótulos técnicos.
const bricolage = localFont({
  src: "./_fonts/bricolage-var.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

const spaceMono = localFont({
  src: [
    { path: "./_fonts/space-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./_fonts/space-mono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-spacemono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${business.name} — Oficina mecânica de confiança em Curitiba`,
  description: `Manutenção e reparo automotivo com transparência em Curitiba/PR. Nota ${business.rating.toString().replace(".", ",")} no Google (${business.reviewCount} avaliações). Oficina limpa, preço justo e serviço de primeira. Orçamento pelo WhatsApp.`,
  keywords: [
    "mecânica Curitiba",
    "oficina mecânica Curitiba",
    "Auto Mecânica Mundial",
    "troca de óleo Curitiba",
    "revisão automotiva Uberaba Curitiba",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: `${business.name} — Oficina de confiança em Curitiba`,
    description:
      "Oficina limpa, preço justo e serviço de primeira. Orçamento sem compromisso pelo WhatsApp.",
    url: siteUrl,
    siteName: business.name,
    locale: "pt_BR",
    type: "website",
  },
  // O card de imagem vem de app/opengraph-image.tsx (og:image + twitter:image).
  twitter: {
    card: "summary_large_image",
    title: `${business.name} — Oficina de confiança em Curitiba`,
    description:
      "Oficina limpa, preço justo e serviço de primeira. Orçamento sem compromisso pelo WhatsApp.",
  },
};

// Dados estruturados (schema.org AutoRepair) — ajuda SEO local e rich results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "AutoRepair",
  "@id": `${siteUrl}/#oficina`,
  name: business.name,
  url: siteUrl,
  telephone: business.phoneHref.replace("tel:", ""),
  priceRange: "$$",
  image: [
    `${siteUrl}/images/real-garage.jpg`,
    `${siteUrl}/images/real-diagnostic.jpg`,
  ],
  sameAs: [business.instagram, business.googleReviewsUrl],
  hasMap: mapsLink,
  areaServed: {
    "@type": "City",
    name: `${business.address.city}, ${business.address.state}`,
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: business.address.street,
    addressLocality: business.address.city,
    addressRegion: business.address.state,
    postalCode: business.address.zip,
    addressCountry: "BR",
  },
  // Horários reais da oficina (espelham business.hours).
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "08:00",
      closes: "12:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: business.rating,
    reviewCount: business.reviewCount,
    bestRating: 5,
  },
  description: `Oficina mecânica em Curitiba. ${fullAddress}.`,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${outfit.variable} ${workSans.variable} ${jetBrainsMono.variable} ${bricolage.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
