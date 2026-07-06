import { requireClientId } from "@/lib/auth";
import { getVeiculos } from "@/lib/client-data";
import { SolicitarForm } from "./solicitar-form";

export default async function SolicitarPage() {
  const clientId = await requireClientId();
  const veiculos = await getVeiculos(clientId);
  return (
    <SolicitarForm
      veiculos={veiculos.map((v) => ({ id: v.id, modelo: v.modelo, placa: v.placa }))}
    />
  );
}
