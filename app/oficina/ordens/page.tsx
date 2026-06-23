import { ordens } from "../_data/mock";
import { OrdersTable } from "../_components/orders-table";

export default function OrdensPage() {
  return <OrdersTable ordens={ordens} />;
}
