"use client";

import { useState } from "react";
import { Check, X, RotateCcw } from "lucide-react";
import { brl, type Orcamento, type StatusOrcamento } from "../_data/mock";
import { orcamentoBadge } from "./category";

export function BudgetDetail({ orcamento }: { orcamento: Orcamento }) {
  const [status, setStatus] = useState<StatusOrcamento>(orcamento.status);

  return (
    <div className="space-y-5 px-5 pb-8 pt-3">
      {/* cabeçalho */}
      <div className="app-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs t-muted">{orcamento.id}</span>
          <span className={orcamentoBadge[status].cls}>{orcamentoBadge[status].label}</span>
        </div>
        <p className="mt-1.5 app-display text-lg font-bold t-ink">{orcamento.veiculoNome}</p>
        <p className="text-xs t-muted">Emitido em {orcamento.data}</p>
      </div>

      {/* peças */}
      <section>
        <h2 className="app-display mb-2 text-[1.05rem] font-bold t-ink">Peças</h2>
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {orcamento.pecas.map((p) => (
            <div key={p.nome} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0 flex-1 text-sm t-ink">
                {p.nome}
                {p.qtd > 1 && <span className="t-muted"> ×{p.qtd}</span>}
              </span>
              <span className="text-sm font-semibold t-ink">{brl(p.valor)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* serviços */}
      <section>
        <h2 className="app-display mb-2 text-[1.05rem] font-bold t-ink">Serviços</h2>
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {orcamento.servicos.map((s) => (
            <div key={s.descricao} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0 flex-1 text-sm t-ink">{s.descricao}</span>
              <span className="text-sm font-semibold t-ink">{brl(s.valor)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* totais */}
      <div className="app-card space-y-2 p-4">
        <div className="flex justify-between text-sm">
          <span className="t-muted">Subtotal</span>
          <span className="t-ink">{brl(orcamento.subtotal)}</span>
        </div>
        {orcamento.desconto > 0 && (
          <div className="flex justify-between text-sm">
            <span className="t-muted">Descontos</span>
            <span className="text-emerald-400">- {brl(orcamento.desconto)}</span>
          </div>
        )}
        <div className="mt-1 flex justify-between border-t border-[var(--app-line)] pt-3">
          <span className="font-semibold t-ink">Valor final</span>
          <span className="app-display text-xl font-bold t-ink">{brl(orcamento.total)}</span>
        </div>
      </div>

      {/* ações */}
      {status === "pendente" ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setStatus("rejeitado")}
            className="flex items-center justify-center gap-2 rounded-xl border border-rose-500/40 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/10"
          >
            <X className="size-4" />
            Rejeitar
          </button>
          <button
            type="button"
            onClick={() => setStatus("aprovado")}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <Check className="size-4" />
            Aprovar
          </button>
        </div>
      ) : (
        <div className="app-card flex items-center gap-3 p-4">
          <p className="flex-1 text-sm t-ink">
            {status === "aprovado"
              ? "Orçamento aprovado. A oficina foi avisada e entrará em contato."
              : "Orçamento rejeitado."}
          </p>
          <button
            type="button"
            onClick={() => setStatus("pendente")}
            className="flex items-center gap-1.5 text-sm font-semibold t-brand"
          >
            <RotateCcw className="size-4" />
            Desfazer
          </button>
        </div>
      )}
    </div>
  );
}
