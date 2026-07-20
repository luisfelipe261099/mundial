import { getEstoque, getMovimentacoes } from "@/lib/admin-data";
import { StockManager } from "../_components/stock-manager";
import { StockHistory } from "../_components/stock-history";
import { PageHeader } from "../_components/ui";

export default async function EstoquePage() {
  const [estoque, movs] = await Promise.all([getEstoque(), getMovimentacoes()]);
  const baixo = estoque.filter((p) => p.qtd < p.minimo).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Peças & insumos"
        title="Estoque"
        description="Controle de peças, quantidade mínima e trilha de entradas e saídas."
        stats={[
          { label: "itens", value: estoque.length.toString() },
          { label: "abaixo do mínimo", value: baixo.toString(), accent: baixo > 0 },
        ]}
      />
      <StockManager seed={estoque} />
      <StockHistory movs={movs} />
    </div>
  );
}
