import { getClientesVeiculosParaOS } from "@/lib/admin-data";
import { EntradaForm } from "../_components/entrada-form";

// searchParams é Promise no Next 16 — mesmo padrão de params em
// app/oficina/ordens/[id]/page.tsx.
export default async function EntradaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; veiculo?: string }>;
}) {
  const [{ cliente, veiculo }, { clientes, veiculos }] = await Promise.all([
    searchParams,
    getClientesVeiculosParaOS(),
  ]);
  return (
    <EntradaForm
      clientes={clientes}
      veiculos={veiculos}
      clienteInicial={cliente}
      veiculoInicial={veiculo}
    />
  );
}
