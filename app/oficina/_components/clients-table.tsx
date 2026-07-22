"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { brl, type Cliente } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, ResultBar, EmptyRow } from "./table-filters";

export function ClientsTable({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState("");
  const [semTelefone, setSemTelefone] = useState(false);
  const [semVeiculo, setSemVeiculo] = useState(false);

  const lista = clientes.filter((c) => {
    if (semTelefone && c.telefone !== "—") return false;
    if (semVeiculo && c.veiculos > 0) return false;
    return matches([c.nome, c.telefone, c.email, c.cidade, ...(c.placas ?? [])], busca);
  });
  const filtroAtivo = busca !== "" || semTelefone || semVeiculo;

  function limpar() {
    setBusca("");
    setSemTelefone(false);
    setSemVeiculo(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar nome, telefone, placa…" />
        <FilterChip active={semTelefone} onClick={() => setSemTelefone((v) => !v)}>
          Sem telefone
        </FilterChip>
        <FilterChip active={semVeiculo} onClick={() => setSemVeiculo((v) => !v)}>
          Sem veículo
        </FilterChip>
        <ResultBar shown={lista.length} total={clientes.length} active={filtroAtivo} onClear={limpar} />
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Telefone</th>
                <th className="px-5 py-3 font-semibold">Cidade</th>
                <th className="px-5 py-3 text-center font-semibold">Veículos</th>
                <th className="px-5 py-3 text-right font-semibold">Gasto total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={6} busca={busca} />}
              {lista.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/clientes/${c.id}`} className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--ad-brand)]/15 text-xs font-bold adm-brand">
                        {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                      <span className="font-semibold adm-ink">{c.nome}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 adm-muted">{c.telefone}</td>
                  <td className="px-5 py-3.5 adm-muted">{c.cidade}</td>
                  <td className="px-5 py-3.5 text-center adm-ink">{c.veiculos}</td>
                  <td className="px-5 py-3.5 text-right font-semibold adm-ink">{brl(c.gastoTotal)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/clientes/${c.id}`} className="inline-flex adm-muted hover:adm-brand">
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
