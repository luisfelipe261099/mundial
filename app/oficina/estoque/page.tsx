import { estoque } from "../_data/mock";
import { StockManager } from "../_components/stock-manager";

export default function EstoquePage() {
  return <StockManager seed={estoque} />;
}
