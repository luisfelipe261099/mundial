import { notFound } from "next/navigation";
import Link from "next/link";
import { CalendarPlus, Wrench } from "lucide-react";
import { getVeiculo, ordensServico } from "../../_data/mock";
import { manutencaoBadge } from "../../_components/category";
import { VehicleCard } from "../../_components/vehicle-card";
import { OsRow } from "../../_components/os-row";

const DOT: Record<string, string> = {
  ok: "#22c55e",
  proxima: "#f59e0b",
  vencida: "#ef4444",
};

export default async function VeiculoDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const veiculo = getVeiculo(id);
  if (!veiculo) notFound();

  const historico = ordensServico.filter((o) => o.veiculoId === id);

  const ficha = [
    { label: "Versão", value: veiculo.versao },
    { label: "Cor", value: veiculo.cor },
    { label: "Combustível", value: veiculo.combustivel },
    { label: "Quilometragem", value: `${veiculo.km.toLocaleString("pt-BR")} km` },
    { label: "Placa", value: veiculo.placa },
    { label: "Renavam", value: veiculo.renavam },
  ];

  return (
    <div className="space-y-6 px-5 pb-8 pt-3">
      <VehicleCard veiculo={veiculo} interactive={false} />

      {/* Ficha técnica */}
      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Ficha técnica</h2>
        <div className="app-card grid grid-cols-2 gap-x-4 gap-y-4 p-4">
          {ficha.map((f) => (
            <div key={f.label}>
              <p className="text-xs t-muted">{f.label}</p>
              <p className="text-sm font-semibold t-ink">{f.value}</p>
            </div>
          ))}
          <div className="col-span-2">
            <p className="text-xs t-muted">Chassi</p>
            <p className="font-mono text-sm font-semibold t-ink">{veiculo.chassi}</p>
          </div>
        </div>
      </section>

      {/* Próximas manutenções */}
      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">
          Próximas manutenções
        </h2>
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {veiculo.proximasManutencoes.map((m) => (
            <div key={m.item} className="flex items-center gap-3 py-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: DOT[m.status] }}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[0.95rem] font-semibold t-ink">{m.item}</p>
                <p className="text-xs t-muted">{m.quando}</p>
              </div>
              <span className={manutencaoBadge[m.status].cls}>
                {manutencaoBadge[m.status].label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ações */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/app/agendar"
          className="flex items-center justify-center gap-2 rounded-xl bg-[var(--app-brand)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <CalendarPlus className="size-4" />
          Agendar
        </Link>
        <Link
          href="/app/historico"
          className="app-card-2 flex items-center justify-center gap-2 py-3 text-sm font-semibold t-ink"
        >
          <Wrench className="size-4" />
          Histórico
        </Link>
      </div>

      {/* Histórico deste veículo */}
      {historico.length > 0 && (
        <section>
          <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">
            Últimos serviços
          </h2>
          <div className="app-card divide-y divide-[var(--app-line)] px-4">
            {historico.map((os) => (
              <OsRow key={os.id} os={os} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
