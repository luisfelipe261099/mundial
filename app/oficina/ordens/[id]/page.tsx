import { notFound } from "next/navigation";
import { getOrdemControle, getEstoque, getMecanicos, getClientesVeiculosParaOS } from "@/lib/admin-data";
import { getNotasDaOS, getFiscalConfigView } from "@/lib/fiscal";
import { OrderControl } from "../../_components/order-control";

export default async function OrdemDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [os, estoque, mecanicos, cadastros, notas, fiscal] = await Promise.all([
    getOrdemControle(id),
    getEstoque(),
    getMecanicos(),
    getClientesVeiculosParaOS(),
    getNotasDaOS(id),
    getFiscalConfigView(),
  ]);
  if (!os) notFound();

  return (
    <OrderControl
      os={os}
      estoque={estoque}
      mecanicos={mecanicos}
      clientes={cadastros.clientes}
      veiculos={cadastros.veiculos}
      notas={notas}
      fiscalPronto={fiscal.temCertificado && !fiscal.certVencido && fiscal.cnpj !== ""}
      fiscalAmbiente={fiscal.ambiente}
    />
  );
}
