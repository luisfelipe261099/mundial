import { Plus, AlertTriangle } from "lucide-react";
import { estoque } from "../_data/mock";

export default function EstoquePage() {
  const baixos = estoque.filter((p) => p.qtd < p.minimo);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm adm-muted">{estoque.length} produtos no estoque</p>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <Plus className="size-4" />
          Novo produto
        </button>
      </div>

      {baixos.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="size-5 shrink-0 text-amber-400" />
          <p className="text-sm adm-ink">
            <span className="font-semibold">{baixos.length} produtos</span> abaixo do estoque mínimo.
          </p>
        </div>
      )}

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Marca</th>
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-5 py-3 text-center font-semibold">Qtd</th>
                <th className="px-5 py-3 text-center font-semibold">Mínimo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {estoque.map((p) => {
                const baixo = p.qtd < p.minimo;
                return (
                  <tr
                    key={p.id}
                    className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                  >
                    <td className="px-5 py-3.5 font-semibold adm-ink">{p.produto}</td>
                    <td className="px-5 py-3.5 adm-muted">{p.marca}</td>
                    <td className="px-5 py-3.5 font-mono adm-muted">{p.codigo}</td>
                    <td className={`px-5 py-3.5 text-center font-semibold ${baixo ? "text-amber-400" : "adm-ink"}`}>
                      {p.qtd}
                    </td>
                    <td className="px-5 py-3.5 text-center adm-muted">{p.minimo}</td>
                    <td className="px-5 py-3.5">
                      <span className={baixo ? "osb osb-aguardando" : "osb osb-finalizada"}>
                        {baixo ? "Baixo" : "Em dia"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
