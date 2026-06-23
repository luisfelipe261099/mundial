import { faturamentoMensal } from "../_data/mock";
import { BarChart, Panel } from "../_components/ui";
import { FinanceManager, type Lancamento } from "../_components/finance-manager";

const SEED: Lancamento[] = [
  { id: "s1", tipo: "receita", descricao: "OS-2092 — Freios Golf", categoria: "Serviços", valor: 860, data: "20/06" },
  { id: "s2", tipo: "receita", descricao: "Venda de óleo + filtros", categoria: "Peças", valor: 540, data: "19/06" },
  { id: "s3", tipo: "receita", descricao: "OS-2088 — Troca de óleo", categoria: "Serviços", valor: 300, data: "18/06" },
  { id: "s4", tipo: "despesa", descricao: "Compra de pastilhas (Bosch)", categoria: "Compras", valor: 1200, data: "18/06" },
  { id: "s5", tipo: "despesa", descricao: "Folha de pagamento", categoria: "Salários", valor: 18600, data: "05/06" },
  { id: "s6", tipo: "despesa", descricao: "Aluguel do galpão", categoria: "Aluguel", valor: 6500, data: "05/06" },
];

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <FinanceManager seed={SEED} />
      <Panel title="Faturamento — últimos 6 meses" bodyClass="p-5">
        <BarChart data={faturamentoMensal} />
      </Panel>
    </div>
  );
}
