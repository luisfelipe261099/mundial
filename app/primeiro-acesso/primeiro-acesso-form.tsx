"use client";

import { useActionState } from "react";
import { KeyRound } from "lucide-react";
import { ativarAcesso, type AtivarState } from "./actions";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500";

export function PrimeiroAcessoForm() {
  const [state, formAction, pending] = useActionState<AtivarState, FormData>(ativarAcesso, {});

  return (
    <form action={formAction} className="mt-8 space-y-3">
      <input name="placa" placeholder="Placa do carro" className={inputCls} required autoCapitalize="characters" />
      <input name="telefone" placeholder="Telefone / WhatsApp cadastrado" className={inputCls} required autoComplete="tel" inputMode="tel" />
      <input name="senha" type="password" placeholder="Crie uma senha (mín. 6)" className={inputCls} required autoComplete="new-password" />
      <input name="email" type="email" placeholder="E-mail (opcional)" className={inputCls} autoComplete="email" />
      {state?.error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? (
          "Ativando…"
        ) : (
          <>
            <KeyRound className="size-4" />
            Ativar meu acesso
          </>
        )}
      </button>
    </form>
  );
}
