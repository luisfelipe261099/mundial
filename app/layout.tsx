import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { business, fullAddress, mapsLink, siteUrl } from "./_data/business";
import { PERGUNTAS } from "./(site)/_components/faq";

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

const nota = business.rating.toString().replace(".", ",");
const descricaoSEO = `Oficina mecânica no Uberaba, em Curitiba/PR. Diagnóstico com scanner, troca de óleo, freios, suspensão, câmbio automático e revisão — orçamento por escrito no WhatsApp antes de qualquer serviço. Nota ${nota} no Google com ${business.reviewCount} avaliações.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // O título começa pelo que as pessoas digitam ("oficina mecânica em
  // Curitiba"), e não pelo nome da empresa — quem já sabe o nome acha de
  // qualquer jeito; quem não sabe procura pelo serviço e pela cidade.
  title: {
    default: `Oficina Mecânica em Curitiba — ${business.name} (Uberaba)`,
    template: `%s — ${business.name}`,
  },
  description: descricaoSEO,
  applicationName: business.name,
  authors: [{ name: business.name }],
  creator: business.name,
  publisher: business.name,
  category: "automotive",
  keywords: [
    "oficina mecânica Curitiba",
    "mecânica em Curitiba",
    "oficina mecânica Uberaba Curitiba",
    "oficina mecânica perto de mim Curitiba",
    "troca de óleo Curitiba",
    "diagnóstico eletrônico automotivo Curitiba",
    "troca de fluido câmbio automático Curitiba",
    "manutenção carro híbrido Curitiba",
    "freios e suspensão Curitiba",
    "revisão automotiva Curitiba",
    "mecânico Boqueirão Curitiba",
    business.name,
  ],
  alternates: { canonical: "/" },
  // Libera o preview grande de imagem e texto nos resultados — sem isso o
  // Google encurta o snippet e não usa a foto em rich results.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Preenche NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION na Vercel com o código do
  // Google Search Console para validar a propriedade do site.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: `Oficina Mecânica em Curitiba — ${business.name}`,
    description: descricaoSEO,
    url: siteUrl,
    siteName: business.name,
    locale: "pt_BR",
    type: "website",
  },
  // O card de imagem vem de app/opengraph-image.tsx (og:image + twitter:image).
  twitter: {
    card: "summary_large_image",
    title: `Oficina Mecânica em Curitiba — ${business.name}`,
    description: descricaoSEO,
  },
  other: {
    // Sinais geográficos clássicos, ainda lidos por buscadores e agregadores.
    "geo.region": "BR-PR",
    "geo.placename": `${business.address.district}, ${business.address.city}`,
  },
};

// Serviços oferecidos — viram o catálogo do JSON-LD e ajudam o Google a
// entender para que buscas a oficina é resposta.
const SERVICOS_SEO = [
  "Troca de óleo e filtros",
  "Freios e suspensão",
  "Diagnóstico eletrônico com scanner",
  "Câmbio automático e CVT",
  "Manutenção de veículos híbridos",
  "Revisão completa",
  "Alinhamento e balanceamento",
  "Injeção eletrônica",
  "Embreagem",
  "Motor e elétrica",
];

// Dados estruturados (schema.org) em @graph: a oficina, o site e as perguntas
// frequentes. Alimenta o painel do Google, o rich result de FAQ e a busca local.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "AutoRepair",
      "@id": `${siteUrl}/#oficina`,
      name: business.name,
      alternateName: "Mecânica Mundial Curitiba",
      url: siteUrl,
      telephone: business.phoneHref.replace("tel:", ""),
      email: undefined,
      priceRange: "$$",
      currenciesAccepted: "BRL",
      paymentAccepted: business.formasPagamento.join(", "),
      logo: `${siteUrl}/images/logo.png`,
      image: [
        `${siteUrl}/images/fachada.jpg`,
        `${siteUrl}/images/real-garage.jpg`,
        `${siteUrl}/images/real-diagnostic.jpg`,
      ],
      sameAs: [business.instagram, business.googleReviewsUrl],
      hasMap: mapsLink,
      areaServed: [
        {
          "@type": "City",
          name: `${business.address.city}, ${business.address.state}`,
        },
        ...business.bairrosAtendidos.map((b) => ({
          "@type": "Place" as const,
          name: `${b}, ${business.address.city}/${business.address.state}`,
        })),
      ],
      knowsAbout: SERVICOS_SEO,
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Serviços da oficina",
        itemListElement: SERVICOS_SEO.map((s) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: s, areaServed: business.address.city },
        })),
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
        worstRating: 1,
      },
      description: `Oficina mecânica no Uberaba, em Curitiba/PR. ${fullAddress}.`,
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#site`,
      url: siteUrl,
      name: business.name,
      inLanguage: "pt-BR",
      publisher: { "@id": `${siteUrl}/#oficina` },
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#duvidas`,
      mainEntity: PERGUNTAS.map((f) => ({
        "@type": "Question",
        name: f.p,
        acceptedAnswer: { "@type": "Answer", text: f.r },
      })),
    },
  ],
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
