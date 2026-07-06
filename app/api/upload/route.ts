import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

// Emite o token de upload client-side para o Vercel Blob.
// Requer a env BLOB_READ_WRITE_TOKEN (criar um Blob store no painel da Vercel).
// Ver docs/INTEGRACOES.md.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // só a equipe (admin/mecânico) pode enviar fotos de OS
        const session = await getSession();
        if (!session || (session.kind !== "admin" && session.kind !== "mecanico")) {
          throw new Error("Não autorizado a enviar fotos.");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
          maximumSizeInBytes: 10 * 1024 * 1024, // 10 MB
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // a persistência da URL na OS é feita no cliente (salvarFotos) após o upload.
      },
    });
    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
