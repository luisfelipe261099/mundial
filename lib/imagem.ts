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

// 1400px e qualidade 0.65 deixam a foto em ~200 KB: risco, amassado e placa
// continuam legíveis, e o banco não engorda (as fotos ficam lá até existir um
// armazenamento externo).
const LADO_MAX = 1400;
const QUALIDADE = 0.65;

// Teto do que o servidor aceita por foto. Acima disso a requisição nem chega.
const ENVIO_MAX = 4 * 1024 * 1024;

function trocaExtensao(nome: string, ext: string) {
  return `${nome.replace(/\.[^.]+$/, "")}.${ext}`;
}

// Prepara e envia a foto. Devolve a URL que deve ser guardada na OS — pode
// ser uma URL do Blob ou /api/fotos/<id>, quem decide é o servidor.
export async function enviarFoto(
  file: File,
  destino: { osId?: string; kind: "vistoria" | "servico" }
): Promise<string> {
  const pronta = await prepararFoto(file);
  if (pronta.blob.size > ENVIO_MAX) {
    // Só acontece quando o navegador não conseguiu abrir a imagem (HEIC antigo,
    // arquivo estranho) e ela seguiu do jeito que veio.
    throw new Error("Essa foto é grande demais. Tire de novo pela câmera do app.");
  }
  const form = new FormData();
  form.append("file", new File([pronta.blob], pronta.nome, { type: pronta.blob.type }));
  form.append("kind", destino.kind);
  if (destino.osId) form.append("osId", destino.osId);

  const r = await fetch("/api/fotos", { method: "POST", body: form });
  const dados = (await r.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!r.ok || !dados?.url) {
    throw new Error(dados?.error ?? "Não foi possível enviar a foto.");
  }
  return dados.url;
}

// Apaga a foto do banco quando ela sai da OS. Guardada fora (Blob), não há o
// que apagar aqui — e falhar não pode travar a tela.
export async function apagarFoto(url: string): Promise<void> {
  if (!url.startsWith("/api/fotos/")) return;
  try {
    await fetch(url, { method: "DELETE" });
  } catch {
    /* some da OS de qualquer jeito */
  }
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
