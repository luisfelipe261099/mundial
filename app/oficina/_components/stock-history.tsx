import { ArrowDownRight, ArrowUpRight, History } from "lucide-react";
import type { Movimentacao } from "@/lib/admin-data";

export function StockHistory({ movs }: { movs: Movimentacao[] }) {
  return (
    <div className="adm-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--ad-line)] px-5 py-3.5">
        <History className="size-4 adm-brand" />
        <h3 className="adm-display text-sm font-bold adm-ink">Histórico de movimentação</h3>
      </div>

      {movs.length === 0 ? (
        <p className="px-5 py-4 text-sm adm-muted">Nenhuma movimentação registrada ainda.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 text-center font-semibold">Qtd</th>
                <th className="px-5 py-3 font-semibold">Motivo</th>
                <th className="px-5 py-3 font-semibold">Quem</th>
                <th className="px-5 py-3 font-semibold">Quando</th>
              </tr>
            </thead>
            <tbody>
              {movs.map((m) => {
                const entrada = m.delta > 0;
                return (
                  <tr key={m.id} className="border-b border-[var(--ad-line)] last:border-0">
                    <td className="px-5 py-3 font-semibold adm-ink">{m.produto}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`flex items-center justify-center gap-1 font-semibold ${
                          entrada ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {entrada ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                        {entrada ? "+" : ""}
                        {m.delta}
                      </span>
                    </td>
                    <td className="px-5 py-3 adm-muted">
                      {m.motivo}
                      {m.osId && <span className="ml-1.5 font-mono text-xs adm-brand">{m.osId}</span>}
                    </td>
                    <td className="px-5 py-3 adm-muted">{m.autor ?? "—"}</td>
                    <td className="px-5 py-3 whitespace-nowrap adm-muted">{m.quando}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
