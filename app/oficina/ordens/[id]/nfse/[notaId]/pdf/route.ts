import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// DANFSe (PDF da NFS-e), gerado localmente a partir do XML autorizado —
// a API de PDF do governo foi desligada em jul/2026, então o documento
// impresso sai daqui. Segue a NT 008/2026 via danfse-pdf-generator.
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

  try {
    const { parseNfseXml, generateDanfsePdf } = await import("danfse-pdf-generator");
    const dados = parseNfseXml(nota.nfseXml);
    const pdf = await generateDanfsePdf(dados, {
      ambienteGerador: nota.ambiente === "producao" ? "1" : "2",
    });
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="danfse-${nota.chaveAcesso ?? nota.id}.pdf"`,
      },
    });
  } catch (e) {
    // O XML fica disponível de qualquer forma — o PDF é um documento auxiliar.
    return NextResponse.json(
      {
        error: `Não consegui gerar o PDF desta nota: ${e instanceof Error ? e.message : "erro inesperado"}. O XML (documento fiscal oficial) continua disponível no botão "Baixar XML".`,
      },
      { status: 500 }
    );
  }
}
