"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { solicitarOrcamento } from "./actions";

interface VeiculoOpt {
  id: string;
  modelo: string;
  placa: string;
}

const inputCls =
  "w-full rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-2)] px-3 py-3 text-sm t-ink outline-none focus:border-[var(--app-brand)]";

export function SolicitarForm({ veiculos }: { veiculos: VeiculoOpt[] }) {
  const [veiculoId, setVeiculoId] = useState(veiculos[0]?.id ?? "");
  const [descricao, setDescricao] = useState("");
  const [enviado, setEnviado] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function enviar() {
    startTransition(async () => {
      const r = await solicitarOrcamento({ veiculoId, descricao });
      setEnviado(r.id);
    });
  }

  if (enviado) {
    return (
      <div className="px-5 py-10 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-8 text-emerald-400" />
        </span>
        <h2 className="app-display mt-4 text-xl font-bold t-ink">Solicitação enviada!</h2>
        <p className="mt-1 text-sm t-muted">
          A oficina vai preparar seu orçamento. Você recebe uma notificação quando ficar pronto.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/app/acompanhar" className="flex items-center gap-2 rounded-xl bg-[var(--app-brand)] px-4 py-2.5 text-sm font-semibold text-white">
            Acompanhar
            <ArrowRight className="size-4" />
          </Link>
          <Link href="/app" className="rounded-xl border border-[var(--app-line)] px-4 py-2.5 text-sm font-semibold t-ink">
            Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-tour="app-solicitar" className="space-y-5 px-5 pb-8 pt-3">
      <p className="text-sm t-muted">Conte o que seu carro precisa e a oficina prepara um orçamento.</p>

      <div>
        <label className="mb-1 block text-xs font-medium t-muted">Veículo</label>
        <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} className={inputCls}>
          {veiculos.length === 0 && <option value="">Nenhum veículo</option>}
          {veiculos.map((v) => (
            <option key={v.id} value={v.id}>
              {v.modelo} · {v.placa}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium t-muted">O que precisa?</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          rows={5}
          placeholder="Ex.: barulho no freio, revisão dos 60 mil, troca de óleo…"
          className={`${inputCls} resize-none`}
        />
      </div>

      <button
        type="button"
        disabled={!veiculoId || !descricao.trim() || pending}
        onClick={enviar}
        className="app-btn-primary w-full py-3.5 text-sm"
      >
        {pending ? "Enviando…" : "Solicitar orçamento"}
      </button>
    </div>
  );
}
