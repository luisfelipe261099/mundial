import { requireAdmin } from "@/lib/auth";
import { getFiscalConfigView } from "@/lib/fiscal";
import { PageHeader } from "../_components/ui";
import { FiscalManager } from "./_components/fiscal-manager";

export const dynamic = "force-dynamic";

export default async function FiscalPage() {
  await requireAdmin();
  const config = await getFiscalConfigView();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Fiscal"
        title="Nota fiscal (NFS-e)"
        description="Emissão gratuita de NFS-e pela API oficial do governo (padrão nacional, nfse.gov.br) — Curitiba usa esse padrão desde janeiro/2026. Configure o certificado A1 e os dados do emitente; depois, cada OS ganha o botão de emitir a nota da mão de obra."
        stats={[
          {
            label: "certificado",
            value: config.temCertificado ? (config.certVencido ? "vencido" : "ok") : "pendente",
            accent: !config.temCertificado || config.certVencido,
          },
          { label: "ambiente", value: config.ambiente === "producao" ? "produção" : "testes" },
          { label: "próxima DPS", value: `${config.serie}/${config.proximoNumero}` },
        ]}
      />
      <FiscalManager config={config} />
    </div>
  );
}
