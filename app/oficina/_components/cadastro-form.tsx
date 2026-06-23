"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";

export interface Campo {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  options?: string[];
  full?: boolean;
  required?: boolean;
}

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";

// Formulário de cadastro genérico (Cliente, Veículo…). Estado local; ao
// "criar", mostra um resumo do que seria gravado (persistência vem com o banco).
export function CadastroForm({
  titulo,
  voltarHref,
  voltarLabel,
  campos,
  sucessoTitulo,
  criarLabel,
  onSubmit,
}: {
  titulo: string;
  voltarHref: string;
  voltarLabel: string;
  campos: Campo[];
  sucessoTitulo: string;
  criarLabel: string;
  onSubmit?: (values: Record<string, string>) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [criado, setCriado] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (name: string, v: string) => setValues((x) => ({ ...x, [name]: v }));
  const pode = campos.filter((c) => c.required).every((c) => (values[c.name] ?? "").trim() !== "");

  if (criado) {
    return (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-8 text-emerald-400" />
        </span>
        <h2 className="adm-display mt-4 text-2xl font-bold adm-ink">{sucessoTitulo}</h2>
        <div className="adm-card mt-5 space-y-2 p-5 text-left text-sm">
          {campos
            .filter((c) => (values[c.name] ?? "").trim() !== "")
            .map((c) => (
              <div key={c.name} className="flex justify-between gap-3">
                <span className="adm-muted">{c.label}</span>
                <span className="truncate text-right adm-ink">{values[c.name]}</span>
              </div>
            ))}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <Link href={voltarHref} className="rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1d4ed8]">
            {voltarLabel}
          </Link>
          <button
            type="button"
            onClick={() => { setValues({}); setCriado(false); }}
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
      <Link href={voltarHref} className="text-sm font-semibold adm-muted hover:adm-brand">
        ← {voltarLabel}
      </Link>

      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">{titulo}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {campos.map((c) => (
            <div key={c.name} className={c.full ? "sm:col-span-2" : ""}>
              <label className="mb-1 block text-xs font-medium adm-muted">
                {c.label}
                {c.required && <span className="text-rose-400"> *</span>}
              </label>
              {c.type === "select" ? (
                <select className={inputCls} value={values[c.name] ?? ""} onChange={(e) => set(c.name, e.target.value)}>
                  <option value="">Selecione…</option>
                  {c.options?.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ) : (
                <input
                  type={c.type === "number" ? "number" : "text"}
                  className={inputCls}
                  value={values[c.name] ?? ""}
                  onChange={(e) => set(c.name, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!pode || pending}
        onClick={() =>
          startTransition(async () => {
            if (onSubmit) await onSubmit(values);
            setCriado(true);
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] py-3.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1d4ed8] disabled:opacity-40"
      >
        <Check className="size-5" />
        {pending ? "Salvando…" : criarLabel}
      </button>
    </div>
  );
}
