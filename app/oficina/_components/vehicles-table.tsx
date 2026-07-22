"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { VeiculoAdmin } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const TODAS = "Todas as marcas";

export function VehiclesTable({ veiculos }: { veiculos: VeiculoAdmin[] }) {
  const [busca, setBusca] = useState("");
  const [marca, setMarca] = useState(TODAS);
  const [soVencidas, setSoVencidas] = useState(false);

  const marcas = [TODAS, ...Array.from(new Set(veiculos.map((v) => v.marca ?? v.modelo.split(" ")[0]))).sort()];

  const lista = veiculos.filter((v) => {
    if (soVencidas && !v.revisaoVencida) return false;
    if (marca !== TODAS && (v.marca ?? v.modelo.split(" ")[0]) !== marca) return false;
    return matches([v.placa, v.modelo, v.proprietario], busca);
  });
  const filtroAtivo = busca !== "" || marca !== TODAS || soVencidas;

  function limpar() {
    setBusca("");
    setMarca(TODAS);
    setSoVencidas(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar placa, modelo, dono…" />
        <FilterSelect value={marca} onChange={setMarca} options={marcas} ariaLabel="Filtrar por marca" />
        <FilterChip active={soVencidas} onClick={() => setSoVencidas((v) => !v)}>
          Revisão vencida
        </FilterChip>
        <ResultBar shown={lista.length} total={veiculos.length} active={filtroAtivo} onClear={limpar} />
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Proprietário</th>
                <th className="px-5 py-3 font-semibold">Modelo</th>
                <th className="px-5 py-3 font-semibold">Placa</th>
                <th className="px-5 py-3 text-center font-semibold">Ano</th>
                <th className="px-5 py-3 text-right font-semibold">KM</th>
                <th className="px-5 py-3 font-semibold">Próxima revisão</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={7} busca={busca} />}
              {lista.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5 font-semibold adm-ink">{v.proprietario}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/veiculos/${v.id}`} className="adm-brand hover:underline">
                      {v.modelo}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono adm-muted">{v.placa}</td>
                  <td className="px-5 py-3.5 text-center adm-muted">{v.ano}</td>
                  <td className="px-5 py-3.5 text-right adm-muted">{v.km.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3.5">
                    {v.revisaoVencida ? (
                      <span className="osb osb-aguardando">Vencida · {v.proximaRevisao}</span>
                    ) : (
                      <span className="adm-muted">{v.proximaRevisao}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/veiculos/${v.id}`} className="inline-flex adm-muted hover:adm-brand">
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
