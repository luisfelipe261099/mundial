"use client";

import { useState, useTransition } from "react";
import { Plus, Minus, PackagePlus, AlertTriangle, Check, X } from "lucide-react";
import type { Produto } from "../_data/mock";
import { movimentarEstoque, criarProduto } from "../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function StockManager({ seed }: { seed: Produto[] }) {
  const [itens, setItens] = useState<Produto[]>(seed);
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState({ produto: "", marca: "", codigo: "", qtd: 0, minimo: 0 });

  const [, startTransition] = useTransition();
  const baixos = itens.filter((p) => p.qtd < p.minimo);

  function mov(id: string, delta: number) {
    setItens((x) => x.map((p) => (p.id === id ? { ...p, qtd: Math.max(0, p.qtd + delta) } : p)));
    startTransition(() => movimentarEstoque(id, delta));
  }

  function addProduto() {
    if (!novo.produto.trim() || !novo.codigo.trim()) return;
    const payload = { ...novo };
    setItens((x) => [{ id: `p${Date.now()}`, ...novo }, ...x]);
    setNovo({ produto: "", marca: "", codigo: "", qtd: 0, minimo: 0 });
    setShowForm(false);
    startTransition(() => criarProduto(payload));
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm adm-muted">{itens.length} produtos no estoque</p>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancelar" : "Novo produto"}
        </button>
      </div>

      {showForm && (
        <div className="adm-card p-4">
          <h3 className="adm-display mb-3 flex items-center gap-2 text-sm font-bold adm-ink">
            <PackagePlus className="size-4 adm-brand" />
            Cadastrar produto
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <input className={`${inputCls} col-span-2`} placeholder="Produto" value={novo.produto} onChange={(e) => setNovo((n) => ({ ...n, produto: e.target.value }))} />
            <input className={inputCls} placeholder="Marca" value={novo.marca} onChange={(e) => setNovo((n) => ({ ...n, marca: e.target.value }))} />
            <input className={inputCls} placeholder="Código" value={novo.codigo} onChange={(e) => setNovo((n) => ({ ...n, codigo: e.target.value }))} />
            <div className="flex gap-2">
              <input type="number" min={0} className={inputCls} placeholder="Qtd" value={novo.qtd || ""} onChange={(e) => setNovo((n) => ({ ...n, qtd: Number(e.target.value) }))} aria-label="Quantidade" />
              <input type="number" min={0} className={inputCls} placeholder="Mín" value={novo.minimo || ""} onChange={(e) => setNovo((n) => ({ ...n, minimo: Number(e.target.value) }))} aria-label="Mínimo" />
            </div>
          </div>
          <button
            type="button"
            onClick={addProduto}
            disabled={!novo.produto.trim() || !novo.codigo.trim()}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-[#1d4ed8] disabled:opacity-40"
          >
            <Check className="size-4" />
            Adicionar ao estoque
          </button>
        </div>
      )}

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
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Marca</th>
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-5 py-3 text-center font-semibold">Movimentar</th>
                <th className="px-5 py-3 text-center font-semibold">Mínimo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((p) => {
                const baixo = p.qtd < p.minimo;
                return (
                  <tr key={p.id} className="border-b border-[var(--ad-line)] last:border-0">
                    <td className="px-5 py-3 font-semibold adm-ink">{p.produto}</td>
                    <td className="px-5 py-3 adm-muted">{p.marca}</td>
                    <td className="px-5 py-3 font-mono adm-muted">{p.codigo}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => mov(p.id, -1)}
                          aria-label="Saída"
                          className="grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]"
                        >
                          <Minus className="size-4" />
                        </button>
                        <span className={`w-8 text-center font-semibold ${baixo ? "text-amber-400" : "adm-ink"}`}>
                          {p.qtd}
                        </span>
                        <button
                          type="button"
                          onClick={() => mov(p.id, 1)}
                          aria-label="Entrada"
                          className="grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]"
                        >
                          <Plus className="size-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-center adm-muted">{p.minimo}</td>
                    <td className="px-5 py-3">
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
