"use client";

import { useActionState } from "react";
import { KeyRound, LogIn, UserRound } from "lucide-react";
import { login, type LoginState } from "./actions";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-white outline-none transition-[border-color,box-shadow] placeholder:text-slate-500 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.18)]";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-3">
      <div className="relative">
        <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          name="identifier"
          autoComplete="username"
          placeholder="E-mail ou placa do carro"
          className={inputCls}
          required
        />
      </div>
      <div className="relative">
        <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Senha"
          className={inputCls}
          required
        />
      </div>
      {state?.error && (
        <p className="rounded-lg border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#4f8df9] via-[#2563eb] to-[#1d4ed8] py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_-10px_rgba(37,99,235,0.6)] transition-[filter,transform] enabled:hover:brightness-110 enabled:active:scale-[0.985] disabled:opacity-50"
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
