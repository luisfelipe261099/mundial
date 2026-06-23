import { getEstoque } from "@/lib/admin-data";
import { StockManager } from "../_components/stock-manager";

export default async function EstoquePage() {
  const estoque = await getEstoque();
  return <StockManager seed={estoque} />;
}
