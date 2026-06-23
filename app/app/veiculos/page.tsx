import { veiculos } from "../_data/mock";
import { VehicleCard } from "../_components/vehicle-card";

export default function VeiculosPage() {
  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <p className="text-sm t-muted">
        {veiculos.length} veículos cadastrados
      </p>
      <div className="space-y-4">
        {veiculos.map((v) => (
          <VehicleCard key={v.id} veiculo={v} />
        ))}
      </div>
    </div>
  );
}
