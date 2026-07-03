import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer traz deps nativas de Node (fontkit) que não podem
  // passar pelo bundler — mantém o pacote externo no server.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
