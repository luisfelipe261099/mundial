import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// Download do XML autorizado da NFS-e (documento fiscal oficial). Só admin.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; notaId: string }> }
) {
  const session = await getSession();
  if (!session || session.kind !== "admin") {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const { id, notaId } = await params;
  const nota = await prisma.fiscalNota.findUnique({ where: { id: notaId } });
  if (!nota || nota.serviceOrderId !== id || !nota.nfseXml) {
    return NextResponse.json({ error: "Nota não encontrada." }, { status: 404 });
  }
  return new NextResponse(nota.nfseXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="nfse-${nota.chaveAcesso ?? nota.id}.xml"`,
    },
  });
}
