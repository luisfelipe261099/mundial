import Link from "next/link";
import { ChevronRight, Wrench } from "lucide-react";
import { osBadgeClass } from "../oficina/_data/mock";
import { getOrdens, getOrdensMecanico } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";

export default async function MecanicoHome() {
  const session = await requireSession();
  const todas =
    session.kind === "mecanico" ? await getOrdensMecanico(session.id) : await getOrdens();
  const ativas = todas.filter((o) => o.status !== "Entregue");

  return (
    <div className="space-y-4 px-5 pb-8 pt-4">
      <div>
        <p className="mec-eyebrow">Fila de trabalho</p>
        <p className="mec-display mt-0.5 text-lg font-bold mec-ink">
          {ativas.length === 0
            ? "Nenhuma ordem ativa"
            : `${ativas.length} ${ativas.length === 1 ? "ordem atribuída" : "ordens atribuídas"} a você`}
        </p>
      </div>

      {ativas.length === 0 && (
        <div className="mec-card flex flex-col items-center gap-3 p-8 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-[var(--mec-brand)]/15">
            <Wrench className="size-6 mec-brand" />
          </span>
          <p className="text-sm mec-muted">
            Nenhuma ordem atribuída a você no momento. Quando o painel liberar uma OS, ela aparece
            aqui.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {ativas.map((o) => (
          <Link key={o.id} href={`/mecanico/${o.id}`} className="mec-card mec-lift block p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs mec-muted">{o.id}</span>
              <span className={osBadgeClass[o.status]}>{o.status}</span>
            </div>
            <p className="mec-display mt-2 text-[1.05rem] font-bold mec-ink">{o.veiculo}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs mec-muted">
              <span>{o.cliente}</span>
              <span className="mec-plate">{o.placa}</span>
            </div>
            <p className="mt-2.5 line-clamp-2 text-sm mec-muted">{o.defeito}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold mec-brand">
              Abrir OS
              <ChevronRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
