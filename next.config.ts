import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer traz deps nativas de Node (fontkit) que não podem
  // passar pelo bundler — mantém o pacote externo no server. O SDK da NFS-e
  // referencia schemas via import.meta.url, e o gerador de DANFSe resolve as
  // fontes do pdfmake por require.resolve — nada disso sobrevive ao bundle.
  serverExternalPackages: ["@react-pdf/renderer", "@useinvio/nfse-sdk", "danfse-pdf-generator", "pdfmake"],
  // Garante os TTF do pdfmake dentro da function do DANFSe na Vercel.
  outputFileTracingIncludes: {
    "/oficina/ordens/[id]/nfse/[notaId]/pdf": ["./node_modules/pdfmake/build/fonts/**"],
  },
};

export default nextConfig;
