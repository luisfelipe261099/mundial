"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login, type LoginState } from "./actions";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="mt-8 space-y-3">
      <input
        name="identifier"
        autoComplete="username"
        placeholder="E-mail ou placa do carro"
        className={inputCls}
        required
      />
      <input
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="Senha"
        className={inputCls}
        required
      />
      {state?.error && (
        <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-blue-500 disabled:opacity-50"
      >
        {pending ? (
          "Entrando…"
        ) : (
          <>
            <LogIn className="size-4" />
            Entrar
          </>
        )}
      </button>
    </form>
  );
}
