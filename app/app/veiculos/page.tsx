import { requireClientId } from "@/lib/auth";
import { getVeiculos } from "@/lib/client-data";
import { VehicleCard } from "../_components/vehicle-card";

export default async function VeiculosPage() {
  const clientId = await requireClientId();
  const veiculos = await getVeiculos(clientId);

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <p className="text-sm t-muted">{veiculos.length} veículos cadastrados</p>
      {veiculos.length ? (
        <div className="space-y-4">
          {veiculos.map((v) => (
            <VehicleCard key={v.id} veiculo={v} />
          ))}
        </div>
      ) : (
        <div className="app-card p-5 text-sm t-muted">Nenhum veículo cadastrado.</div>
      )}
    </div>
  );
}
