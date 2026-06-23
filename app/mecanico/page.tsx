import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ordens, osBadgeClass } from "../oficina/_data/mock";

export default function MecanicoHome() {
  const ativas = ordens.filter((o) => o.status !== "Entregue");

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <p className="text-sm mec-muted">{ativas.length} ordens atribuídas a você</p>
      <div className="space-y-3">
        {ativas.map((o) => (
          <Link key={o.id} href={`/mecanico/${o.id}`} className="mec-card block p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs mec-muted">{o.id}</span>
              <span className={osBadgeClass[o.status]}>{o.status}</span>
            </div>
            <p className="mt-1.5 font-semibold mec-ink">{o.veiculo}</p>
            <p className="text-xs mec-muted">
              {o.cliente} · <span className="font-mono">{o.placa}</span>
            </p>
            <p className="mt-2 line-clamp-2 text-sm mec-muted">{o.defeito}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-sm font-semibold mec-brand">
              Abrir OS
              <ChevronRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
