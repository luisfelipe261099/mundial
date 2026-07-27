"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { atualizarPerfil } from "../actions";

const CAMPOS = [
  { k: "nome", label: "Nome" },
  { k: "cpf", label: "CPF" },
  { k: "email", label: "E-mail" },
  { k: "cidade", label: "Cidade" },
  { k: "endereco", label: "Endereço" },
];

// Telefone/WhatsApp são só leitura: a oficina os usa como prova de identidade
// no primeiro acesso, então a troca passa por ela.
const SOMENTE_LEITURA = [
  { k: "telefone", label: "Telefone" },
  { k: "whatsapp", label: "WhatsApp" },
];

const inputCls =
  "w-full rounded-xl border border-[var(--app-line)] bg-[var(--app-surface-2)] px-3 py-3 text-sm t-ink outline-none focus:border-[var(--app-brand)]";

export function PerfilForm({ inicial }: { inicial: Record<string, string> }) {
  const [v, setV] = useState<Record<string, string>>(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      {CAMPOS.map((c) => (
        <div key={c.k}>
          <label className="mb-1 block text-xs font-medium t-muted">{c.label}</label>
          <input
            value={v[c.k] ?? ""}
            onChange={(e) => setV((s) => ({ ...s, [c.k]: e.target.value }))}
            className={inputCls}
          />
        </div>
      ))}

      {SOMENTE_LEITURA.map((c) => (
        <div key={c.k}>
          <label className="mb-1 block text-xs font-medium t-muted">{c.label}</label>
          <input value={v[c.k] ?? ""} readOnly disabled className={`${inputCls} opacity-60`} />
        </div>
      ))}
      <p className="text-xs t-muted">
        Para alterar telefone ou WhatsApp, fale com a oficina — são os dados que
        confirmam sua identidade.
      </p>

      {erro && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-300">
          {erro}
        </p>
      )}

      <button
        type="button"
        disabled={pending || !(v.nome ?? "").trim()}
        onClick={() =>
          startTransition(async () => {
            setErro(null);
            const r = await atualizarPerfil(v);
            if (r?.error) setErro(r.error);
          })
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--app-brand)] py-3.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
      >
        <Check className="size-5" />
        {pending ? "Salvando…" : "Salvar alterações"}
      </button>
    </div>
  );
}
