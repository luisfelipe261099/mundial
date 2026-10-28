import fs from "node:fs";
import path from "node:path";
import { Font } from "@react-pdf/renderer";

// Fontes da marca (Outfit = títulos, Work Sans = corpo). Arquivos TTF commitados
// em assets/fonts/ e lidos por caminho de filesystem — sem fetch de rede.
const fontsDir = path.join(process.cwd(), "assets", "fonts");
let registered = false;

export function registerPdfAssets() {
  if (registered) return;

  Font.register({
    family: "Outfit",
    fonts: [
      { src: path.join(fontsDir, "Outfit-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "Outfit-SemiBold.ttf"), fontWeight: 600 },
      { src: path.join(fontsDir, "Outfit-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Work Sans",
    fonts: [
      { src: path.join(fontsDir, "WorkSans-Regular.ttf"), fontWeight: 400 },
      { src: path.join(fontsDir, "WorkSans-SemiBold.ttf"), fontWeight: 600 },
    ],
  });

  // Desliga a hifenização automática — nomes/peças não devem quebrar com hífen.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}

// Fotos da vistoria em data-URI. O render do react-pdf não tolera imagem que
// falha no download, então busca aqui, com prazo curto, e descarta o que não
// vier (ou não for JPEG/PNG — é o que a biblioteca desenha).
export async function carregarFotos(urls: string[], limite = 8): Promise<string[]> {
  // O tipo sai dos bytes, não do cabeçalho: já apareceu PNG servido como
  // image/jpeg, e aí a imagem sai em branco no PDF sem nenhum erro.
  const tipoReal = (buf: Buffer): string | null => {
    if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
    if (buf.length > 8 && buf.subarray(0, 8).toString("hex") === "89504e470d0a1a0a") return "image/png";
    return null; // webp/heic e afins o react-pdf não desenha
  };

  const fotos = await Promise.all(
    urls.slice(0, limite).map(async (url) => {
      try {
        const r = await fetch(url, { signal: AbortSignal.timeout(8000), cache: "no-store" });
        if (!r.ok) return null;
        const buf = Buffer.from(await r.arrayBuffer());
        const tipo = tipoReal(buf);
        if (!tipo) return null;
        return `data:${tipo};base64,${buf.toString("base64")}`;
      } catch {
        return null;
      }
    })
  );
  return fotos.filter((f): f is string => f !== null);
}

// Logo em data-URI (lido uma vez e memoizado). Evita chamada de rede no render.
let logoCache: string | null = null;

export function getLogoDataUri(): string {
  if (logoCache) return logoCache;
  const buf = fs.readFileSync(path.join(process.cwd(), "public", "images", "logo.png"));
  logoCache = `data:image/png;base64,${buf.toString("base64")}`;
  return logoCache;
}
