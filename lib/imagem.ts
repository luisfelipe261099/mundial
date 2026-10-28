// Preparo das fotos no próprio aparelho, antes de subir.
//
// Foto de celular hoje sai com 4–12 MB. Subir isso na 4G da oficina é lento e
// enche o Blob à toa — 1600px de lado já mostra risco, amassado e placa com
// folga. O `imageOrientation: "from-image"` também resolve a foto deitada:
// o celular grava a rotação no EXIF, e sem isso o canvas ignora.

export interface FotoPronta {
  blob: Blob;
  nome: string;
}

const LADO_MAX = 1600;
const QUALIDADE = 0.72;

function trocaExtensao(nome: string, ext: string) {
  return `${nome.replace(/\.[^.]+$/, "")}.${ext}`;
}

export async function prepararFoto(file: File): Promise<FotoPronta> {
  const original: FotoPronta = { blob: file, nome: file.name || "foto.jpg" };
  if (!file.type.startsWith("image/")) return original;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const escala = Math.min(1, LADO_MAX / Math.max(bitmap.width, bitmap.height));
    const largura = Math.round(bitmap.width * escala);
    const altura = Math.round(bitmap.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return original;
    ctx.drawImage(bitmap, 0, 0, largura, altura);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((ok) =>
      canvas.toBlob(ok, "image/jpeg", QUALIDADE)
    );
    // Se o original já era menor (print, imagem pequena), não vale trocar.
    if (!blob || blob.size >= file.size) return original;
    return { blob, nome: trocaExtensao(original.nome, "jpg") };
  } catch {
    // HEIC que o navegador não decodifica, memória curta: sobe como veio.
    return original;
  }
}
