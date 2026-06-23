import Link from "next/link";
import { Car } from "lucide-react";
import type { Veiculo } from "../_data/mock";
import { CopyPlate } from "./copy-plate";

// Card de veículo do estilo da referência. Sem recorte do carro (não temos o
// asset): gradiente + selo da marca + silhueta de carro como textura de fundo.
// interactive=false vira um banner estático (usado como cabeçalho do detalhe).
export function VehicleCard({
  veiculo,
  interactive = true,
}: {
  veiculo: Veiculo;
  interactive?: boolean;
}) {
  const selo =
    veiculo.marcaCurta.length <= 3 ? veiculo.marcaCurta : veiculo.marca.charAt(0);

  const inner = (
    <>
      <Car
        className="pointer-events-none absolute -bottom-7 -right-6 size-44 text-white/10"
        strokeWidth={1}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span className="grid size-11 place-items-center rounded-full bg-white/15 text-sm font-bold text-white ring-1 ring-white/25">
          {selo}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-white/70">{veiculo.marca}</p>
          <p className="app-display text-xl font-extrabold leading-tight text-white">
            {veiculo.modelo}
          </p>
          <span className="mt-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold text-white/90 ring-1 ring-white/20">
            {veiculo.ano}
          </span>
        </div>
      </div>
      <div className="relative mt-7">
        <CopyPlate placa={veiculo.placa} />
      </div>
    </>
  );

  const className = `relative block overflow-hidden rounded-3xl p-5 ${veiculo.gradiente}`;

  if (!interactive) {
    return <div className={className}>{inner}</div>;
  }

  return (
    <Link href={`/app/veiculos/${veiculo.id}`} className={className}>
      {inner}
    </Link>
  );
}
