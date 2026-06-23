import { getClientesVeiculosParaOS } from "@/lib/admin-data";
import { NewOrderForm } from "../../_components/new-order-form";

export default async function NovaOrdemPage() {
  const { clientes, veiculos } = await getClientesVeiculosParaOS();
  return <NewOrderForm clientes={clientes} veiculos={veiculos} />;
}
