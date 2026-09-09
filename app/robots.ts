import type { MetadataRoute } from "next";
import { siteUrl } from "./_data/business";

// Só a landing é pública. Painel da oficina, app do cliente, app do mecânico e
// rotas de API não têm o que indexar — e manter isso fora do índice concentra
// a autoridade do domínio na página que precisa ranquear.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/oficina", "/app", "/mecanico", "/api", "/login", "/primeiro-acesso", "/tutorial"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
