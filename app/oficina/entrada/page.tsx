import { getClientesVeiculosParaOS } from "@/lib/admin-data";
import { EntradaForm } from "../_components/entrada-form";

export default async function EntradaPage() {
  const { clientes, veiculos } = await getClientesVeiculosParaOS();
  return <EntradaForm clientes={clientes} veiculos={veiculos} />;
}
