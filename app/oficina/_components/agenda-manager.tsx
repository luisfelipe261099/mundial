"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Check, Plus, X } from "lucide-react";
import type { AgendaItem } from "@/lib/admin-data";
import { criarAgendamento } from "../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function fmtData(d: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return `${m[3]}/${MESES[Number(m[2]) - 1]}`;
}

const vazio = { cliente: "", veiculo: "", servico: "", data: "", hora: "", status: "Confirmado" };

export function AgendaManager({ seed }: { seed: AgendaItem[] }) {
  const [itens, setItens] = useState<AgendaItem[]>(seed);
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState(vazio);
  const [, startTransition] = useTransition();

  const podeSalvar = novo.servico.trim() && novo.data && novo.hora;

  function add() {
    if (!podeSalvar) return;
    const payload = { ...novo };
    setItens((x) => [
      {
        id: `a${Date.now()}`,
        data: novo.data,
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
    startTransition(() => criarAgendamento(payload));
  }

  return (
    <div data-tour="adm-agenda" className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm adm-muted">{itens.length} agendamento(s)</p>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="adm-btn-primary px-4 py-2.5 text-sm"
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
            className="adm-btn-primary mt-3 px-4 py-2 text-sm"
          >
            <Check className="size-4" />
            Agendar
          </button>
        </div>
      )}

      <div className="adm-card divide-y divide-[var(--ad-line)]">
        {itens.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Nenhum agendamento.</p>}
        {itens.map((a) => (
          <div key={a.id} className="flex items-center gap-4 px-5 py-4">
            <div className="w-16 shrink-0 text-center">
              <p className="adm-display text-base font-bold adm-ink">{a.hora}</p>
              <p className="text-[11px] adm-muted">{fmtData(a.data)}</p>
            </div>
            <div className="h-10 w-px shrink-0 bg-[var(--ad-line)]" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold adm-ink">{a.servico}</p>
              <p className="truncate text-xs adm-muted">
                {a.cliente} · {a.veiculo}
              </p>
            </div>
            <span className={a.status === "Confirmado" ? "osb osb-finalizada" : "osb osb-aguardando"}>{a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
