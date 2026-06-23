import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, MessageCircle, FileDown, ChevronRight } from "lucide-react";
import { brl, osBadgeClass, type StatusOS } from "../../_data/mock";
import { getOrdem } from "@/lib/admin-data";

const FLUXO: StatusOS[] = [
  "Aberta",
  "Aguardando aprovação",
  "Em execução",
  "Finalizada",
  "Entregue",
];

const EVIDENCIAS = [
  { src: "/images/real-diagnostic.jpg", etapa: "Antes" },
  { src: "/images/real-garage.jpg", etapa: "Durante" },
  { src: "/images/real-diagnostic.jpg", etapa: "Depois" },
];

export default async function OrdemDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const os = await getOrdem(id);
  if (!os) notFound();

  const atual = FLUXO.indexOf(os.status);

  const info = [
    { label: "Cliente", value: os.cliente },
    { label: "Veículo", value: `${os.veiculo} · ${os.placa}` },
    { label: "Data", value: os.data },
    { label: "Quilometragem", value: `${os.km.toLocaleString("pt-BR")} km` },
    { label: "Mecânico", value: os.mecanico },
  ];

  return (
    <div className="space-y-6">
      <Link href="/oficina/ordens" className="inline-flex items-center gap-1.5 text-sm font-semibold adm-muted hover:adm-brand">
        <ArrowLeft className="size-4" />
        Ordens de Serviço
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm adm-muted">{os.id}</p>
          <h2 className="adm-display text-2xl font-bold adm-ink">{os.cliente}</h2>
        </div>
        <span className={osBadgeClass[os.status]}>{os.status}</span>
      </div>

      <div className="adm-card p-5">
        <div className="flex items-center">
          {FLUXO.map((s, i) => {
            const done = i <= atual;
            return (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={`grid size-8 place-items-center rounded-full text-xs font-bold ${
                      done ? "bg-[var(--ad-brand)] text-white" : "bg-[var(--ad-surface-2)] adm-muted"
                    }`}
                  >
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span
                    className={`hidden w-20 text-center text-[0.65rem] font-medium leading-tight sm:block ${
                      done ? "adm-ink" : "adm-muted"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < FLUXO.length - 1 && (
                  <div className={`mx-1 h-0.5 flex-1 ${i < atual ? "bg-[var(--ad-brand)]" : "bg-[var(--ad-surface-2)]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="adm-card p-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            {info.map((m) => (
              <div key={m.label}>
                <p className="text-xs adm-muted">{m.label}</p>
                <p className="text-sm font-semibold adm-ink">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="adm-card p-5">
          <p className="text-xs uppercase tracking-wide adm-muted">Defeito relatado</p>
          <p className="mt-1.5 text-sm adm-ink">{os.defeito}</p>
        </div>
      </div>

      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display font-bold adm-ink">Itens da OS</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Tipo</th>
                <th className="px-5 py-3 font-semibold">Descrição</th>
                <th className="px-5 py-3 text-center font-semibold">Qtd</th>
                <th className="px-5 py-3 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody>
              {os.itens.map((it, i) => (
                <tr key={i} className="border-b border-[var(--ad-line)] last:border-0">
                  <td className="px-5 py-3">
                    <span className="rounded-md bg-[var(--ad-surface-2)] px-2 py-0.5 text-xs font-medium adm-muted">{it.tipo}</span>
                  </td>
                  <td className="px-5 py-3 adm-ink">{it.descricao}</td>
                  <td className="px-5 py-3 text-center adm-muted">{it.qtd}</td>
                  <td className="px-5 py-3 text-right font-semibold adm-ink">{brl(it.valor)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="px-5 py-3.5 text-right font-semibold adm-muted">Total</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="adm-display text-lg font-bold adm-ink">{brl(os.total)}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div>
        <h3 className="adm-display mb-3 font-bold adm-ink">Evidências (fotos)</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EVIDENCIAS.map((f, i) => (
            <figure key={i} className="overflow-hidden rounded-xl border border-[var(--ad-line)]">
              <div className="relative aspect-[4/3]">
                <Image src={f.src} alt={`${f.etapa} — ${os.id}`} fill sizes="(max-width: 1024px) 33vw, 240px" className="object-cover" />
                <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-xs font-semibold text-white">{f.etapa}</span>
              </div>
            </figure>
          ))}
        </div>
      </div>

      <div className="adm-card p-5">
        <p className="text-xs uppercase tracking-wide adm-muted">Observações</p>
        <p className="mt-1.5 text-sm adm-ink">{os.observacoes}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]">
          Avançar status
          <ChevronRight className="size-4" />
        </button>
        <button type="button" className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink transition-colors hover:bg-[var(--ad-surface-2)]">
          <MessageCircle className="size-4 text-emerald-400" />
          Avisar no WhatsApp
        </button>
        <button type="button" className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink transition-colors hover:bg-[var(--ad-surface-2)]">
          <FileDown className="size-4 adm-brand" />
          Gerar PDF
        </button>
      </div>
    </div>
  );
}
