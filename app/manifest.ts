import type { MetadataRoute } from "next";

// Manifest PWA — torna o app "instalável" na tela inicial (Android/iPhone),
// sem loja de aplicativos. start_url aponta para o app do cliente.
// (Service worker / offline ficam para a fase de backend.)
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Auto Mecânica Mundial",
    short_name: "Mundial",
    description: "Acompanhe seus veículos, revisões, orçamentos e histórico de serviços.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#0a0e17",
    theme_color: "#0a0e17",
    orientation: "portrait",
    icons: [
      { src: "/images/logo.png", sizes: "400x400", type: "image/png", purpose: "any" },
      { src: "/images/logo.png", sizes: "400x400", type: "image/png", purpose: "maskable" },
    ],
  };
}
