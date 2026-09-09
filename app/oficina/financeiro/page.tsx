import { TrendingUp } from "lucide-react";
import { getLancamentos, getFaturamentoMensal } from "@/lib/admin-data";
import { BarChart, Panel, PageHeader } from "../_components/ui";
import { FinanceManager } from "../_components/finance-manager";

export default async function FinanceiroPage() {
  const [lancamentos, faturamento] = await Promise.all([getLancamentos(), getFaturamentoMensal()]);
  const temFaturamento = faturamento.some((m) => m.valor > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Caixa da oficina"
        title="Financeiro"
        description="Receitas e despesas com filtros por período, categoria e forma de pagamento — e exportação para planilha."
      />
      <FinanceManager seed={lancamentos} />
      <Panel title="Faturamento" eyebrow="Últimos 6 meses" icon={TrendingUp} bodyClass="p-5">
        {temFaturamento ? (
          <BarChart data={faturamento} />
        ) : (
          <p className="text-sm adm-muted">
            Sem receitas lançadas nos últimos 6 meses. O gráfico aparece assim que houver movimento.
          </p>
        )}
      </Panel>
    </div>
  );
}
