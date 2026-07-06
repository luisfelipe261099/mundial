import { getEstoque, getMovimentacoes } from "@/lib/admin-data";
import { StockManager } from "../_components/stock-manager";
import { StockHistory } from "../_components/stock-history";

export default async function EstoquePage() {
  const [estoque, movs] = await Promise.all([getEstoque(), getMovimentacoes()]);
  return (
    <div className="space-y-6">
      <StockManager seed={estoque} />
      <StockHistory movs={movs} />
    </div>
  );
}
