"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Trash2, Check, ClipboardList } from "lucide-react";
import { brl } from "../_data/mock";
import { criarOS } from "../actions";

interface ClienteOpt {
  id: string;
  nome: string;
}
interface VeiculoOpt {
  id: string;
  proprietario: string;
  modelo: string;
  placa: string;
}
interface Item {
  tipo: "Peça" | "Serviço";
  descricao: string;
  qtd: number;
  valor: number;
}

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

export function NewOrderForm({
  clientes,
  veiculos,
}: {
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
}) {
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [data, setData] = useState("");
  const [km, setKm] = useState("");
  const [defeito, setDefeito] = useState("");
  const [obs, setObs] = useState("");
  const [itens, setItens] = useState<Item[]>([]);
  const [draft, setDraft] = useState<Item>({ tipo: "Peça", descricao: "", qtd: 1, valor: 0 });
  const [criada, setCriada] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome ?? "";
  const veiculosDoCliente = clienteId
    ? veiculos.filter((v) => v.proprietario === clienteNome)
    : veiculos;
  const total = itens.reduce((s, i) => s + i.valor * i.qtd, 0);
  const podeAdicionar = draft.descricao.trim() !== "" && draft.valor > 0;
  const podeCriar = clienteId !== "" && veiculoId !== "" && defeito.trim() !== "" && itens.length > 0;

  function addItem() {
    if (!podeAdicionar) return;
    setItens((x) => [...x, draft]);
    setDraft({ tipo: "Peça", descricao: "", qtd: 1, valor: 0 });
  }

  function criar() {
    startTransition(async () => {
      const r = await criarOS({
        clienteId,
        veiculoId,
        data,
        km: Number(km) || 0,
        defeito,
        observacoes: obs,
        itens,
      });
      setCriada(r.id);
    });
  }

  if (criada) {
    const veiculoNome = veiculos.find((v) => v.id === veiculoId)?.modelo ?? "";
    return (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-8 text-emerald-400" />
        </span>
        <h2 className="adm-display mt-4 text-2xl font-bold adm-ink">Ordem criada!</h2>
        <p className="mt-1 font-mono text-sm adm-brand">{criada}</p>
        <div className="adm-card mt-5 space-y-2 p-5 text-left text-sm">
          <div className="flex justify-between"><span className="adm-muted">Cliente</span><span className="adm-ink">{clienteNome}</span></div>
          <div className="flex justify-between"><span className="adm-muted">Veículo</span><span className="adm-ink">{veiculoNome}</span></div>
          <div className="flex justify-between"><span className="adm-muted">Itens</span><span className="adm-ink">{itens.length}</span></div>
          <div className="flex justify-between border-t border-[var(--ad-line)] pt-2">
            <span className="font-semibold adm-ink">Total</span>
            <span className="adm-display font-bold adm-ink">{brl(total)}</span>
          </div>
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/oficina/ordens" className="rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
            Ver ordens
          </Link>
          <Link href={`/oficina/ordens/${criada}`} className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]">
            Abrir OS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-tour="adm-neworder" className="mx-auto max-w-3xl space-y-6">
      <Link href="/oficina/ordens" className="text-sm font-semibold adm-muted hover:adm-brand">
        ← Ordens de Serviço
      </Link>

      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 flex items-center gap-2 font-bold adm-ink">
          <ClipboardList className="size-5 adm-brand" />
          Dados da ordem
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Cliente</label>
            <select value={clienteId} onChange={(e) => { setClienteId(e.target.value); setVeiculoId(""); }} className={inputCls}>
              <option value="">Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Veículo</label>
            <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} className={inputCls}>
              <option value="">Selecione…</option>
              {veiculosDoCliente.map((v) => (
                <option key={v.id} value={v.id}>{v.modelo} · {v.placa}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Data de entrada</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Quilometragem</label>
            <input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="km" className={inputCls} />
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Defeito relatado</label>
          <textarea value={defeito} onChange={(e) => setDefeito(e.target.value)} rows={2} placeholder="Descreva o problema relatado pelo cliente…" className={`${inputCls} resize-none`} />
        </div>
      </div>

      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">Peças e serviços</h2>

        {itens.length > 0 && (
          <div className="mb-4 divide-y divide-[var(--ad-line)] rounded-lg border border-[var(--ad-line)]">
            {itens.map((it, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <span className="rounded-md bg-[var(--ad-surface-2)] px-2 py-0.5 text-xs adm-muted">{it.tipo}</span>
                <span className="min-w-0 flex-1 truncate text-sm adm-ink">{it.descricao}</span>
                <span className="text-xs adm-muted">×{it.qtd}</span>
                <span className="text-sm font-semibold adm-ink">{brl(it.valor * it.qtd)}</span>
                <button type="button" onClick={() => setItens((x) => x.filter((_, idx) => idx !== i))} aria-label="Remover">
                  <Trash2 className="size-4 text-rose-400" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-[7rem_1fr_4rem_6rem_auto]">
          <select value={draft.tipo} onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value as Item["tipo"] }))} className={inputCls}>
            <option value="Peça">Peça</option>
            <option value="Serviço">Serviço</option>
          </select>
          <input value={draft.descricao} onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value }))} placeholder="Descrição" className={inputCls} />
          <input type="number" min={1} value={draft.qtd} onChange={(e) => setDraft((d) => ({ ...d, qtd: Math.max(1, Number(e.target.value)) }))} className={inputCls} aria-label="Quantidade" />
          <input type="number" min={0} value={draft.valor || ""} onChange={(e) => setDraft((d) => ({ ...d, valor: Number(e.target.value) }))} placeholder="R$" className={inputCls} aria-label="Valor" />
          <button type="button" onClick={addItem} disabled={!podeAdicionar} className="flex items-center justify-center gap-1 rounded-lg bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm font-semibold adm-ink transition-colors enabled:hover:bg-[var(--ad-line)] disabled:opacity-40">
            <Plus className="size-4" />
            <span className="sm:hidden">Adicionar item</span>
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--ad-line)] pt-4">
          <span className="text-sm adm-muted">Total da OS</span>
          <span className="adm-display text-xl font-bold adm-ink">{brl(total)}</span>
        </div>
      </div>

      <div className="adm-card p-5">
        <label className={labelCls}>Observações</label>
        <textarea value={obs} onChange={(e) => setObs(e.target.value)} rows={2} placeholder="Observações internas (opcional)…" className={`${inputCls} resize-none`} />
      </div>

      <button type="button" disabled={!podeCriar || pending} onClick={criar} className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] py-3.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1d4ed8] disabled:opacity-40">
        <Check className="size-5" />
        {pending ? "Criando…" : "Criar ordem de serviço"}
      </button>
      {!podeCriar && (
        <p className="-mt-3 text-center text-xs adm-muted">Selecione cliente, veículo, defeito e ao menos um item.</p>
      )}
    </div>
  );
}
