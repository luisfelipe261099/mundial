"use client";

import { Fragment, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, Trash2, AlertTriangle } from "lucide-react";
import type { VeiculoAdmin } from "../_data/mock";
import { excluirVeiculo } from "../actions";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const TODAS = "Todas as marcas";

export function VehiclesTable({ veiculos }: { veiculos: VeiculoAdmin[] }) {
  const [itens, setItens] = useState<VeiculoAdmin[]>(veiculos);
  const [busca, setBusca] = useState("");
  const [marca, setMarca] = useState(TODAS);
  const [soVencidas, setSoVencidas] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const marcas = [TODAS, ...Array.from(new Set(itens.map((v) => v.marca ?? v.modelo.split(" ")[0]))).sort()];

  function excluir(id: string) {
    const antes = itens;
    setItens((x) => x.filter((v) => v.id !== id));
    setDelId(null);
    setErro(null);
    startTransition(async () => {
      const r = await excluirVeiculo(id);
      if (r.error) {
        setItens(antes);
        setErro(r.error);
      }
    });
  }

  const lista = itens.filter((v) => {
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
        <ResultBar shown={lista.length} total={itens.length} active={filtroAtivo} onClear={limpar} />
      </div>

      {erro && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}

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
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={7} busca={busca} />}
              {lista.map((v) => (
                <Fragment key={v.id}>
                <tr
                  className={`border-b border-[var(--ad-line)] transition-colors hover:bg-[var(--ad-surface-2)] ${delId === v.id ? "" : "last:border-0"}`}
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
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDelId((id) => (id === v.id ? null : v.id))}
                        aria-label={`Excluir veículo ${v.placa}`}
                        className="grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:border-red-500/50 hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                      <Link
                        href={`/oficina/veiculos/${v.id}`}
                        aria-label={`Abrir ${v.modelo}`}
                        className="grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]"
                      >
                        <ChevronRight className="size-4" />
                      </Link>
                    </div>
                  </td>
                </tr>

                {delId === v.id && (
                  <tr className="border-b border-[var(--ad-line)] bg-red-500/5">
                    <td colSpan={7} className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <AlertTriangle className="size-4 shrink-0 text-red-400" />
                        <p className="text-sm adm-ink">
                          Excluir <span className="font-semibold">{v.modelo}</span>{" "}
                          <span className="font-mono adm-muted">{v.placa}</span>?
                          <span className="adm-muted"> As OS dele continuam no histórico, sem o vínculo.</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => excluir(v.id)}
                          className="rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
                        >
                          Excluir de vez
                        </button>
                        <button
                          type="button"
                          onClick={() => setDelId(null)}
                          className="rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
