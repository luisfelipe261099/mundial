import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { brl, osBadgeClass } from "../../_data/mock";
import { getVeiculoDetalhe } from "@/lib/admin-data";

export default async function VeiculoAdminDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getVeiculoDetalhe(id);
  if (!data) notFound();
  const { veiculo, ordens } = data;

  const ficha = [
    { label: "Proprietário", value: veiculo.proprietario },
    { label: "Placa", value: veiculo.placa },
    { label: "Ano", value: veiculo.ano.toString() },
    { label: "Quilometragem", value: `${veiculo.km.toLocaleString("pt-BR")} km` },
  ];

  return (
    <div className="space-y-6">
      <Link href="/oficina/veiculos" className="inline-flex items-center gap-1.5 text-sm font-semibold adm-muted hover:adm-brand">
        <ArrowLeft className="size-4" />
        Veículos
      </Link>

      <div>
        <h2 className="adm-display text-2xl font-bold adm-ink">{veiculo.modelo}</h2>
        <p className="font-mono text-sm adm-muted">{veiculo.placa}</p>
      </div>

      <div className="adm-card grid grid-cols-2 gap-x-4 gap-y-4 p-5 sm:grid-cols-4">
        {ficha.map((f) => (
          <div key={f.label}>
            <p className="text-xs adm-muted">{f.label}</p>
            <p className="text-sm font-semibold adm-ink">{f.value}</p>
          </div>
        ))}
        <div className="col-span-2 sm:col-span-4">
          <p className="text-xs adm-muted">Próxima revisão</p>
          {veiculo.revisaoVencida ? (
            <span className="osb osb-aguardando mt-1">Vencida · {veiculo.proximaRevisao}</span>
          ) : (
            <p className="text-sm font-semibold adm-ink">{veiculo.proximaRevisao}</p>
          )}
        </div>
      </div>

      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display font-bold adm-ink">Histórico de serviços</h3>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {ordens.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Nenhuma OS registrada.</p>}
          {ordens.map((o) => (
            <Link key={o.id} href={`/oficina/ordens/${o.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--ad-surface-2)]">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold adm-ink">
                  <span className="font-mono adm-muted">{o.id}</span> · {o.defeito}
                </p>
                <p className="text-xs adm-muted">{o.data}</p>
              </div>
              <span className={osBadgeClass[o.status]}>{o.status}</span>
              <span className="hidden w-20 text-right text-sm font-semibold adm-ink sm:block">{brl(o.total)}</span>
              <ChevronRight className="size-4 shrink-0 adm-muted" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
