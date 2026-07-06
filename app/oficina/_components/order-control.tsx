"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Plus,
  Trash2,
  MessageCircle,
  FileDown,
  ArrowRight,
  ClipboardList,
  Truck,
} from "lucide-react";
import { brl, osBadgeClass, type StatusOS, type Produto } from "../_data/mock";
import type { OsControle } from "@/lib/admin-data";
import {
  mudarStatus,
  adicionarItemOS,
  removerItemOS,
  enviarParaAprovacao,
  entregarOS,
  atribuirMecanico,
} from "../os-actions";

const FLUXO: StatusOS[] = ["Aberta", "Aguardando aprovação", "Em execução", "Finalizada", "Entregue"];
const VISTORIA_COR: Record<string, string> = {
  ok: "text-emerald-400",
  atencao: "text-amber-400",
  avaria: "text-rose-400",
};
const VISTORIA_LABEL: Record<string, string> = { ok: "OK", atencao: "Atenção", avaria: "Avaria" };

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function OrderControl({
  os,
  estoque,
  mecanicos,
}: {
  os: OsControle;
  estoque: Produto[];
  mecanicos: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState({ tipo: "Peça", descricao: "", qtd: 1, valor: 0, productId: "" });
  const [showEntrega, setShowEntrega] = useState(false);
  const [exitKm, setExitKm] = useState("");
  const [paid, setPaid] = useState(true);

  const idx = FLUXO.indexOf(os.status as StatusOS);
  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  function addItem() {
    if (!draft.descricao.trim() || draft.valor <= 0) return;
    const payload = { ...draft, productId: draft.productId || undefined };
    setDraft({ tipo: "Peça", descricao: "", qtd: 1, valor: 0, productId: "" });
    run(() => adicionarItemOS(os.id, payload));
  }

  const info = [
    { label: "Cliente", value: os.cliente },
    { label: "Veículo", value: `${os.veiculo} · ${os.placa}` },
    { label: "Entrada", value: os.data },
    { label: "Km de entrada", value: `${os.km.toLocaleString("pt-BR")} km` },
    { label: "Combustível", value: os.fuelLevel ?? "—" },
    { label: "Mecânico", value: os.mecanico },
  ];

  return (
    <div className="space-y-6">
      <Link href="/oficina/ordens" className="inline-flex items-center gap-1.5 text-sm font-semibold adm-muted hover:adm-brand">
        <ArrowLeft className="size-4" />
        Ordens de Serviço
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-sm adm-muted">{os.id}</p>
          <h2 className="adm-display text-2xl font-bold adm-ink">{os.cliente}</h2>
        </div>
        <span className={osBadgeClass[os.status as StatusOS]}>{os.status}</span>
      </div>

      {/* Stepper */}
      <div className="adm-card p-5">
        <div className="flex items-center">
          {FLUXO.map((s, i) => {
            const done = i <= idx;
            return (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-2">
                  <span className={`grid size-8 place-items-center rounded-full text-xs font-bold ${done ? "bg-[var(--ad-brand)] text-white" : "bg-[var(--ad-surface-2)] adm-muted"}`}>
                    {done ? <Check className="size-4" /> : i + 1}
                  </span>
                  <span className={`hidden w-20 text-center text-[0.65rem] font-medium leading-tight sm:block ${done ? "adm-ink" : "adm-muted"}`}>{s}</span>
                </div>
                {i < FLUXO.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < idx ? "bg-[var(--ad-brand)]" : "bg-[var(--ad-surface-2)]"}`} />}
              </div>
            );
          })}
        </div>

        {/* Ações contextuais de status */}
        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--ad-line)] pt-5">
          {idx > 0 && os.status !== "Entregue" && (
            <button type="button" disabled={pending} onClick={() => run(() => mudarStatus(os.id, FLUXO[idx - 1]))} className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]">
              <ChevronLeft className="size-4" />
              Voltar
            </button>
          )}

          {os.status === "Aberta" && (
            <button type="button" disabled={pending || os.itens.length === 0} onClick={() => run(() => enviarParaAprovacao(os.id))} className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1d4ed8] disabled:opacity-40">
              Enviar orçamento p/ aprovação
              <ArrowRight className="size-4" />
            </button>
          )}

          {os.status === "Aguardando aprovação" && (
            <>
              <span className="text-sm adm-muted">
                Cliente:{" "}
                <span className="font-semibold adm-ink">
                  {os.budgetStatus === "aprovado" ? "aprovou ✓" : os.budgetStatus === "rejeitado" ? "rejeitou ✗" : "aguardando resposta…"}
                </span>
              </span>
              <button type="button" disabled={pending} onClick={() => run(() => mudarStatus(os.id, "Em execução"))} className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
                Iniciar execução
                <ArrowRight className="size-4" />
              </button>
            </>
          )}

          {os.status === "Em execução" && (
            <button type="button" disabled={pending} onClick={() => run(() => mudarStatus(os.id, "Finalizada"))} className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">
              <Check className="size-4" />
              Finalizar serviço (baixa estoque)
            </button>
          )}

          {os.status === "Finalizada" && (
            <button type="button" onClick={() => setShowEntrega((v) => !v)} className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
              <Truck className="size-4" />
              Registrar entrega
            </button>
          )}

          {os.status === "Entregue" && (
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Check className="size-4" />
              Entregue em {os.deliveredAt}
              {os.paid ? " · pago" : " · pagamento pendente"}
            </p>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm adm-muted">Mecânico:</span>
            <select
              value={os.mechanicId ?? ""}
              onChange={(e) => run(() => atribuirMecanico(os.id, e.target.value))}
              className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
            >
              <option value="">Não atribuído</option>
              {mecanicos.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form de entrega */}
        {showEntrega && os.status === "Finalizada" && (
          <div className="mt-4 grid gap-3 rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium adm-muted">Km de saída</label>
              <input type="number" value={exitKm} onChange={(e) => setExitKm(e.target.value)} placeholder="km" className={inputCls} />
            </div>
            <label className="flex items-center gap-2 py-2.5 text-sm adm-ink">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="size-5 accent-[var(--ad-brand)]" />
              Pagamento recebido
            </label>
            <button type="button" disabled={pending} onClick={() => { setShowEntrega(false); run(() => entregarOS(os.id, Number(exitKm) || 0, paid)); }} className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">
              Confirmar entrega
            </button>
          </div>
        )}
      </div>

      {/* Info + defeito */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="adm-card p-5 lg:col-span-2">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3">
            {info.map((m) => (
              <div key={m.label}>
                <p className="text-xs adm-muted">{m.label}</p>
                <p className="text-sm font-semibold adm-ink">{m.value}</p>
              </div>
            ))}
            {os.exitKm != null && (
              <div>
                <p className="text-xs adm-muted">Km de saída</p>
                <p className="text-sm font-semibold adm-ink">{os.exitKm.toLocaleString("pt-BR")} km</p>
              </div>
            )}
          </div>
        </div>
        <div className="adm-card p-5">
          <p className="text-xs uppercase tracking-wide adm-muted">Defeito relatado</p>
          <p className="mt-1.5 text-sm adm-ink">{os.defeito}</p>
        </div>
      </div>

      {/* Vistoria de entrada */}
      {os.inspection && (
        <div className="adm-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--ad-line)] px-5 py-3.5">
            <h3 className="adm-display flex items-center gap-2 font-bold adm-ink">
              <ClipboardList className="size-5 adm-brand" />
              Vistoria de entrada
            </h3>
            <span className={os.authorized ? "osb osb-finalizada" : "osb osb-aguardando"}>
              {os.authorized ? "Autorizada" : "Sem autorização"}
            </span>
          </div>
          <div className="grid gap-x-6 gap-y-2 p-5 sm:grid-cols-2">
            {(os.inspection.checklist ?? []).map((c) => (
              <div key={c.item} className="flex items-center justify-between py-1 text-sm">
                <span className="adm-ink">{c.item}</span>
                <span className={`font-semibold ${VISTORIA_COR[c.status] ?? "adm-muted"}`}>
                  {VISTORIA_LABEL[c.status] ?? c.status}
                </span>
              </div>
            ))}
          </div>
          {(os.inspection.avarias || os.inspection.objetos) && (
            <div className="grid gap-4 border-t border-[var(--ad-line)] p-5 sm:grid-cols-2">
              {os.inspection.avarias && (
                <div>
                  <p className="text-xs uppercase tracking-wide adm-muted">Avarias</p>
                  <p className="mt-1 text-sm adm-ink">{os.inspection.avarias}</p>
                </div>
              )}
              {os.inspection.objetos && (
                <div>
                  <p className="text-xs uppercase tracking-wide adm-muted">Objetos no veículo</p>
                  <p className="mt-1 text-sm adm-ink">{os.inspection.objetos}</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Itens / orçamento */}
      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display font-bold adm-ink">Peças e serviços (orçamento)</h3>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {os.itens.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Nenhum item ainda — adicione peças e serviços abaixo.</p>}
          {os.itens.map((it) => (
            <div key={it.id} className="flex items-center gap-3 px-5 py-3">
              <span className="rounded-md bg-[var(--ad-surface-2)] px-2 py-0.5 text-xs font-medium adm-muted">{it.tipo}</span>
              <span className="min-w-0 flex-1 truncate text-sm adm-ink">
                {it.descricao}
                {it.productId && <span className="ml-2 text-xs text-emerald-400">• estoque</span>}
              </span>
              <span className="text-xs adm-muted">×{it.qtd}</span>
              <span className="text-sm font-semibold adm-ink">{brl(it.valor * it.qtd)}</span>
              <button type="button" disabled={pending} onClick={() => run(() => removerItemOS(it.id, os.id))} aria-label="Remover">
                <Trash2 className="size-4 text-rose-400" />
              </button>
            </div>
          ))}
        </div>

        {/* linha de adição */}
        <div className="border-t border-[var(--ad-line)] bg-[var(--ad-surface-2)]/50 p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[6.5rem_1fr_3.5rem_5.5rem_auto]">
            <select value={draft.tipo} onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value, productId: e.target.value === "Serviço" ? "" : d.productId }))} className={inputCls}>
              <option value="Peça">Peça</option>
              <option value="Serviço">Serviço</option>
            </select>
            <input value={draft.descricao} onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value, productId: "" }))} placeholder="Descrição" className={inputCls} />
            <input type="number" min={1} value={draft.qtd} onChange={(e) => setDraft((d) => ({ ...d, qtd: Math.max(1, Number(e.target.value)) }))} className={inputCls} aria-label="Qtd" />
            <input type="number" min={0} value={draft.valor || ""} onChange={(e) => setDraft((d) => ({ ...d, valor: Number(e.target.value) }))} placeholder="R$" className={inputCls} aria-label="Valor" />
            <button type="button" onClick={addItem} disabled={pending || !draft.descricao.trim() || draft.valor <= 0} className="flex items-center justify-center gap-1 rounded-lg bg-[var(--ad-brand)] px-3 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1d4ed8] disabled:opacity-40">
              <Plus className="size-4" />
              <span className="sm:hidden">Adicionar</span>
            </button>
          </div>
          {draft.tipo === "Peça" && estoque.length > 0 && (
            <select
              value={draft.productId}
              onChange={(e) => {
                const p = estoque.find((x) => x.id === e.target.value);
                setDraft((d) => ({ ...d, productId: e.target.value, descricao: p ? p.produto : d.descricao }));
              }}
              className={`${inputCls} mt-2`}
            >
              <option value="">Vincular peça do estoque (opcional — baixa ao finalizar)…</option>
              {estoque.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.produto} · {p.codigo} ({p.qtd} un.)
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--ad-line)] px-5 py-3.5">
          <span className="text-sm adm-muted">Total da OS</span>
          <span className="adm-display text-xl font-bold adm-ink">{brl(os.total)}</span>
        </div>
      </div>

      {os.observacoes && (
        <div className="adm-card p-5">
          <p className="text-xs uppercase tracking-wide adm-muted">Observações</p>
          <p className="mt-1.5 text-sm adm-ink">{os.observacoes}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap gap-3">
        <a href={`https://wa.me/?text=${encodeURIComponent(`Olá! Sobre a OS ${os.id} do seu ${os.veiculo}.`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]">
          <MessageCircle className="size-4 text-emerald-400" />
          Avisar no WhatsApp
        </a>
        <a href={`/oficina/ordens/${encodeURIComponent(os.id)}/pdf`} className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]">
          <FileDown className="size-4 adm-brand" />
          Gerar PDF
        </a>
      </div>
    </div>
  );
}
