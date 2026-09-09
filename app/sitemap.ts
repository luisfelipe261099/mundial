import type { MetadataRoute } from "next";
import { siteUrl } from "./_data/business";

// O site é uma landing única: o que existe de indexável é a home. As áreas
// logadas (painel, app do cliente, app do mecânico) ficam fora de propósito —
// o robots.ts também as bloqueia.
export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();
  return [
    {
      url: `${siteUrl}/`,
      lastModified: agora,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
