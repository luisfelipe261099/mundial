"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Plus,
  Pencil,
  Trash2,
  MessageCircle,
  FileDown,
  ArrowRight,
  ClipboardList,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { brl, osBadgeClass, type StatusOS, type Produto } from "../_data/mock";
import type { OsControle } from "@/lib/admin-data";
import type { NotaFiscalView } from "@/lib/fiscal";
import { emitirNfseOS } from "../fiscal/actions";
import {
  mudarStatus,
  adicionarItemOS,
  editarItemOS,
  removerItemOS,
  moverItemOS,
  editarOS,
  excluirOS,
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
const labelCls = "mb-1 block text-xs font-medium adm-muted";

export function OrderControl({
  os,
  estoque,
  mecanicos,
  clientes,
  veiculos,
  notas,
  fiscalPronto,
  fiscalAmbiente,
}: {
  os: OsControle;
  estoque: Produto[];
  mecanicos: { id: string; name: string }[];
  clientes: { id: string; nome: string }[];
  veiculos: { id: string; proprietario: string; modelo: string; placa: string }[];
  notas: NotaFiscalView[];
  fiscalPronto: boolean;
  fiscalAmbiente: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Rascunhos separados: peça e serviço têm cada um a sua linha de adição —
  // acabou o seletor de tipo que exigia um clique a mais a cada item.
  const [draftPeca, setDraftPeca] = useState({ descricao: "", qtd: 1, valor: 0, productId: "" });
  const [draftServ, setDraftServ] = useState({ descricao: "", qtd: 1, valor: 0 });
  const [showEntrega, setShowEntrega] = useState(false);
  const [exitKm, setExitKm] = useState("");
  const [paid, setPaid] = useState(true);

  // edição da ficha da OS
  const [editandoOS, setEditandoOS] = useState(false);
  const [fichaOS, setFichaOS] = useState({
    clienteId: os.clientId ?? "",
    veiculoId: os.vehicleId ?? "",
    data: os.data,
    km: String(os.km),
    fuelLevel: os.fuelLevelRaw,
    defeito: os.defeito === "—" ? "" : os.defeito,
    observacoes: os.observacoes,
  });
  const [erroOS, setErroOS] = useState<string | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  function salvarOS() {
    setErroOS(null);
    startTransition(async () => {
      const r = await editarOS(os.id, fichaOS);
      if (r.error) setErroOS(r.error);
      else setEditandoOS(false);
    });
  }

  function apagarOS() {
    setErroOS(null);
    startTransition(async () => {
      const r = await excluirOS(os.id);
      if (r.error) setErroOS(r.error);
      else router.push("/oficina/ordens");
    });
  }

  // NFS-e
  const [erroNota, setErroNota] = useState<string | null>(null);
  const [notaOk, setNotaOk] = useState<string | null>(null);
  const totalServicos = os.itens
    .filter((i) => i.tipo === "Serviço")
    .reduce((s, i) => s + i.valor * i.qtd, 0);

  function emitirNota() {
    setErroNota(null);
    setNotaOk(null);
    startTransition(async () => {
      const r = await emitirNfseOS(os.id);
      if (r.ok) {
        setNotaOk(r.chaveAcesso ?? "");
        router.refresh();
      } else {
        setErroNota(r.error ?? "Não foi possível emitir a nota.");
        router.refresh();
      }
    });
  }

  // edição de um item já lançado
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState({ tipo: "Peça", descricao: "", qtd: 1, valor: 0 });
  const [erroItem, setErroItem] = useState<string | null>(null);

  const idx = FLUXO.indexOf(os.status as StatusOS);
  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  function abrirEdicao(it: OsControle["itens"][number]) {
    setErroItem(null);
    setEditId(it.id);
    setEdit({ tipo: it.tipo, descricao: it.descricao, qtd: it.qtd, valor: it.valor });
  }

  function salvarItem(itemId: string) {
    setErroItem(null);
    startTransition(async () => {
      const r = await editarItemOS(itemId, os.id, edit);
      if (r.error) setErroItem(r.error);
      else setEditId(null);
    });
  }

  function addPeca() {
    if (!draftPeca.descricao.trim() || draftPeca.valor <= 0) return;
    const payload = { tipo: "Peça", ...draftPeca, productId: draftPeca.productId || undefined };
    setDraftPeca({ descricao: "", qtd: 1, valor: 0, productId: "" });
    run(() => adicionarItemOS(os.id, payload));
  }

  function addServ() {
    if (!draftServ.descricao.trim() || draftServ.valor <= 0) return;
    const payload = { tipo: "Serviço", ...draftServ, productId: undefined };
    setDraftServ({ descricao: "", qtd: 1, valor: 0 });
    run(() => adicionarItemOS(os.id, payload));
  }

  // Linha de item (exibição ou edição inline) na lista única do orçamento.
  // As setas trocam a posição — a ordem daqui é a que sai no PDF.
  function linhaItem(it: OsControle["itens"][number], i: number, total: number) {
    if (editId === it.id) {
      return (
        <div key={it.id} className="bg-[var(--ad-surface-2)]/40 px-5 py-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[6.5rem_1fr_3.5rem_5.5rem_auto_auto]">
            <select
              value={edit.tipo}
              onChange={(e) => setEdit((d) => ({ ...d, tipo: e.target.value }))}
              className={inputCls}
              aria-label="Tipo do item"
            >
              <option value="Peça">Peça</option>
              <option value="Serviço">Serviço</option>
            </select>
            <input
              value={edit.descricao}
              onChange={(e) => setEdit((d) => ({ ...d, descricao: e.target.value }))}
              className={inputCls}
              aria-label="Descrição do item"
            />
            <input
              type="number"
              min={1}
              value={edit.qtd}
              onChange={(e) => setEdit((d) => ({ ...d, qtd: Math.max(1, Number(e.target.value)) }))}
              className={inputCls}
              aria-label="Quantidade"
            />
            <input
              type="number"
              min={0}
              value={edit.valor || ""}
              onChange={(e) => setEdit((d) => ({ ...d, valor: Number(e.target.value) }))}
              placeholder="R$"
              className={inputCls}
              aria-label="Valor unitário"
            />
            <button
              type="button"
              disabled={pending || !edit.descricao.trim()}
              onClick={() => salvarItem(it.id)}
              className="flex items-center justify-center gap-1 rounded-lg bg-[var(--ad-brand)] px-3 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
            >
              <Check className="size-4" />
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setEditId(null)}
              className="rounded-lg border border-[var(--ad-line)] px-3 py-2.5 text-sm font-semibold adm-muted"
            >
              Cancelar
            </button>
          </div>
          {it.productId && edit.tipo === "Serviço" && (
            <p className="mt-2 text-xs adm-muted">Virando serviço, o vínculo com o estoque sai.</p>
          )}
          {os.status === "Entregue" && (
            <p className="mt-2 text-xs text-amber-300">
              OS já entregue — mudar o valor aqui não corrige sozinho o lançamento no financeiro.
            </p>
          )}
          {erroItem && <p className="mt-2 text-xs text-rose-300">{erroItem}</p>}
        </div>
      );
    }
    return (
      <div key={it.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
        <span className="flex flex-col">
          <button
            type="button"
            disabled={pending || i === 0}
            onClick={() => run(() => moverItemOS(it.id, os.id, "cima"))}
            className="disabled:opacity-25"
            aria-label={`Subir ${it.descricao}`}
          >
            <ChevronUp className="size-4 adm-muted hover:adm-brand" />
          </button>
          <button
            type="button"
            disabled={pending || i === total - 1}
            onClick={() => run(() => moverItemOS(it.id, os.id, "baixo"))}
            className="disabled:opacity-25"
            aria-label={`Descer ${it.descricao}`}
          >
            <ChevronDown className="size-4 adm-muted hover:adm-brand" />
          </button>
        </span>
        <span
          className={`hidden rounded-md px-2 py-0.5 text-xs font-medium sm:inline ${
            it.tipo === "Peça" ? "bg-[var(--ad-surface-2)] adm-muted" : "bg-[var(--ad-brand)]/10 adm-brand"
          }`}
        >
          {it.tipo}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm adm-ink">
          {it.descricao}
          {it.productId && <span className="ml-2 text-xs text-emerald-400">• estoque</span>}
        </span>
        <span className="text-xs adm-muted">×{it.qtd}</span>
        <span className="hidden w-14 text-right text-xs adm-muted sm:inline">{brl(it.valor)}</span>
        <span className="w-20 text-right text-sm font-semibold adm-ink">{brl(it.valor * it.qtd)}</span>
        <button type="button" onClick={() => abrirEdicao(it)} aria-label={`Editar ${it.descricao}`}>
          <Pencil className="size-4 adm-muted hover:adm-brand" />
        </button>
        <button type="button" disabled={pending} onClick={() => run(() => removerItemOS(it.id, os.id))} aria-label="Remover">
          <Trash2 className="size-4 text-rose-400" />
        </button>
      </div>
    );
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
            <button type="button" disabled={pending || os.itens.length === 0} onClick={() => run(() => enviarParaAprovacao(os.id))} className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40">
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
              <button type="button" disabled={pending} onClick={() => run(() => mudarStatus(os.id, "Em execução"))} className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b5fe0]">
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
            <button type="button" onClick={() => setShowEntrega((v) => !v)} className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b5fe0]">
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
      {editandoOS ? (
        <div className="adm-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="adm-display font-bold adm-ink">Editar dados da OS</h3>
              <p className="text-xs adm-muted">
                Trocar cliente ou veículo também corrige o nome e a placa que saem no PDF.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setEditandoOS(false)}
              className="rounded-lg border border-[var(--ad-line)] px-3.5 py-2 text-sm font-semibold adm-muted"
            >
              Cancelar
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="os-cliente">Cliente</label>
              <select
                id="os-cliente"
                className={inputCls}
                value={fichaOS.clienteId}
                onChange={(e) => setFichaOS((f) => ({ ...f, clienteId: e.target.value }))}
              >
                <option value="">Sem cliente vinculado</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="os-veiculo">Veículo</label>
              <select
                id="os-veiculo"
                className={inputCls}
                value={fichaOS.veiculoId}
                onChange={(e) => setFichaOS((f) => ({ ...f, veiculoId: e.target.value }))}
              >
                <option value="">Sem veículo vinculado</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.modelo} · {v.placa}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="os-data">Data de entrada</label>
              <input
                id="os-data"
                className={inputCls}
                value={fichaOS.data}
                onChange={(e) => setFichaOS((f) => ({ ...f, data: e.target.value }))}
                placeholder="Ex.: 11/08/2026"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="os-km">Km de entrada</label>
              <input
                id="os-km"
                type="number"
                min={0}
                className={inputCls}
                value={fichaOS.km}
                onChange={(e) => setFichaOS((f) => ({ ...f, km: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="os-comb">Combustível na entrada</label>
              <select
                id="os-comb"
                className={inputCls}
                value={fichaOS.fuelLevel}
                onChange={(e) => setFichaOS((f) => ({ ...f, fuelLevel: e.target.value }))}
              >
                <option value="">Não informado</option>
                {["Reserva", "1/4", "1/2", "3/4", "Cheio"].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="os-defeito">Defeito relatado</label>
              <textarea
                id="os-defeito"
                rows={2}
                className={`${inputCls} resize-none`}
                value={fichaOS.defeito}
                onChange={(e) => setFichaOS((f) => ({ ...f, defeito: e.target.value }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="os-obs">Observações</label>
              <textarea
                id="os-obs"
                rows={2}
                className={`${inputCls} resize-none`}
                value={fichaOS.observacoes}
                onChange={(e) => setFichaOS((f) => ({ ...f, observacoes: e.target.value }))}
              />
            </div>
          </div>

          {erroOS && <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erroOS}</p>}

          <button
            type="button"
            onClick={salvarOS}
            disabled={pending}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
          >
            <Check className="size-4" />
            {pending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="adm-card p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="adm-display font-bold adm-ink">Dados da OS</h3>
              <button
                type="button"
                onClick={() => setEditandoOS(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-3 py-1.5 text-xs font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
              >
                <Pencil className="size-3.5" />
                Editar
              </button>
            </div>
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
      )}

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

      {/* Itens / orçamento — lista única na ordem que sai no PDF (setas para
          reordenar), com uma linha de adição para peça e outra para serviço. */}
      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display font-bold adm-ink">Peças e serviços (orçamento)</h3>
          <p className="mt-0.5 text-xs adm-muted">
            A ordem abaixo é a que sai no PDF — use as setas para deixar cada serviço embaixo da peça dele.
          </p>
        </div>

        <div className="divide-y divide-[var(--ad-line)]">
          {os.itens.length === 0 && (
            <p className="px-5 py-3 text-sm adm-muted">Nenhum item lançado.</p>
          )}
          {os.itens.map((it, i) => linhaItem(it, i, os.itens.length))}
        </div>

        {/* ── Nova peça ── */}
        <div className="border-t border-[var(--ad-line)] bg-[var(--ad-surface-2)]/50 p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_3.5rem_5.5rem_auto]">
            <input value={draftPeca.descricao} onChange={(e) => setDraftPeca((d) => ({ ...d, descricao: e.target.value, productId: "" }))} placeholder="Nova peça — descrição" className={inputCls} />
            <input type="number" min={1} value={draftPeca.qtd} onChange={(e) => setDraftPeca((d) => ({ ...d, qtd: Math.max(1, Number(e.target.value)) }))} className={inputCls} aria-label="Quantidade da peça" />
            <input type="number" min={0} value={draftPeca.valor || ""} onChange={(e) => setDraftPeca((d) => ({ ...d, valor: Number(e.target.value) }))} placeholder="R$ unit." className={inputCls} aria-label="Valor unitário da peça" />
            <button type="button" onClick={addPeca} disabled={pending || !draftPeca.descricao.trim() || draftPeca.valor <= 0} className="flex items-center justify-center gap-1 rounded-lg bg-[var(--ad-brand)] px-3 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40">
              <Plus className="size-4" />
              Peça
            </button>
          </div>
          {estoque.length > 0 && (
            <select
              value={draftPeca.productId}
              onChange={(e) => {
                const p = estoque.find((x) => x.id === e.target.value);
                setDraftPeca((d) => ({ ...d, productId: e.target.value, descricao: p ? p.produto : d.descricao }));
              }}
              className={`${inputCls} mt-2`}
              aria-label="Vincular peça do estoque"
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

        {/* ── Novo serviço ── */}
        <div className="border-t border-[var(--ad-line)] bg-[var(--ad-surface-2)]/50 p-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_3.5rem_5.5rem_auto]">
            <input value={draftServ.descricao} onChange={(e) => setDraftServ((d) => ({ ...d, descricao: e.target.value }))} placeholder="Novo serviço — descrição da mão de obra" className={inputCls} />
            <input type="number" min={1} value={draftServ.qtd} onChange={(e) => setDraftServ((d) => ({ ...d, qtd: Math.max(1, Number(e.target.value)) }))} className={inputCls} aria-label="Quantidade do serviço" />
            <input type="number" min={0} value={draftServ.valor || ""} onChange={(e) => setDraftServ((d) => ({ ...d, valor: Number(e.target.value) }))} placeholder="R$ unit." className={inputCls} aria-label="Valor unitário do serviço" />
            <button type="button" onClick={addServ} disabled={pending || !draftServ.descricao.trim() || draftServ.valor <= 0} className="flex items-center justify-center gap-1 rounded-lg bg-[var(--ad-brand)] px-3 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40">
              <Plus className="size-4" />
              Serviço
            </button>
          </div>
        </div>

        <div className="space-y-1 border-t border-[var(--ad-line)] px-5 py-3.5">
          <div className="flex items-center justify-between text-xs adm-muted">
            <span>Peças</span>
            <span>{brl(os.itens.filter((i) => i.tipo === "Peça").reduce((t, i) => t + i.valor * i.qtd, 0))}</span>
          </div>
          <div className="flex items-center justify-between text-xs adm-muted">
            <span>Serviços (mão de obra)</span>
            <span>{brl(totalServicos)}</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm adm-muted">Total da OS</span>
            <span className="adm-display text-xl font-bold adm-ink">{brl(os.total)}</span>
          </div>
        </div>
      </div>

      {/* NFS-e da mão de obra */}
      <div className="adm-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display flex items-center gap-2 font-bold adm-ink">
            <FileDown className="size-5 adm-brand" />
            Nota fiscal (NFS-e)
          </h3>
          {fiscalAmbiente !== "producao" && (
            <span className="osb osb-aguardando">Ambiente de testes — a nota não vale</span>
          )}
        </div>

        <div className="space-y-3 p-5">
          <p className="text-sm adm-muted">
            Emite a NFS-e da <strong className="adm-ink">mão de obra</strong> desta OS
            {totalServicos > 0 && (
              <>
                {" "}
                (<strong className="adm-ink">{brl(totalServicos)}</strong> em itens do tipo Serviço)
              </>
            )}
            . Peças ficam de fora por lei — elas são ICMS, não ISS.
          </p>

          {notas.length > 0 && (
            <div className="divide-y divide-[var(--ad-line)] rounded-lg border border-[var(--ad-line)]">
              {notas.map((n) => (
                <div key={n.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5">
                  <span
                    className={
                      n.status === "autorizada"
                        ? "osb osb-finalizada"
                        : n.status === "cancelada"
                          ? "osb osb-aguardando"
                          : "osb osb-aguardando"
                    }
                  >
                    {n.status}
                  </span>
                  <span className="text-xs adm-muted">
                    DPS {n.serie}/{n.numero} · {n.criadaEm}
                    {n.ambiente !== "producao" && " · teste"}
                  </span>
                  <span className="text-sm font-semibold adm-ink">{brl(n.valor)}</span>
                  {n.chaveAcesso && (
                    <span className="w-full truncate font-mono text-[11px] adm-muted" title={n.chaveAcesso}>
                      chave: {n.chaveAcesso}
                    </span>
                  )}
                  {n.chaveAcesso && (
                    <span className="flex items-center gap-3">
                      <a
                        href={`/oficina/ordens/${encodeURIComponent(os.id)}/nfse/${n.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold adm-brand hover:underline"
                      >
                        Ver PDF
                      </a>
                      <a
                        href={`/oficina/ordens/${encodeURIComponent(os.id)}/nfse/${n.id}`}
                        className="text-xs font-semibold adm-muted hover:adm-brand hover:underline"
                      >
                        Baixar XML
                      </a>
                    </span>
                  )}
                  {n.erro && <span className="w-full text-xs text-rose-300">{n.erro}</span>}
                </div>
              ))}
            </div>
          )}

          {erroNota && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erroNota}</p>}
          {notaOk && (
            <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              Nota autorizada! Chave: <span className="font-mono text-xs">{notaOk}</span>
            </p>
          )}

          {fiscalPronto ? (
            <button
              type="button"
              onClick={emitirNota}
              disabled={pending || totalServicos <= 0}
              className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
            >
              <FileDown className="size-4" />
              {pending ? "Emitindo…" : "Emitir NFS-e da mão de obra"}
            </button>
          ) : (
            <p className="text-sm adm-muted">
              Para emitir, configure o certificado e o CNPJ em{" "}
              <Link href="/oficina/fiscal" className="font-semibold adm-brand hover:underline">
                Sistema → Nota fiscal
              </Link>
              .
            </p>
          )}
          {fiscalPronto && totalServicos <= 0 && (
            <p className="text-xs adm-muted">
              Esta OS ainda não tem item do tipo <strong>Serviço</strong> — adicione a mão de obra acima.
            </p>
          )}
        </div>
      </div>

      {os.observacoes && (
        <div className="adm-card p-5">
          <p className="text-xs uppercase tracking-wide adm-muted">Observações</p>
          <p className="mt-1.5 text-sm adm-ink">{os.observacoes}</p>
        </div>
      )}

      {os.fotos.length > 0 && (
        <div className="adm-card p-5">
          <p className="text-xs uppercase tracking-wide adm-muted">Fotos do serviço</p>
          <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
            {os.fotos.map((src) => (
              <a
                key={src}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-square overflow-hidden rounded-lg border border-[var(--ad-line)]"
              >
                <Image src={src} alt="Foto da OS" fill sizes="120px" className="object-cover" unoptimized />
              </a>
            ))}
          </div>
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

      {/* Excluir OS */}
      <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
        <h3 className="adm-display mb-1 flex items-center gap-2 font-bold adm-ink">
          <AlertTriangle className="size-4 text-red-400" />
          Excluir ordem de serviço
        </h3>
        <p className="mb-4 text-sm adm-muted">
          Apaga a <span className="font-semibold adm-ink">{os.id}</span>
          {os.itens.length > 0 && (
            <> e {os.itens.length === 1 ? "o item lançado" : `os ${os.itens.length} itens lançados`}</>
          )}
          . Não dá pra desfazer.
          {os.financeApplied && (
            <> A receita lançada no Financeiro por esta OS <strong className="adm-ink">também sai</strong>.</>
          )}
          {os.stockApplied && (
            <>
              {" "}As peças já baixadas <strong className="adm-ink">não voltam</strong> ao estoque — se foi engano,
              dê entrada manual em Estoque.
            </>
          )}
        </p>
        {confirmarExclusao ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={apagarOS}
              disabled={pending}
              className="rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50"
            >
              {pending ? "Excluindo…" : "Confirmar exclusão"}
            </button>
            <button
              type="button"
              onClick={() => setConfirmarExclusao(false)}
              className="rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted"
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmarExclusao(true)}
            className="flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="size-4" />
            Excluir OS
          </button>
        )}
        {erroOS && !editandoOS && (
          <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erroOS}</p>
        )}
      </div>
    </div>
  );
}
