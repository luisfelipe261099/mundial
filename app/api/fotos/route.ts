import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Envio de fotos da OS (vistoria de entrada e serviço).
//
// A foto já chega reduzida pelo navegador (lib/imagem.ts). Onde ela é guardada
// depende do ambiente: se existir um Vercel Blob configurado, vai pra lá; se
// não, fica no próprio Postgres e é servida por /api/fotos/<id>. Assim a
// oficina não fica sem fotos esperando alguém criar um store no painel.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TIPOS = ["image/jpeg", "image/png", "image/webp"];
const LIMITE = 4 * 1024 * 1024; // a foto reduzida fica bem abaixo disso

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.kind !== "admin" && session.kind !== "mecanico")) {
    return NextResponse.json({ error: "Não autorizado a enviar fotos." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Envio inválido." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nenhuma foto enviada." }, { status: 400 });
  }
  const mime = file.type || "image/jpeg";
  if (!TIPOS.includes(mime)) {
    return NextResponse.json({ error: "Formato de imagem não aceito." }, { status: 400 });
  }
  if (file.size > LIMITE) {
    return NextResponse.json({ error: "Foto muito grande (máx. 4 MB)." }, { status: 400 });
  }

  const osId = typeof form.get("osId") === "string" ? (form.get("osId") as string) : null;
  const kind = form.get("kind") === "vistoria" ? "vistoria" : "servico";
  const bytes = Buffer.from(await file.arrayBuffer());

  // Com Blob configurado, a foto vai pra lá (não ocupa banco).
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const nome = `os/${osId ?? "sem-os"}/${kind}/${Date.now()}-${file.name || "foto.jpg"}`;
      const blob = await put(nome, bytes, {
        access: "public",
        contentType: mime,
        addRandomSuffix: true,
      });
      return NextResponse.json({ url: blob.url });
    } catch (e) {
      // Token inválido/expirado não pode custar a foto: cai pro banco.
      console.error("[fotos] Blob falhou, guardando no banco:", e);
    }
  }

  const foto = await prisma.photo.create({
    data: {
      serviceOrderId: osId,
      kind,
      mime,
      size: bytes.length,
      data: bytes,
    },
    select: { id: true },
  });

  return NextResponse.json({ url: `/api/fotos/${foto.id}` });
}
