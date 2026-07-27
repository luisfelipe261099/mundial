import { TrendingUp } from "lucide-react";
import { getLancamentos, getFaturamentoMensal } from "@/lib/admin-data";
import { BarChart, Panel, PageHeader } from "../_components/ui";
import { FinanceManager } from "../_components/finance-manager";

export default async function FinanceiroPage() {
  const [lancamentos, faturamentoMensal] = await Promise.all([
    getLancamentos(),
    getFaturamentoMensal(),
  ]);
  const temFaturamento = faturamentoMensal.some((m) => m.valor > 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Caixa da oficina"
        title="Financeiro"
        description="Receitas e despesas do período, com lançamentos e faturamento consolidado."
      />
      <FinanceManager seed={lancamentos} />
      <Panel title="Faturamento" eyebrow="Últimos 6 meses" icon={TrendingUp} bodyClass="p-5">
        {temFaturamento ? (
          <BarChart data={faturamentoMensal} />
        ) : (
          <p className="text-sm adm-muted">
            Nenhuma receita lançada nos últimos 6 meses. O gráfico aparece
            automaticamente conforme as OS forem entregues.
          </p>
        )}
      </Panel>
    </div>
  );
}
