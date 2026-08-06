"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Car, Trash2, AlertTriangle } from "lucide-react";
import { brl, type Cliente } from "../_data/mock";
import { excluirCliente, excluirVeiculo } from "../actions";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, ResultBar, EmptyRow } from "./table-filters";

export function ClientsTable({ clientes }: { clientes: Cliente[] }) {
  const [itens, setItens] = useState<Cliente[]>(clientes);
  const [busca, setBusca] = useState("");
  const [semTelefone, setSemTelefone] = useState(false);
  const [semVeiculo, setSemVeiculo] = useState(false);

  // painéis abertos por linha: veículos do cliente | confirmação de exclusão
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const lista = itens.filter((c) => {
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

  function apagarCliente(id: string) {
    const antes = itens;
    setItens((x) => x.filter((c) => c.id !== id));
    setDelId(null);
    setErro(null);
    startTransition(async () => {
      const r = await excluirCliente(id);
      if (r.error) {
        setItens(antes); // desfaz o otimismo se o servidor recusou
        setErro(r.error);
      }
    });
  }

  function apagarVeiculo(clienteId: string, veiculoId: string) {
    const antes = itens;
    setItens((x) =>
      x.map((c) =>
        c.id === clienteId
          ? {
              ...c,
              veiculos: Math.max(0, c.veiculos - 1),
              carros: (c.carros ?? []).filter((v) => v.id !== veiculoId),
              placas: (c.placas ?? []).filter((p) => p !== (c.carros ?? []).find((v) => v.id === veiculoId)?.placa),
            }
          : c
      )
    );
    setErro(null);
    startTransition(async () => {
      const r = await excluirVeiculo(veiculoId);
      if (r.error) {
        setItens(antes);
        setErro(r.error);
      }
    });
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
        <ResultBar shown={lista.length} total={itens.length} active={filtroAtivo} onClear={limpar} />
      </div>

      {erro && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Telefone</th>
                <th className="px-5 py-3 font-semibold">Cidade</th>
                <th className="px-5 py-3 text-center font-semibold">Veículos</th>
                <th className="px-5 py-3 text-right font-semibold">Gasto total</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={6} busca={busca} />}
              {lista.map((c) => (
                <ClientRow
                  key={c.id}
                  c={c}
                  aberto={abertoId === c.id}
                  delAberto={delId === c.id}
                  onToggleVeiculos={() => {
                    setDelId(null);
                    setAbertoId((id) => (id === c.id ? null : c.id));
                  }}
                  onToggleDel={() => {
                    setAbertoId(null);
                    setDelId((id) => (id === c.id ? null : c.id));
                  }}
                  onExcluirCliente={() => apagarCliente(c.id)}
                  onExcluirVeiculo={(veiculoId) => apagarVeiculo(c.id, veiculoId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ClientRow({
  c,
  aberto,
  delAberto,
  onToggleVeiculos,
  onToggleDel,
  onExcluirCliente,
  onExcluirVeiculo,
}: {
  c: Cliente;
  aberto: boolean;
  delAberto: boolean;
  onToggleVeiculos: () => void;
  onToggleDel: () => void;
  onExcluirCliente: () => void;
  onExcluirVeiculo: (veiculoId: string) => void;
}) {
  const [delVeiculoId, setDelVeiculoId] = useState<string | null>(null);
  const carros = c.carros ?? [];
  const painelAberto = aberto || delAberto;
  const btnCls =
    "grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]";

  return (
    <>
      <tr className={`border-b border-[var(--ad-line)] transition-colors hover:bg-[var(--ad-surface-2)] ${painelAberto ? "" : "last:border-0"}`}>
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
        <td className="px-5 py-3.5 text-center">
          {carros.length > 0 ? (
            <button
              type="button"
              onClick={onToggleVeiculos}
              aria-expanded={aberto}
              className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${
                aberto ? "border-[var(--ad-brand)] adm-brand" : "border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]"
              }`}
            >
              <Car className="size-3.5" />
              {c.veiculos}
              <ChevronDown className={`size-3.5 transition-transform ${aberto ? "rotate-180" : ""}`} />
            </button>
          ) : (
            <span className="adm-muted">0</span>
          )}
        </td>
        <td className="px-5 py-3.5 text-right font-semibold adm-ink">{brl(c.gastoTotal)}</td>
        <td className="px-5 py-3.5">
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              onClick={onToggleDel}
              aria-label={`Excluir ${c.nome}`}
              className={`${btnCls} hover:border-red-500/50 hover:text-red-400`}
            >
              <Trash2 className="size-3.5" />
            </button>
            <Link href={`/oficina/clientes/${c.id}`} aria-label={`Abrir ${c.nome}`} className={btnCls}>
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </td>
      </tr>

      {aberto && (
        <tr className="border-b border-[var(--ad-line)] bg-[var(--ad-surface-2)]/40">
          <td colSpan={6} className="px-5 py-3">
            <ul className="space-y-2">
              {carros.map((v) => (
                <li key={v.id} className="flex flex-wrap items-center gap-3">
                  <Car className="size-4 shrink-0 adm-muted" />
                  <Link href={`/oficina/veiculos/${v.id}`} className="text-sm font-semibold adm-ink hover:adm-brand">
                    {v.modelo}
                  </Link>
                  <span className="font-mono text-xs adm-muted">{v.placa}</span>
                  {delVeiculoId === v.id ? (
                    <span className="flex items-center gap-2">
                      <span className="text-xs adm-muted">Excluir este veículo? As OS dele ficam no histórico.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setDelVeiculoId(null);
                          onExcluirVeiculo(v.id);
                        }}
                        className="rounded-lg bg-red-500/90 px-3 py-1 text-xs font-semibold text-white hover:bg-red-500"
                      >
                        Excluir
                      </button>
                      <button
                        type="button"
                        onClick={() => setDelVeiculoId(null)}
                        className="rounded-lg border border-[var(--ad-line)] px-3 py-1 text-xs font-semibold adm-muted"
                      >
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDelVeiculoId(v.id)}
                      aria-label={`Excluir veículo ${v.placa}`}
                      className="grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:border-red-500/50 hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </td>
        </tr>
      )}

      {delAberto && (
        <tr className="border-b border-[var(--ad-line)] bg-red-500/5">
          <td colSpan={6} className="px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <AlertTriangle className="size-4 shrink-0 text-red-400" />
              <p className="text-sm adm-ink">
                Excluir <span className="font-semibold">{c.nome}</span>?
                <span className="adm-muted">
                  {c.veiculos > 0 && ` Apaga junto ${c.veiculos} veículo${c.veiculos > 1 ? "s" : ""}.`}
                  {(c.ordens ?? 0) > 0 &&
                    ` As ${c.ordens} OS ficam no histórico, sem o vínculo com o cliente.`}
                </span>
              </p>
              <button
                type="button"
                onClick={onExcluirCliente}
                className="rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
              >
                Excluir de vez
              </button>
              <button
                type="button"
                onClick={onToggleDel}
                className="rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted"
              >
                Cancelar
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
