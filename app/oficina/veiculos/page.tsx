import Link from "next/link";
import { Plus } from "lucide-react";
import { getVeiculos } from "@/lib/admin-data";
import { PageHeader } from "../_components/ui";
import { VehiclesTable } from "../_components/vehicles-table";

export default async function VeiculosAdminPage() {
  const veiculos = await getVeiculos();
  const vencidas = veiculos.filter((v) => v.revisaoVencida).length;

  return (
    <div>
      <PageHeader
        eyebrow="Frota atendida"
        title="Veículos"
        description="Veículos cadastrados, quilometragem e controle de próxima revisão."
        stats={[
          { label: "veículos", value: veiculos.length.toString() },
          { label: "revisões vencidas", value: vencidas.toString(), accent: vencidas > 0 },
        ]}
        action={
          <Link
            href="/oficina/veiculos/novo"
            className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
          >
            <Plus className="size-4" />
            Novo veículo
          </Link>
        }
      />

      <VehiclesTable veiculos={veiculos} />
    </div>
  );
}
