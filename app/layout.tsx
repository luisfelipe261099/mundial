import type { Metadata } from "next";
import {
  Outfit,
  Work_Sans,
  JetBrains_Mono,
  Bricolage_Grotesque,
  Space_Mono,
} from "next/font/google";
import "./globals.css";
import { business, fullAddress, mapsLink, siteUrl } from "./_data/business";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700", "800"],
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700"],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-tech",
  weight: ["400", "500"],
});

// Fontes de marca "Oficina Noturna" — mesmas do site (v2), agora disponíveis
// para o app do cliente e o painel da oficina, para coesão de plataforma.
// Bricolage = display-pôster; Space Mono = rótulos técnicos.
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["600", "700", "800"],
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-spacemono",
  weight: ["400", "700"],
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
