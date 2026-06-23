import { notFound } from "next/navigation";
import { requireClientId } from "@/lib/auth";
import { getOrcamento } from "@/lib/client-data";
import { BudgetDetail } from "../../_components/budget-detail";

export default async function OrcamentoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = await requireClientId();
  const orcamento = await getOrcamento(id, clientId);
  if (!orcamento) notFound();

  return <BudgetDetail orcamento={orcamento} />;
}
