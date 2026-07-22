"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { brl, osBadgeClass, type OrdemServicoAdmin, type StatusOS } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const FILTROS: ("Todas" | StatusOS)[] = [
  "Todas",
  "Aberta",
  "Aguardando aprovação",
  "Em execução",
  "Finalizada",
  "Entregue",
];

const TODOS = "Todos os mecânicos";

export function OrdersTable({ ordens }: { ordens: OrdemServicoAdmin[] }) {
  const [filtro, setFiltro] = useState<"Todas" | StatusOS>("Todas");
  const [busca, setBusca] = useState("");
  const [mecanico, setMecanico] = useState(TODOS);

  const mecanicos = [TODOS, ...Array.from(new Set(ordens.map((o) => o.mecanico).filter((m) => m !== "—"))).sort()];

  const lista = ordens.filter((o) => {
    if (filtro !== "Todas" && o.status !== filtro) return false;
    if (mecanico !== TODOS && o.mecanico !== mecanico) return false;
    return matches([o.id, o.cliente, o.placa, o.veiculo], busca);
  });
  const filtroAtivo = busca !== "" || mecanico !== TODOS || filtro !== "Todas";

  function limpar() {
    setBusca("");
    setMecanico(TODOS);
    setFiltro("Todas");
  }

  return (
    <div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {FILTROS.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setFiltro(x)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filtro === x
                ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
                : "border-[var(--ad-line)] adm-muted"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar OS, cliente, placa…" />
        <FilterSelect value={mecanico} onChange={setMecanico} options={mecanicos} ariaLabel="Filtrar por mecânico" />
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
