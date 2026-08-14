import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer traz deps nativas de Node (fontkit) que não podem
  // passar pelo bundler — mantém o pacote externo no server. O SDK da NFS-e
  // referencia schemas via import.meta.url, que o bundler não resolve.
  serverExternalPackages: ["@react-pdf/renderer", "@useinvio/nfse-sdk"],
};

export default nextConfig;
