import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { requireClientId } from "@/lib/auth";
import { getOrcamentos } from "@/lib/client-data";
import { orcamentoBadge } from "../_components/category";
import { brl } from "../_data/mock";
import { AppHeader } from "../_components/app-header";

export default async function OrcamentosPage() {
  const clientId = await requireClientId();
  const orcamentos = await getOrcamentos(clientId);

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <AppHeader
        eyebrow="Propostas"
        title="Orçamentos"
        stats={[{ label: orcamentos.length === 1 ? "orçamento" : "orçamentos", value: orcamentos.length.toString() }]}
      />
      {orcamentos.length === 0 && (
        <div className="app-card p-5 text-sm t-muted">Nenhum orçamento no momento.</div>
      )}
      <div className="space-y-3">
        {orcamentos.map((o) => (
          <Link key={o.id} href={`/app/orcamentos/${o.id}`} className="app-card block p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs t-muted">{o.id}</span>
              <span className={orcamentoBadge[o.status].cls}>{orcamentoBadge[o.status].label}</span>
            </div>
            <p className="mt-1.5 font-semibold t-ink">{o.veiculoNome}</p>
            <p className="text-xs t-muted">
              {o.data} · {o.pecas.length} peças · {o.servicos.length} serviços
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="app-display text-lg font-bold t-ink">{brl(o.total)}</span>
              <span className="flex items-center gap-1 text-sm font-semibold t-brand">
                Ver detalhes
                <ChevronRight className="size-4" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
