"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { brl, osBadgeClass, type OrdemServicoAdmin, type StatusOS } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const STATUS: StatusOS[] = [
  "Aberta",
  "Aguardando aprovação",
  "Em execução",
  "Finalizada",
  "Entregue",
];

// Atalho do dia a dia: o que ainda está na oficina.
const EM_ANDAMENTO: StatusOS[] = ["Aberta", "Aguardando aprovação", "Em execução"];

const TODOS = "Todos os mecânicos";
const PAGAMENTO = ["Pagas e em aberto", "Pagas", "Em aberto"] as const;

export function OrdersTable({ ordens }: { ordens: OrdemServicoAdmin[] }) {
  // Vazio = todas. Cada status é um toggle, dá pra combinar quantos quiser.
  const [selecionados, setSelecionados] = useState<StatusOS[]>([]);
  const [busca, setBusca] = useState("");
  const [mecanico, setMecanico] = useState(TODOS);
  // Período pela data de entrada (AAAA-MM-DD, direto do input date).
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [pagamento, setPagamento] = useState<(typeof PAGAMENTO)[number]>(PAGAMENTO[0]);

  const mecanicos = [TODOS, ...Array.from(new Set(ordens.map((o) => o.mecanico).filter((m) => m !== "—"))).sort()];

  const conta = (s: StatusOS) => ordens.filter((o) => o.status === s).length;
  const ativo = (s: StatusOS) => selecionados.includes(s);
  const emAndamentoAtivo =
    selecionados.length === EM_ANDAMENTO.length && EM_ANDAMENTO.every((s) => selecionados.includes(s));

  function alternar(s: StatusOS) {
    setSelecionados((x) => (x.includes(s) ? x.filter((v) => v !== s) : [...x, s]));
  }

  const lista = ordens.filter((o) => {
    if (selecionados.length > 0 && !selecionados.includes(o.status)) return false;
    if (mecanico !== TODOS && o.mecanico !== mecanico) return false;
    // Período: compara pela data de entrada normalizada. OS com data que não
    // dá pra interpretar só some quando um período está ativo.
    if ((de || ate) && !o.iso) return false;
    if (de && (o.iso ?? "") < de) return false;
    if (ate && (o.iso ?? "") > ate) return false;
    if (pagamento === "Pagas" && !o.paga) return false;
    if (pagamento === "Em aberto" && o.paga) return false;
    return matches([o.id, o.cliente, o.placa, o.veiculo], busca);
  });
  const filtroAtivo =
    busca !== "" || mecanico !== TODOS || selecionados.length > 0 || de !== "" || ate !== "" || pagamento !== PAGAMENTO[0];

  function limpar() {
    setBusca("");
    setMecanico(TODOS);
    setSelecionados([]);
    setDe("");
    setAte("");
    setPagamento(PAGAMENTO[0]);
  }

  return (
    <div>
      <div className="no-scrollbar mb-2 flex gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setSelecionados([])}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            selecionados.length === 0
              ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
              : "border-[var(--ad-line)] adm-muted hover:adm-ink"
          }`}
        >
          Todas
        </button>

        <button
          type="button"
          onClick={() => setSelecionados(emAndamentoAtivo ? [] : [...EM_ANDAMENTO])}
          className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
            emAndamentoAtivo
              ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
              : "border-[var(--ad-line)] adm-muted hover:adm-ink"
          }`}
        >
          Na oficina
        </button>

        <span className="shrink-0 self-center text-[var(--ad-line-2)]">|</span>

        {STATUS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => alternar(s)}
            aria-pressed={ativo(s)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              ativo(s)
                ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
                : "border-[var(--ad-line)] adm-muted hover:adm-ink"
            }`}
          >
            {ativo(s) && <Check className="size-3.5" />}
            {s}
            <span className={ativo(s) ? "text-white/70" : "text-[var(--ad-muted)]"}>{conta(s)}</span>
          </button>
        ))}
      </div>

      <p className="mb-4 text-xs adm-muted">
        {selecionados.length === 0
          ? "Mostrando todos os status — clique para combinar os que quiser ver."
          : `Filtrando por ${selecionados.length} status: ${selecionados.join(", ")}.`}
      </p>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar OS, cliente, placa…" />
        <FilterSelect value={mecanico} onChange={setMecanico} options={mecanicos} ariaLabel="Filtrar por mecânico" />
        <FilterSelect
          value={pagamento}
          onChange={(v) => setPagamento(v as (typeof PAGAMENTO)[number])}
          options={[...PAGAMENTO]}
          ariaLabel="Filtrar por pagamento"
        />
        <label className="flex items-center gap-1.5 text-xs adm-muted">
          De
          <input
            type="date"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            aria-label="Entrada a partir de"
            className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2.5 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
          />
        </label>
        <label className="flex items-center gap-1.5 text-xs adm-muted">
          Até
          <input
            type="date"
            value={ate}
            onChange={(e) => setAte(e.target.value)}
            aria-label="Entrada até"
            className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2.5 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
          />
        </label>
        <ResultBar shown={lista.length} total={ordens.length} active={filtroAtivo} onClear={limpar} />
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">OS</th>
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Veículo</th>
                <th className="px-5 py-3 font-semibold">Data</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={7} busca={busca} />}
              {lista.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/ordens/${o.id}`} className="font-mono font-semibold adm-brand">
                      {o.id}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-semibold adm-ink">{o.cliente}</td>
                  <td className="px-5 py-3.5 adm-muted">
                    {o.veiculo} · <span className="font-mono">{o.placa}</span>
                  </td>
                  <td className="px-5 py-3.5 adm-muted">{o.data}</td>
                  <td className="px-5 py-3.5">
                    <span className={osBadgeClass[o.status]}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold adm-ink">{brl(o.total)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/ordens/${o.id}`} className="inline-flex adm-muted hover:adm-brand">
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
