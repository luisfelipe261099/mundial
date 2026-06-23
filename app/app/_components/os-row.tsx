import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatChip } from "./category";
import { brl, type OrdemServico } from "../_data/mock";

// Linha de Ordem de Serviço — reutilizada no detalhe do veículo e no Histórico.
export function OsRow({ os }: { os: OrdemServico }) {
  return (
    <Link href={`/app/historico/${os.id}`} className="flex items-center gap-3 py-3">
      <CatChip categoria={os.categoria} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.95rem] font-semibold t-ink">{os.servico}</p>
        <p className="truncate text-xs t-muted">
          {os.data} · {os.km.toLocaleString("pt-BR")} km · {os.id}
        </p>
      </div>
      <span className="shrink-0 text-[0.95rem] font-bold t-ink">{brl(os.valor)}</span>
      <ChevronRight className="size-4 shrink-0 t-muted" />
    </Link>
  );
}
