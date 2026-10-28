import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Entrega a foto guardada no banco. Exige sessão (equipe ou cliente) — o id é
// um cuid, mas foto de carro de cliente não fica aberta na internet.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return new Response("Não autorizado", { status: 401 });

  const { id } = await params;
  const foto = await prisma.photo.findUnique({
    where: { id },
    select: { mime: true, data: true },
  });
  if (!foto) return new Response("Foto não encontrada", { status: 404 });

  return new Response(new Uint8Array(foto.data), {
    headers: {
      "Content-Type": foto.mime,
      // O conteúdo de um id nunca muda — pode ficar no cache do aparelho.
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}

// Apagar de verdade quando a equipe remove a foto da OS — senão o banco só cresce.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || (session.kind !== "admin" && session.kind !== "mecanico")) {
    return new Response("Não autorizado", { status: 401 });
  }
  const { id } = await params;
  await prisma.photo.deleteMany({ where: { id } });
  return new Response(null, { status: 204 });
}
