import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CatChip } from "./category";
import { brl, type Reparo } from "../_data/mock";

export function RepairRow({ reparo, href = "/app/historico" }: { reparo: Reparo; href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 py-3">
      <CatChip categoria={reparo.categoria} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.95rem] font-semibold t-ink">{reparo.nome}</p>
        <p className="text-xs t-muted">{reparo.data}</p>
      </div>
      <span className="text-[0.95rem] font-bold t-ink">{brl(reparo.valor)}</span>
      <ChevronRight className="size-4 shrink-0 t-muted" />
    </Link>
  );
}
