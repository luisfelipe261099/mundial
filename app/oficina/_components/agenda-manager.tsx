"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Check, Plus, X, Trash2, RotateCcw, CalendarClock } from "lucide-react";
import type { AgendaItem } from "@/lib/admin-data";
import { criarAgendamento, atualizarStatusAgendamento, excluirAgendamento } from "../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

const CONCLUIDO = "Concluído";
const CANCELADO = "Cancelado";
// Status que tiram o compromisso da fila de "próximos", venha de onde vier
// (o app do cliente grava "Agendado", o seed antigo gravava "Finalizado").
const ENCERRADOS = [CONCLUIDO, "Concluido", "Finalizado", CANCELADO];
const encerrado = (s: string) => ENCERRADOS.includes(s);

function badgeClass(status: string) {
  if (status === CANCELADO) return "osb osb-aguardando line-through";
  if (encerrado(status)) return "osb osb-finalizada";
  if (status === "Confirmado") return "osb osb-execucao";
  return "osb osb-aguardando";
}

// "2026-08-12" → "qua, 12/ago". Meio-dia local evita o pulo de fuso.
function rotuloDia(iso: string, hoje: string) {
  if (!iso) return "Sem data definida";
  const d = new Date(`${iso}T12:00:00`);
  const fmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).format(d);
  const amanha = new Date(`${hoje}T12:00:00`);
  amanha.setDate(amanha.getDate() + 1);
  const amanhaISO = amanha.toISOString().slice(0, 10);
  if (iso === hoje) return `Hoje · ${fmt}`;
  if (iso === amanhaISO) return `Amanhã · ${fmt}`;
  return fmt;
}

function diaCurto(iso: string, data: string) {
  if (!iso) return data || "—";
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(d);
}

type Aba = "proximos" | "hoje" | "anteriores" | "todos";

const vazio = { cliente: "", veiculo: "", servico: "", data: "", hora: "", status: "Confirmado" };

