import { requireClientId } from "@/lib/auth";
import { getVeiculos } from "@/lib/client-data";
import { VehicleCard } from "../_components/vehicle-card";
import { AppHeader } from "../_components/app-header";

export default async function VeiculosPage() {
  const clientId = await requireClientId();
  const veiculos = await getVeiculos(clientId);

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <AppHeader
        eyebrow="Garagem"
        title="Meus veículos"
        stats={[{ label: veiculos.length === 1 ? "veículo" : "veículos", value: veiculos.length.toString() }]}
      />
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
