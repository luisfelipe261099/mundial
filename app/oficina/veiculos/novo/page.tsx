import { getClientesVeiculosParaOS } from "@/lib/admin-data";
import { NovoVeiculoForm } from "./novo-veiculo-form";

export default async function NovoVeiculoPage() {
  const { clientes } = await getClientesVeiculosParaOS();
  return <NovoVeiculoForm clientes={clientes} />;
}
