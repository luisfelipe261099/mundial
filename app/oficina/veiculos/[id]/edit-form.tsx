"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil } from "lucide-react";
import { editarVeiculo } from "../../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

const COMBUSTIVEIS = ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"];

export type FichaVeiculo = {
  modelo: string;
  placa: string;
  motor: string;
  ano: number;
  km: number;
  cor: string;
  combustivel: string;
  clienteId: string;
};

// Edição da ficha do veículo. Fica fechada por padrão para a página continuar
// sendo de consulta; abre no "Editar" e salva tudo de uma vez.
export function VehicleEditForm({
  id,
  ficha,
  clientes,
}: {
  id: string;
  ficha: FichaVeiculo;
  clientes: { id: string; nome: string }[];
}) {
  const [aberto, setAberto] = useState(false);
  const [v, setV] = useState({
    modelo: ficha.modelo,
    placa: ficha.placa,
    motor: ficha.motor,
    ano: String(ficha.ano),
    km: String(ficha.km),
    cor: ficha.cor,
    combustivel: ficha.combustivel,
    clienteId: ficha.clienteId,
  });
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  const set = (k: keyof typeof v, valor: string) => setV((x) => ({ ...x, [k]: valor }));

  function salvar() {
    setErro(null);
    setSalvo(false);
    start(async () => {
      const r = await editarVeiculo(id, v);
      if (r.error) {
        setErro(r.error);
      } else {
        setSalvo(true);
        setAberto(false);
        router.refresh();
      }
    });
  }

  return (
    <div className="adm-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="adm-display font-bold adm-ink">Dados do veículo</h3>
          <p className="text-xs adm-muted">Modelo, placa, motor, ano, km, cor e proprietário.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setErro(null);
            setSalvo(false);
            setAberto((a) => !a);
          }}
          className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-3.5 py-2 text-sm font-semibold adm-ink transition-colors hover:bg-[var(--ad-surface-2)]"
        >
          <Pencil className="size-4" />
          {aberto ? "Cancelar" : "Editar"}
        </button>
      </div>

      {salvo && !aberto && (
        <p className="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Dados do veículo atualizados.
        </p>
      )}

      {aberto && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="ve-modelo">
                Modelo (marca + modelo) <span className="text-rose-400">*</span>
              </label>
              <input
                id="ve-modelo"
                className={inputCls}
                value={v.modelo}
                onChange={(e) => set("modelo", e.target.value)}
                placeholder="Ex.: VW Golf 1.4 TSI"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ve-placa">
                Placa <span className="text-rose-400">*</span>
              </label>
              <input
                id="ve-placa"
                className={inputCls}
                value={v.placa}
                onChange={(e) => set("placa", e.target.value.toUpperCase())}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ve-motor">
                Motor
              </label>
              <input
                id="ve-motor"
                className={inputCls}
                value={v.motor}
                onChange={(e) => set("motor", e.target.value)}
                placeholder="Ex.: 1.0 Flex, 2.0 Turbo"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ve-ano">
                Ano
              </label>
              <input
                id="ve-ano"
                type="number"
                className={inputCls}
                value={v.ano}
                onChange={(e) => set("ano", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ve-km">
                Quilometragem
              </label>
              <input
                id="ve-km"
                type="number"
                min={0}
                className={inputCls}
                value={v.km}
                onChange={(e) => set("km", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ve-cor">
                Cor
              </label>
              <input
                id="ve-cor"
                className={inputCls}
                value={v.cor}
                onChange={(e) => set("cor", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="ve-combustivel">
                Combustível
              </label>
              <select
                id="ve-combustivel"
                className={inputCls}
                value={v.combustivel}
                onChange={(e) => set("combustivel", e.target.value)}
              >
                <option value="">Não informado</option>
                {COMBUSTIVEIS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="ve-dono">
                Proprietário
              </label>
              <select
                id="ve-dono"
                className={inputCls}
                value={v.clienteId}
                onChange={(e) => set("clienteId", e.target.value)}
              >
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs adm-muted">
                Trocar aqui transfere o veículo para outro cliente — o histórico de OS vai junto.
              </p>
            </div>
          </div>

          {erro && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}

          <button
            type="button"
            onClick={salvar}
            disabled={pending}
            className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-5 py-2.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
          >
            <Check className="size-4" />
            {pending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      )}
    </div>
  );
}
