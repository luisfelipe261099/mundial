import type { LucideIcon } from "lucide-react";
import {
  Receipt,
  ShieldCheck,
  FileText,
  Wrench,
  FileCheck2,
  Download,
} from "lucide-react";
import { documentos, type TipoDocumento } from "../_data/mock";

const ICON: Record<TipoDocumento, LucideIcon> = {
  "Nota fiscal": Receipt,
  Garantia: ShieldCheck,
  Orçamento: FileText,
  "Ordem de serviço": Wrench,
  Comprovante: FileCheck2,
};

const ORDEM: TipoDocumento[] = [
  "Nota fiscal",
  "Garantia",
  "Orçamento",
  "Ordem de serviço",
  "Comprovante",
];

export default function DocumentosPage() {
  return (
    <div className="space-y-6 px-5 pb-8 pt-3">
      <p className="text-sm t-muted">Todos os seus documentos em PDF, em um só lugar.</p>

      {ORDEM.map((tipo) => {
        const docs = documentos.filter((d) => d.tipo === tipo);
        if (docs.length === 0) return null;
        const Icon = ICON[tipo];
        return (
          <section key={tipo}>
            <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">{tipo}</h2>
            <div className="app-card divide-y divide-[var(--app-line)] px-4">
              {docs.map((d) => (
                <div key={d.id} className="flex items-center gap-3 py-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--app-surface-2)]">
                    <Icon className="size-5 t-brand" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.95rem] font-semibold t-ink">{d.nome}</p>
                    <p className="text-xs t-muted">{d.data} · PDF</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Baixar ${d.nome}`}
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--app-brand)]/15 t-brand"
                  >
                    <Download className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
