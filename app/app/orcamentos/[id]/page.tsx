import { notFound } from "next/navigation";
import { getOrcamento } from "../../_data/mock";
import { BudgetDetail } from "../../_components/budget-detail";

export default async function OrcamentoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orcamento = getOrcamento(id);
  if (!orcamento) notFound();

  return <BudgetDetail orcamento={orcamento} />;
}
