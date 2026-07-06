import Link from "next/link";
import Image from "next/image";
import { Car } from "lucide-react";
import type { Veiculo } from "../_data/mock";
import { CopyPlate } from "./copy-plate";

// Logos reais das marcas (baixados em public/images/brands). Fallback: inicial.
const LOGO_SLUG: Record<string, string> = {
  volkswagen: "volkswagen",
  vw: "volkswagen",
  chevrolet: "chevrolet",
  toyota: "toyota",
  honda: "honda",
  hyundai: "hyundai",
  fiat: "fiat",
};
function brandLogo(brand: string): string | null {
  const slug = LOGO_SLUG[brand.trim().toLowerCase()];
  return slug ? `/images/brands/${slug}.png` : null;
}

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
  const logo = brandLogo(veiculo.marca);

  const inner = (
    <>
      {/* brilho + silhueta do carro (sem render fotográfico — depende de asset) */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 top-1/2 size-56 -translate-y-1/2 rounded-full bg-white/10 blur-2xl"
      />
      <Car
        className="pointer-events-none absolute -bottom-4 -right-5 size-56 text-white/20"
        strokeWidth={1}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <span className="grid size-11 place-items-center overflow-hidden rounded-full bg-white text-sm font-extrabold text-[#0a0a0c] shadow-md ring-1 ring-white/40">
          {logo ? (
            <Image src={logo} alt={veiculo.marca} width={28} height={28} className="size-7 object-contain" />
          ) : (
            selo
          )}
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
