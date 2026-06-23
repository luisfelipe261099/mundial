import { getLancamentos, faturamentoMensal } from "@/lib/admin-data";
import { BarChart, Panel } from "../_components/ui";
import { FinanceManager } from "../_components/finance-manager";

export default async function FinanceiroPage() {
  const lancamentos = await getLancamentos();

  return (
    <div className="space-y-6">
      <FinanceManager seed={lancamentos} />
      <Panel title="Faturamento — últimos 6 meses" bodyClass="p-5">
        <BarChart data={faturamentoMensal} />
      </Panel>
    </div>
  );
}
