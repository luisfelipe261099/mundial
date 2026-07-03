import { renderToBuffer } from "@react-pdf/renderer";
import { requireAdmin } from "@/lib/auth";
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
  await requireAdmin(); // Route Handlers não herdam o layout — protege explicitamente.
  const { id } = await params;
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
