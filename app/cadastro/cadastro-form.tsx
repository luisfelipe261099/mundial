"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { cadastrarCliente, type CadastroState } from "./actions";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500";

export function CadastroForm() {
  const [state, formAction, pending] = useActionState<CadastroState, FormData>(cadastrarCliente, {});

  return (
    <form action={formAction} className="mt-8 space-y-3">
      <input name="nome" placeholder="Nome completo" className={inputCls} required autoComplete="name" />
      <input name="email" type="email" placeholder="E-mail" className={inputCls} required autoComplete="email" />
      <input name="telefone" placeholder="Telefone / WhatsApp" className={inputCls} autoComplete="tel" />
      <input name="senha" type="password" placeholder="Senha" className={inputCls} required autoComplete="new-password" />
      <div className="grid grid-cols-2 gap-3">
        <input name="placa" placeholder="Placa (opcional)" className={inputCls} />
        <input name="modelo" placeholder="Modelo (opcional)" className={inputCls} />
      </div>
      {state?.error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? (
          "Criando…"
        ) : (
          <>
            <UserPlus className="size-4" />
            Criar conta
          </>
        )}
      </button>
    </form>
  );
}
