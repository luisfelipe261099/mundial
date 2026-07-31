"use client";

import { useState } from "react";
import { CalendarPlus, Check, X } from "lucide-react";
import { STATUS_AGENDAMENTO } from "@/lib/agendamentos";
import type { AgendaItem } from "@/lib/admin-data";
import { ClientPicker, type ClienteOpt, type VeiculoOpt } from "./client-picker";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

export type AgendaFormValor = {
  clienteId: string | null;
  cliente: string;
  veiculoId: string | null;
  veiculo: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
};

const VAZIO: AgendaFormValor = {
  clienteId: null,
  cliente: "",
  veiculoId: null,
  veiculo: "",
  servico: "",
  data: "",
  hora: "",
  status: "Agendado",
};

export function deItem(a: AgendaItem): AgendaFormValor {
  return {
    clienteId: a.clienteId,
    cliente: a.cliente === "—" ? "" : a.cliente,
    veiculoId: a.veiculoId,
    veiculo: a.veiculo === "—" ? "" : a.veiculo,
    servico: a.servico,
    data: a.data,
    hora: a.hora === "—" ? "" : a.hora,
    status: a.status,
  };
}

export function AgendaForm({
  inicial,
  clientes,
  veiculos,
  onSalvar,
  onCancelar,
  titulo,
}: {
  inicial?: AgendaFormValor;
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
  onSalvar: (v: AgendaFormValor) => void;
  onCancelar: () => void;
  titulo: string;
}) {
  const [v, setV] = useState<AgendaFormValor>(inicial ?? VAZIO);
  // "digitar outro" desliga a lista mesmo com cliente cadastrado escolhido.
  const [veiculoLivre, setVeiculoLivre] = useState(!!inicial && !inicial.veiculoId);

  const doCliente = v.clienteId ? veiculos.filter((x) => x.clienteId === v.clienteId) : [];
  const usaLista = doCliente.length > 0 && !veiculoLivre;
  const podeSalvar = v.servico.trim() !== "" && v.data !== "" && v.hora !== "";

  return (
    <div className="adm-card p-4">
      <h3 className="adm-display mb-3 flex items-center gap-2 text-sm font-bold adm-ink">
        <CalendarPlus className="size-4 adm-brand" />
        {titulo}
      </h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Data</label>
          <input
            type="date"
            className={inputCls}
            value={v.data}
            onChange={(e) => setV((x) => ({ ...x, data: e.target.value }))}
            aria-label="Data"
          />
        </div>
        <div>
          <label className={labelCls}>Hora</label>
          <input
            type="time"
            className={inputCls}
            value={v.hora}
            onChange={(e) => setV((x) => ({ ...x, hora: e.target.value }))}
            aria-label="Hora"
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={v.status}
            onChange={(e) => setV((x) => ({ ...x, status: e.target.value }))}
            aria-label="Status"
          >
            {STATUS_AGENDAMENTO.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Cliente</label>
          <ClientPicker
            value={{ id: v.clienteId, texto: v.cliente }}
            onChange={(nv) =>
              setV((x) => ({
                ...x,
                clienteId: nv.id,
                cliente: nv.texto,
                // trocar de cliente invalida o veículo escolhido antes
                veiculoId: null,
                veiculo: "",
              }))
            }
            clientes={clientes}
            veiculos={veiculos}
          />
        </div>

        <div>
          <label className={labelCls}>Veículo</label>
          {usaLista ? (
            <select
              className={inputCls}
              value={v.veiculoId ?? ""}
              onChange={(e) => {
                if (e.target.value === "__livre") {
                  setVeiculoLivre(true);
                  setV((x) => ({ ...x, veiculoId: null, veiculo: "" }));
                  return;
                }
                const veic = doCliente.find((c) => c.id === e.target.value);
                setV((x) => ({
                  ...x,
                  veiculoId: veic?.id ?? null,
                  veiculo: veic ? `${veic.modelo} · ${veic.placa}` : "",
                }));
              }}
              aria-label="Veículo"
            >
              <option value="">Selecione…</option>
              {doCliente.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.modelo} · {c.placa}
                </option>
              ))}
              <option value="__livre">✎ digitar outro</option>
            </select>
          ) : (
            <input
              className={inputCls}
              placeholder="Veículo / placa"
              value={v.veiculo}
              onChange={(e) => setV((x) => ({ ...x, veiculoId: null, veiculo: e.target.value }))}
              aria-label="Veículo"
            />
          )}
        </div>

        <div className="sm:col-span-3">
          <label className={labelCls}>Serviço</label>
          <input
            className={inputCls}
            placeholder="Revisão, troca de óleo, diagnóstico…"
            value={v.servico}
            onChange={(e) => setV((x) => ({ ...x, servico: e.target.value }))}
            aria-label="Serviço"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSalvar(v)}
          disabled={!podeSalvar}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
        >
          <Check className="size-4" />
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-4 py-2 text-sm font-semibold adm-muted"
        >
          <X className="size-4" />
          Cancelar
        </button>
        {!podeSalvar && (
          <span className="text-xs adm-muted">Serviço, data e hora são obrigatórios.</span>
        )}
      </div>
    </div>
  );
}