export function AgendaManager({ seed, hoje }: { seed: AgendaItem[]; hoje: string }) {
  const [itens, setItens] = useState<AgendaItem[]>(seed);
  const [aba, setAba] = useState<Aba>("proximos");
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState(vazio);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const podeSalvar = novo.servico.trim() !== "" && novo.data !== "" && novo.hora !== "";

  // Passou = dia anterior a hoje, ou já encerrado (concluído/cancelado).
  const passou = (a: AgendaItem) => encerrado(a.status) || (a.iso !== "" && a.iso < hoje);
  const proximos = itens.filter((a) => !passou(a));
  const deHoje = itens.filter((a) => a.iso === hoje && !encerrado(a.status));
  const anteriores = itens.filter(passou);

  const lista =
    aba === "proximos" ? proximos : aba === "hoje" ? deHoje : aba === "anteriores" ? anteriores : itens;

  // Agrupa por dia mantendo a ordem cronológica que veio do servidor.
  const grupos: { iso: string; itens: AgendaItem[] }[] = [];
  for (const a of aba === "anteriores" ? [...lista].reverse() : lista) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.iso === a.iso) ultimo.itens.push(a);
    else grupos.push({ iso: a.iso, itens: [a] });
  }

  function add() {
    if (!podeSalvar) return;
    const payload = { ...novo };
    setItens((x) => [
      {
        id: `a${Date.now()}`,
        data: novo.data,
        iso: novo.data,
        hora: novo.hora,
        cliente: novo.cliente.trim() || "—",
        veiculo: novo.veiculo.trim() || "—",
        servico: novo.servico.trim(),
        status: novo.status,
      },
      ...x,
    ]);
    setNovo(vazio);
    setShowForm(false);
    setAba("proximos");
    startTransition(() => criarAgendamento(payload));
  }

  function mudarStatus(id: string, status: string) {
    setItens((x) => x.map((a) => (a.id === id ? { ...a, status } : a)));
    startTransition(() => atualizarStatusAgendamento(id, status));
  }

  function excluir(id: string) {
    setItens((x) => x.filter((a) => a.id !== id));
    setConfirmDel(null);
    startTransition(() => excluirAgendamento(id));
  }

  const abas: { key: Aba; label: string; n: number }[] = [
    { key: "proximos", label: "Próximos", n: proximos.length },
    { key: "hoje", label: "Hoje", n: deHoje.length },
    { key: "anteriores", label: "Já passaram", n: anteriores.length },
    { key: "todos", label: "Todos", n: itens.length },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {abas.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setAba(t.key)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                aba === t.key
                  ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
                  : "border-[var(--ad-line)] adm-muted hover:adm-ink"
              }`}
            >
              {t.label}
              <span className={aba === t.key ? "text-white/70" : "text-[var(--ad-muted)]"}>{t.n}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
        >
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancelar" : "Novo agendamento"}
        </button>
      </div>

      {showForm && (
        <div className="adm-card p-4">
          <h3 className="adm-display mb-3 flex items-center gap-2 text-sm font-bold adm-ink">
            <CalendarPlus className="size-4 adm-brand" />
            Novo agendamento
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <input type="date" className={inputCls} value={novo.data} onChange={(e) => setNovo((n) => ({ ...n, data: e.target.value }))} aria-label="Data" />
            <input type="time" className={inputCls} value={novo.hora} onChange={(e) => setNovo((n) => ({ ...n, hora: e.target.value }))} aria-label="Hora" />
            <select className={inputCls} value={novo.status} onChange={(e) => setNovo((n) => ({ ...n, status: e.target.value }))} aria-label="Status">
              <option value="Confirmado">Confirmado</option>
              <option value="Aguardando">Aguardando</option>
            </select>
            <input className={inputCls} placeholder="Cliente" value={novo.cliente} onChange={(e) => setNovo((n) => ({ ...n, cliente: e.target.value }))} />
            <input className={inputCls} placeholder="Veículo / placa" value={novo.veiculo} onChange={(e) => setNovo((n) => ({ ...n, veiculo: e.target.value }))} />
            <input className={inputCls} placeholder="Serviço" value={novo.servico} onChange={(e) => setNovo((n) => ({ ...n, servico: e.target.value }))} />
          </div>
          <button
            type="button"
            onClick={add}
            disabled={!podeSalvar}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
          >
            <Check className="size-4" />
            Agendar
          </button>
        </div>
      )}

      {lista.length === 0 && (
        <p className="adm-card px-5 py-8 text-center text-sm adm-muted">
          {aba === "proximos"
            ? "Nenhum agendamento à frente. Os que já passaram estão na aba “Já passaram”."
            : aba === "hoje"
              ? "Nada marcado para hoje."
              : aba === "anteriores"
                ? "Nenhum agendamento antigo por aqui."
                : "Nenhum agendamento."}
        </p>
      )}

      {grupos.map((g) => {
        const diaPassado = g.iso !== "" && g.iso < hoje;
        return (
          <section key={g.iso || "sem-data"} className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <CalendarClock className={`size-4 ${diaPassado ? "adm-muted" : "adm-brand"}`} />
              <h3 className={`adm-display text-sm font-bold ${diaPassado ? "adm-muted" : "adm-ink"}`}>
                {rotuloDia(g.iso, hoje)}
              </h3>
              <span className="text-xs adm-muted">
                {g.itens.length} {g.itens.length === 1 ? "compromisso" : "compromissos"}
              </span>
            </div>

            <div className="adm-card divide-y divide-[var(--ad-line)]">
              {g.itens.map((a) => {
                const fechado = encerrado(a.status);
                const antigo = diaPassado || fechado;
                return (
                  <div key={a.id} className={`px-5 py-3.5 ${antigo ? "opacity-60" : ""}`}>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <div className="w-14 shrink-0 text-center">
                        <p className="adm-display text-base font-bold adm-ink">{a.hora || "—"}</p>
                        <p className="text-[11px] adm-muted">{diaCurto(a.iso, a.data)}</p>
                      </div>
                      <div className="h-10 w-px shrink-0 bg-[var(--ad-line)]" />
                      <div className="min-w-0 flex-1">
                        <p className={`truncate font-semibold adm-ink ${a.status === CANCELADO ? "line-through" : ""}`}>
                          {a.servico}
                        </p>
                        <p className="truncate text-xs adm-muted">
                          {a.cliente} · {a.veiculo}
                        </p>
                      </div>

                      <span className={badgeClass(a.status)}>{a.status}</span>

                      <div className="flex items-center gap-1.5">
                        {fechado ? (
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => mudarStatus(a.id, "Confirmado")}
                            title="Reabrir"
                            aria-label={`Reabrir ${a.servico}`}
                            className="grid size-8 place-items-center rounded-lg border border-[var(--ad-line)] adm-muted hover:adm-ink"
                          >
                            <RotateCcw className="size-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => mudarStatus(a.id, CONCLUIDO)}
                              title="Marcar como concluído"
                              aria-label={`Concluir ${a.servico}`}
                              className="grid size-8 place-items-center rounded-lg border border-[var(--ad-line)] adm-ink hover:border-emerald-500/50 hover:text-emerald-400"
                            >
                              <Check className="size-4" />
                            </button>
                            <button
                              type="button"
                              disabled={pending}
                              onClick={() => mudarStatus(a.id, CANCELADO)}
                              title="Cancelar"
                              aria-label={`Cancelar ${a.servico}`}
                              className="grid size-8 place-items-center rounded-lg border border-[var(--ad-line)] adm-muted hover:adm-ink"
                            >
                              <X className="size-4" />
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => setConfirmDel(confirmDel === a.id ? null : a.id)}
                          title="Excluir"
                          aria-label={`Excluir ${a.servico}`}
                          className="grid size-8 place-items-center rounded-lg border border-[var(--ad-line)] adm-muted hover:border-red-500/50 hover:text-red-400"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    {confirmDel === a.id && (
                      <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-red-500/5 px-3 py-2">
                        <p className="text-sm adm-ink">
                          Excluir este agendamento de vez?
                          <span className="adm-muted"> Concluir só tira ele dos próximos e mantém o registro.</span>
                        </p>
                        <button
                          type="button"
                          onClick={() => excluir(a.id)}
                          className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-500"
                        >
                          Excluir
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDel(null)}
                          className="rounded-lg border border-[var(--ad-line)] px-3 py-1.5 text-xs font-semibold adm-muted"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
