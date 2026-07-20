"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, ClipboardList, ClipboardCheck, ArrowRight } from "lucide-react";
import { darEntrada } from "../os-actions";

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

const CHECKLIST_ITENS = [
  "Pneus",
  "Estepe",
  "Freios",
  "Luzes / faróis",
  "Lataria / pintura",
  "Vidros / retrovisores",
  "Interior / bancos",
  "Documentos",
  "Nível de óleo",
  "Palhetas",
  "Bateria",
  "Ar-condicionado",
];

const COMBUSTIVEL = ["Reserva", "1/4", "1/2", "3/4", "Cheio"];

const STATUS: { key: string; label: string; on: string }[] = [
  { key: "ok", label: "OK", on: "bg-emerald-600 text-white" },
  { key: "atencao", label: "Atenção", on: "bg-amber-500 text-white" },
  { key: "avaria", label: "Avaria", on: "bg-rose-600 text-white" },
];

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

export function EntradaForm({
  clientes,
  veiculos,
}: {
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
}) {
  const [clienteId, setClienteId] = useState("");
  const [veiculoId, setVeiculoId] = useState("");
  const [km, setKm] = useState("");
  const [fuel, setFuel] = useState("1/2");
  const [defeito, setDefeito] = useState("");
  const [checklist, setChecklist] = useState<Record<string, string>>(() =>
    Object.fromEntries(CHECKLIST_ITENS.map((i) => [i, "ok"]))
  );
  const [avarias, setAvarias] = useState("");
  const [objetos, setObjetos] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [criada, setCriada] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome ?? "";
  const veiculosDoCliente = clienteId
    ? veiculos.filter((v) => v.proprietario === clienteNome)
    : veiculos;
  const podeCriar = clienteId !== "" && veiculoId !== "" && defeito.trim() !== "" && authorized;
  const alertas = Object.values(checklist).filter((s) => s !== "ok").length;

  function criar() {
    startTransition(async () => {
      const r = await darEntrada({
        clienteId,
        veiculoId,
        km: Number(km) || 0,
        fuelLevel: fuel,
        defeito,
        checklist: CHECKLIST_ITENS.map((i) => ({ item: i, status: checklist[i] })),
        avarias,
        objetos,
        authorized,
      });
      setCriada(r.id);
    });
  }

  if (criada) {
    return (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-8 text-emerald-400" />
        </span>
        <h2 className="adm-display mt-4 text-2xl font-bold adm-ink">Entrada registrada!</h2>
        <p className="mt-1 text-sm adm-muted">
          A OS <span className="font-mono adm-brand">{criada}</span> foi aberta com a vistoria.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href={`/oficina/ordens/${criada}`}
            className="adm-btn-primary px-4 py-2.5 text-sm"
          >
            Abrir OS e orçar
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/oficina/entrada"
            className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            Nova entrada
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div data-tour="adm-entrada" className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="adm-display flex items-center gap-2 text-2xl font-bold adm-ink">
          <ClipboardCheck className="size-6 adm-brand" />
          Dar entrada no veículo
        </h1>
        <p className="mt-1 text-sm adm-muted">Recepção + vistoria de entrada. Isso abre a OS.</p>
      </div>

      {/* Dados */}
      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">Veículo & recepção</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Cliente</label>
            <select
              value={clienteId}
              onChange={(e) => {
                setClienteId(e.target.value);
                setVeiculoId("");
              }}
              className={inputCls}
            >
              <option value="">Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Veículo</label>
            <select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)} className={inputCls}>
              <option value="">Selecione…</option>
              {veiculosDoCliente.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.modelo} · {v.placa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Km de entrada</label>
            <input type="number" value={km} onChange={(e) => setKm(e.target.value)} placeholder="km" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Nível de combustível</label>
            <select value={fuel} onChange={(e) => setFuel(e.target.value)} className={inputCls}>
              {COMBUSTIVEL.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className={labelCls}>Defeito / motivo relatado pelo cliente</label>
          <textarea
            value={defeito}
            onChange={(e) => setDefeito(e.target.value)}
            rows={2}
            placeholder="O que o cliente relatou…"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Vistoria */}
      <div className="adm-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="adm-display flex items-center gap-2 font-bold adm-ink">
            <ClipboardList className="size-5 adm-brand" />
            Vistoria de entrada
          </h2>
          {alertas > 0 && (
            <span className="osb osb-aguardando">{alertas} ponto(s) de atenção</span>
          )}
        </div>

        <div className="divide-y divide-[var(--ad-line)]">
          {CHECKLIST_ITENS.map((item) => (
            <div key={item} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className="text-sm adm-ink">{item}</span>
              <div className="flex gap-1 rounded-lg border border-[var(--ad-line)] p-0.5">
                {STATUS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setChecklist((c) => ({ ...c, [item]: s.key }))}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      checklist[item] === s.key ? s.on : "adm-muted hover:adm-ink"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Avarias / observações</label>
            <textarea
              value={avarias}
              onChange={(e) => setAvarias(e.target.value)}
              rows={2}
              placeholder="Riscos, amassados, itens danificados…"
              className={`${inputCls} resize-none`}
            />
          </div>
          <div>
            <label className={labelCls}>Objetos no veículo</label>
            <textarea
              value={objetos}
              onChange={(e) => setObjetos(e.target.value)}
              rows={2}
              placeholder="Pertences deixados no carro…"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* Autorização */}
      <label className="adm-card flex cursor-pointer items-start gap-3 p-4">
        <input
          type="checkbox"
          checked={authorized}
          onChange={(e) => setAuthorized(e.target.checked)}
          className="mt-0.5 size-5 accent-[var(--ad-brand)]"
        />
        <span className="text-sm adm-ink">
          O cliente <span className="font-semibold">autoriza</span> a inspeção do veículo e o envio do orçamento.
        </span>
      </label>

      <button
        type="button"
        disabled={!podeCriar || pending}
        onClick={criar}
        className="adm-btn-primary w-full py-3.5 text-sm"
      >
        <Check className="size-5" />
        {pending ? "Registrando…" : "Registrar entrada e abrir OS"}
      </button>
      {!podeCriar && (
        <p className="-mt-3 text-center text-xs adm-muted">
          Selecione cliente, veículo, o defeito relatado e marque a autorização.
        </p>
      )}
    </div>
  );
}
