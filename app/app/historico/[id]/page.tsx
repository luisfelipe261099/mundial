import { notFound } from "next/navigation";
import Image from "next/image";
import { FileDown, ShieldCheck } from "lucide-react";
import { requireClientId } from "@/lib/auth";
import { getOrdem } from "@/lib/client-data";
import { CatChip } from "../../_components/category";
import { brl } from "../../_data/mock";

export default async function OsDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const clientId = await requireClientId();
  const os = await getOrdem(id, clientId);
  if (!os) notFound();

  const meta = [
    { label: "Data", value: os.data },
    { label: "Quilometragem", value: `${os.km.toLocaleString("pt-BR")} km` },
    { label: "Valor", value: brl(os.valor) },
    { label: "Garantia", value: os.garantia },
    { label: "Responsável", value: os.responsavel },
    { label: "Ordem", value: os.id },
  ];

  return (
    <div className="space-y-6 px-5 pb-8 pt-3">
      <div className="app-card p-4">
        <div className="flex items-start gap-3">
          <CatChip categoria={os.categoria} />
          <div className="min-w-0 flex-1">
            <p className="app-display text-[1.05rem] font-bold leading-snug t-ink">{os.servico}</p>
            <span className="badge badge-finalizado mt-1.5">{os.status}</span>
          </div>
        </div>
      </div>

      <div className="app-card grid grid-cols-2 gap-x-4 gap-y-4 p-4">
        {meta.map((m) => (
          <div key={m.label}>
            <p className="text-xs t-muted">{m.label}</p>
            <p className="text-sm font-semibold t-ink">{m.value}</p>
          </div>
        ))}
      </div>

      {os.garantia !== "—" && (
        <div className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-3">
          <ShieldCheck className="size-5 shrink-0 text-emerald-400" />
          <p className="text-sm t-ink">
            Serviço com garantia de <span className="font-semibold">{os.garantia}</span>.
          </p>
        </div>
      )}

      {os.fotos.length > 0 && (
        <section>
          <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Fotos do serviço</h2>
          <div className="grid grid-cols-2 gap-3">
            {os.fotos.map((f, i) => (
              <figure key={i} className="overflow-hidden rounded-xl border border-[var(--app-line)]">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={f.src}
                    alt={`${f.etapa} — ${os.servico}`}
                    fill
                    sizes="(max-width: 400px) 50vw, 200px"
                    className="object-cover"
                    unoptimized
                  />
                  <span className="absolute left-2 top-2 rounded-full bg-black/65 px-2 py-0.5 text-xs font-semibold text-white">
                    {f.etapa}
                  </span>
                </div>
              </figure>
            ))}
          </div>
        </section>
      )}

      <button
        type="button"
        className="app-card-2 flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold t-ink"
      >
        <FileDown className="size-4 t-brand" />
        Baixar relatório (PDF)
      </button>
    </div>
  );
}
