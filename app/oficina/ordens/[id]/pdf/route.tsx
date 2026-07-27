import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrdemParaPdf } from "@/lib/admin-data";
import { registerPdfAssets, getLogoDataUri } from "./assets";
import { ServiceOrderPDF } from "./document";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// slug seguro para o nome do arquivo (remove acentos e caracteres especiais)
function slug(v: string) {
  return v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  // Route Handlers não herdam o layout — a checagem é explícita aqui.
  // Equipe baixa qualquer OS; o cliente baixa apenas as próprias.
  const session = await getSession();
  if (!session) return new Response("Não autorizado", { status: 401 });
  const { id } = await params;

  if (session.kind === "cliente") {
    const propria = await prisma.serviceOrder.findFirst({
      where: { id, clientId: session.id },
      select: { id: true },
    });
    if (!propria) return new Response("Ordem de serviço não encontrada", { status: 404 });
  }

  const os = await getOrdemParaPdf(id);
  if (!os) return new Response("Ordem de serviço não encontrada", { status: 404 });

  registerPdfAssets();
  const geradoEm = new Date().toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    dateStyle: "short",
    timeStyle: "short",
  });

  const pdf = await renderToBuffer(
    <ServiceOrderPDF os={os} logo={getLogoDataUri()} geradoEm={geradoEm} />
  );

  const filename = `${os.id}-${slug(os.cliente)}.pdf`;
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
