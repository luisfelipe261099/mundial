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

// Logo em data-URI (lido uma vez e memoizado). Evita chamada de rede no render.
let logoCache: string | null = null;

export function getLogoDataUri(): string {
  if (logoCache) return logoCache;
  const buf = fs.readFileSync(path.join(process.cwd(), "public", "images", "logo.png"));
  logoCache = `data:image/png;base64,${buf.toString("base64")}`;
  return logoCache;
}
