"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Plus } from "lucide-react";
import { brl } from "../_data/mock";

export interface Lancamento {
  id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
}

const CATEGORIAS: Record<"receita" | "despesa", string[]> = {
  receita: ["Serviços", "Peças", "Outros"],
  despesa: ["Compras", "Salários", "Aluguel", "Impostos", "Outros"],
};

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function FinanceManager({ seed }: { seed: Lancamento[] }) {
  const [lancs, setLancs] = useState<Lancamento[]>(seed);
  const [tipo, setTipo] = useState<"receita" | "despesa">("receita");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("Serviços");
  const [valor, setValor] = useState<number>(0);

  const totalR = lancs.filter((l) => l.tipo === "receita").reduce((s, l) => s + l.valor, 0);
  const totalD = lancs.filter((l) => l.tipo === "despesa").reduce((s, l) => s + l.valor, 0);
  const saldo = totalR - totalD;

  const tiles = [
    { label: "Receitas", value: brl(totalR), icon: TrendingUp, cls: "bg-emerald-500/15 text-emerald-400" },
    { label: "Despesas", value: brl(totalD), icon: TrendingDown, cls: "bg-rose-500/15 text-rose-400" },
    { label: "Saldo", value: brl(saldo), icon: Wallet, cls: "bg-[var(--ad-brand)]/15 adm-brand" },
  ];

  function trocarTipo(t: "receita" | "despesa") {
    setTipo(t);
    setCategoria(CATEGORIAS[t][0]);
  }

  function add() {
    if (!descricao.trim() || valor <= 0) return;
    setLancs((x) => [
      { id: `l${Date.now()}`, tipo, descricao, categoria, valor, data: "Hoje" },
      ...x,
    ]);
    setDescricao("");
    setValor(0);
  }

  return (
    <div className="space-y-6">
      {/* totais ao vivo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="adm-card p-4">
              <span className={`grid size-10 place-items-center rounded-xl ${t.cls}`}>
                <Icon className="size-5" />
              </span>
              <p className="adm-display mt-3 text-2xl font-bold adm-ink">{t.value}</p>
              <p className="text-sm adm-muted">{t.label}</p>
            </div>
          );
        })}
      </div>

      {/* novo lançamento */}
      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">Novo lançamento</h2>
        <div className="mb-4 inline-flex rounded-lg border border-[var(--ad-line)] p-1">
          <button
            type="button"
            onClick={() => trocarTipo("receita")}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              tipo === "receita" ? "bg-emerald-600 text-white" : "adm-muted"
            }`}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => trocarTipo("despesa")}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              tipo === "despesa" ? "bg-rose-600 text-white" : "adm-muted"
            }`}
          >
            Despesa
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-[1fr_10rem_8rem_auto]">
          <input
            className={inputCls}
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
          <select className={inputCls} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS[tipo].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder="Valor R$"
            value={valor || ""}
            onChange={(e) => setValor(Number(e.target.value))}
          />
          <button
            type="button"
            onClick={add}
            disabled={!descricao.trim() || valor <= 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1d4ed8] disabled:opacity-40"
          >
            <Plus className="size-4" />
            Lançar
          </button>
        </div>
      </div>

      {/* lançamentos */}
      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h2 className="adm-display font-bold adm-ink">Lançamentos do mês</h2>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {lancs.map((l) => {
            const receita = l.tipo === "receita";
            return (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    receita ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {receita ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold adm-ink">{l.descricao}</p>
                  <p className="text-xs adm-muted">{l.categoria} · {l.data}</p>
                </div>
                <span className={`text-sm font-semibold ${receita ? "text-emerald-400" : "text-rose-400"}`}>
                  {receita ? "+" : "−"} {brl(l.valor)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
