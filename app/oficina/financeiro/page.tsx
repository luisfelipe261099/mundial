import { TrendingUp } from "lucide-react";
import { getLancamentos, faturamentoMensal } from "@/lib/admin-data";
import { BarChart, Panel, PageHeader } from "../_components/ui";
import { FinanceManager } from "../_components/finance-manager";

export default async function FinanceiroPage() {
  const lancamentos = await getLancamentos();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Caixa da oficina"
        title="Financeiro"
        description="Receitas e despesas do período, com lançamentos e faturamento consolidado."
      />
      <FinanceManager seed={lancamentos} />
      <Panel title="Faturamento" eyebrow="Últimos 6 meses" icon={TrendingUp} bodyClass="p-5">
        <BarChart data={faturamentoMensal} />
      </Panel>
    </div>
  );
}
