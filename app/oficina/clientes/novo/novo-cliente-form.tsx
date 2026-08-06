"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check, Car, Plus, X } from "lucide-react";
import { criarCliente } from "../../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";

type Campo = { name: string; label: string; type?: "text" | "number" | "select"; options?: string[]; full?: boolean; required?: boolean };

const CLIENTE: Campo[] = [
  { name: "nome", label: "Nome completo", full: true, required: true },
  { name: "cpf", label: "CPF", required: true },
  { name: "telefone", label: "Telefone", required: true },
  { name: "whatsapp", label: "WhatsApp" },
  { name: "email", label: "E-mail", full: true },
  { name: "cidade", label: "Cidade" },
  { name: "endereco", label: "Endereço", full: true },
];

const VEICULO: Campo[] = [
  { name: "veiculoModelo", label: "Modelo (marca + modelo)", full: true, required: true },
  { name: "veiculoPlaca", label: "Placa", required: true },
  { name: "veiculoAno", label: "Ano", type: "number" },
  { name: "veiculoKm", label: "Quilometragem", type: "number" },
  { name: "veiculoCombustivel", label: "Combustível", type: "select", options: ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"] },
  { name: "veiculoCor", label: "Cor" },
];

// Cadastro de cliente com um bloco opcional de veículo: o admin abre o bloco
// quando já tem o carro em mãos, e o cliente nasce com veículo (sem isso ele
// não consegue logar no app, que entra pela placa).
export function NovoClienteForm() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [comVeiculo, setComVeiculo] = useState(false);
  const [criado, setCriado] = useState<Record<string, string> | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (name: string, v: string) => setValues((x) => ({ ...x, [name]: v }));
  const preenchido = (c: Campo) => (values[c.name] ?? "").trim() !== "";
  const pode =
    CLIENTE.filter((c) => c.required).every(preenchido) &&
    (!comVeiculo || VEICULO.filter((c) => c.required).every(preenchido));

  function salvar() {
    setErro(null);
    // Sem o bloco aberto, os campos do veículo não vão pro servidor — mesmo que
    // o admin tenha digitado algo antes de fechar.
    const payload = comVeiculo
      ? values
      : Object.fromEntries(Object.entries(values).filter(([k]) => !k.startsWith("veiculo")));
    startTransition(async () => {
      const r = await criarCliente(payload);
      if (r?.error) setErro(r.error);
      else setCriado(payload);
    });
  }

  function novoCadastro() {
    setValues({});
    setComVeiculo(false);
    setCriado(null);
  }

  if (criado) {
    const resumo = [...CLIENTE, ...VEICULO].filter((c) => (criado[c.name] ?? "").trim() !== "");
    return (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-8 text-emerald-400" />
        </span>
        <h2 className="adm-display mt-4 text-2xl font-bold adm-ink">
          {criado.veiculoPlaca ? "Cliente e veículo cadastrados!" : "Cliente cadastrado!"}
        </h2>
        <div className="adm-card mt-5 space-y-2 p-5 text-left text-sm">
          {resumo.map((c) => (
            <div key={c.name} className="flex justify-between gap-3">
              <span className="adm-muted">{c.label}</span>
              <span className="truncate text-right adm-ink">{criado[c.name]}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <Link href="/oficina/clientes" className="rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b5fe0]">
            Clientes
          </Link>
          <button
            type="button"
            onClick={novoCadastro}
            className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            Cadastrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/oficina/clientes" className="text-sm font-semibold adm-muted hover:adm-brand">
        ← Clientes
      </Link>

      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">Cadastrar cliente</h2>
        <Campos campos={CLIENTE} values={values} set={set} />
      </div>

      <div className="adm-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="adm-display flex items-center gap-2 font-bold adm-ink">
              <Car className="size-4 adm-brand" />
              Veículo <span className="text-xs font-medium adm-muted">(opcional)</span>
            </h2>
            <p className="text-xs adm-muted">Já cadastre o carro aqui — dá pra adicionar depois também.</p>
          </div>
          <button
            type="button"
            onClick={() => setComVeiculo((v) => !v)}
            className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-3.5 py-2 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            {comVeiculo ? <X className="size-4" /> : <Plus className="size-4" />}
            {comVeiculo ? "Remover veículo" : "Adicionar veículo"}
          </button>
        </div>
        {comVeiculo && (
          <div className="mt-4">
            <Campos campos={VEICULO} values={values} set={set} />
          </div>
        )}
      </div>

      {erro && <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}

      <button
        type="button"
        disabled={!pode || pending}
        onClick={salvar}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] py-3.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
      >
        <Check className="size-5" />
        {pending ? "Salvando…" : comVeiculo ? "Cadastrar cliente e veículo" : "Cadastrar cliente"}
      </button>
    </div>
  );
}

function Campos({
  campos,
  values,
  set,
}: {
  campos: Campo[];
  values: Record<string, string>;
  set: (name: string, v: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {campos.map((c) => (
        <div key={c.name} className={c.full ? "sm:col-span-2" : ""}>
          <label className="mb-1 block text-xs font-medium adm-muted" htmlFor={c.name}>
            {c.label}
            {c.required && <span className="text-rose-400"> *</span>}
          </label>
          {c.type === "select" ? (
            <select id={c.name} className={inputCls} value={values[c.name] ?? ""} onChange={(e) => set(c.name, e.target.value)}>
              <option value="">Selecione…</option>
              {c.options?.map((o) => (
                <option key={o} value={o}>{o}</option>
              ))}
            </select>
          ) : (
            <input
              id={c.name}
              type={c.type === "number" ? "number" : "text"}
              className={inputCls}
              value={values[c.name] ?? ""}
              onChange={(e) => set(c.name, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}
