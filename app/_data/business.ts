// Fonte única de verdade do negócio. Edite aqui e o site inteiro acompanha.
// Dados extraídos do perfil do Google da "Auto Mecânica Mundial".

export const business = {
  name: "Auto Mecânica Mundial",
  shortName: "Mundial",
  category: "Mecânica para carros",
  rating: 4.7,
  reviewCount: 74,
  foundedYearsApprox: 15, // ⚠️ ajuste para o tempo real de mercado

  phoneDisplay: "(41) 3016-4359",
  phoneHref: "tel:+554130164359",

  // WhatsApp real da oficina (confirmado no Instagram @mecanicamundialcwb).
  whatsappNumber: "5541997704359",
  whatsappDisplay: "(41) 99770-4359",

  instagram: "https://www.instagram.com/mecanicamundialcwb/",
  instagramHandle: "@mecanicamundialcwb",

  address: {
    street: "Rua Eduardo Victor Piechnik, 149",
    district: "Uberaba",
    city: "Curitiba",
    state: "PR",
    zip: "81560-700",
  },

  // Horário típico de oficina — ⚠️ confirme/ajuste o real.
  hours: [
    { days: "Segunda a Sexta", time: "08:00 – 18:00" },
    { days: "Sábado", time: "08:00 – 12:00" },
    { days: "Domingo", time: "Fechado" },
  ],

  googleReviewsUrl:
    "https://www.google.com/search?q=Auto+Mec%C3%A2nica+Mundial+Curitiba",
} as const;

// ⚠️ Domínio de produção. Troque pelo domínio real antes do deploy — ou
// defina NEXT_PUBLIC_SITE_URL no ambiente (Vercel). Usado em metadataBase,
// OG image, sitemap, robots e dados estruturados (JSON-LD).
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://automecanicamundial.com.br";

export const fullAddress = `${business.address.street} — ${business.address.district}, ${business.address.city}/${business.address.state}, ${business.address.zip}`;

const mapsQuery = `${business.name}, ${business.address.street}, ${business.address.city} - ${business.address.state}`;

export const mapsEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
  mapsQuery
)}&z=15&output=embed`;

export const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  mapsQuery
)}`;

export function whatsappUrl(
  message = "Olá! Vim pelo site e gostaria de um orçamento para o meu carro."
) {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(
    message
  )}`;
}
