import type { MetadataRoute } from "next";
import { siteUrl } from "./_data/business";

export default function robots(): MetadataRoute.Robots {
  return {
    // Só o site institucional é indexável. As áreas logadas já têm noindex nos
    // layouts, mas sem o disallow os crawlers continuam batendo nelas.
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/oficina", "/mecanico", "/api", "/login", "/cadastro", "/primeiro-acesso"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
