"use client";

import { Combobox, type ComboValue } from "./combobox";

export type ClienteOpt = { id: string; nome: string };
export type VeiculoOpt = {
  id: string;
  clienteId: string | null;
  proprietario: string;
  modelo: string;
  placa: string;
};

/**
 * Escolhe um cliente cadastrado OU aceita um nome avulso, no mesmo campo.
 * `value.id` preenchido = cadastrado; nulo com texto = avulso.
 */
export function ClientPicker({
  value,
  onChange,
  clientes,
  veiculos,
}: {
  value: ComboValue;
  onChange: (v: ComboValue) => void;
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
}) {
  const options = clientes.map((c) => ({ id: c.id, label: c.nome }));
  const nVeiculos = value.id ? veiculos.filter((v) => v.clienteId === value.id).length : 0;

  return (
    <div>
      <Combobox
        value={value}
        onChange={onChange}
        options={options}
        ariaLabel="Cliente"
        placeholder="Buscar cliente ou digitar nome avulso…"
      />
      <p className="mt-1 text-xs">
        {value.id ? (
          <span className="text-emerald-400">● cliente cadastrado · {nVeiculos} veículo(s)</span>
        ) : value.texto.trim() ? (
          <span className="adm-muted">○ avulso — não vai aparecer no app dele</span>
        ) : (
          <span className="adm-muted">Busque um cliente cadastrado ou digite um nome avulso.</span>
        )}
      </p>
    </div>
  );
}
