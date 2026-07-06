"use client";

import { useState, useTransition } from "react";
import {
  ShieldCheck,
  Wrench,
  Plus,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Dice5,
  Check,
  X,
} from "lucide-react";
import type { UserRow } from "@/lib/admin-data";
import { createAccess, resetPassword, deleteAccess } from "../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3.5 py-2.5 text-sm adm-ink outline-none transition-colors placeholder:text-[var(--ad-muted)] focus:border-[var(--ad-brand)]";

// Senha legível: sem caracteres ambíguos (0/O, 1/l/I).
function genPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function RoleBadge({ role }: { role: string }) {
  const admin = role === "admin";
  const Icon = admin ? ShieldCheck : Wrench;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ad-line-2)] bg-[var(--ad-surface-3)] px-2.5 py-1 text-[0.7rem] font-semibold adm-ink">
      <Icon className={`size-3.5 ${admin ? "adm-brand" : "text-amber-400"}`} />
      {admin ? "Administrador" : "Mecânico"}
    </span>
  );
}

type Feedback = { type: "ok" | "err"; text: string } | null;

export function AccessManager({
  users,
  currentUserId,
}: {
  users: UserRow[];
  currentUserId: string;
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);

  // Form de criação
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("mecanico");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Estado por-usuário
  const [resetFor, setResetFor] = useState<string | null>(null);
  const [resetPw, setResetPw] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  function flash(f: Feedback) {
    setFeedback(f);
  }

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await createAccess({ name, email, role, password });
      if (r.ok) {
        flash({ type: "ok", text: `Acesso de ${name} criado.` });
        setName("");
        setEmail("");
        setRole("mecanico");
        setPassword("");
        setShowPw(false);
      } else {
        flash({ type: "err", text: r.error ?? "Não foi possível criar o acesso." });
      }
    });
  }

  function submitReset(userId: string, userName: string) {
    start(async () => {
      const r = await resetPassword({ userId, password: resetPw });
      if (r.ok) {
        flash({ type: "ok", text: `Senha de ${userName} redefinida.` });
        setResetFor(null);
        setResetPw("");
      } else {
        flash({ type: "err", text: r.error ?? "Não foi possível redefinir a senha." });
      }
    });
  }

  function submitDelete(userId: string, userName: string) {
    start(async () => {
      const r = await deleteAccess({ userId });
      if (r.ok) {
        flash({ type: "ok", text: `Acesso de ${userName} removido.` });
      } else {
        flash({ type: "err", text: r.error ?? "Não foi possível excluir o acesso." });
      }
      setConfirmDelete(null);
    });
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <div
          role="status"
          className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === "ok"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.type === "ok" ? (
            <Check className="mt-0.5 size-4 shrink-0" />
          ) : (
            <X className="mt-0.5 size-4 shrink-0" />
          )}
          <span className="flex-1">{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} aria-label="Fechar aviso">
            <X className="size-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}

      {/* ── Criar acesso ─────────────────────────────────────────────── */}
      <section className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-4 py-3.5 sm:px-5">
          <h2 className="adm-display adm-ink">Novo acesso</h2>
        </div>
        <form onSubmit={submitCreate} className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">Nome</span>
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Carlos Mendes"
                autoComplete="off"
              />
            </label>
            <label className="block">
              <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">E-mail (login)</span>
              <input
                className={inputCls}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@mundial.com.br"
                autoComplete="off"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">Função</span>
              <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="mecanico">Mecânico</option>
                <option value="admin">Administrador</option>
              </select>
            </label>
            <label className="block">
              <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">Senha inicial</span>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    className={`${inputCls} pr-10`}
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mín. 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? "Ocultar senha" : "Mostrar senha"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ad-muted)] transition-colors hover:text-[var(--ad-ink)]"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPassword(genPassword());
                    setShowPw(true);
                  }}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-3 text-xs font-semibold adm-ink transition-colors hover:border-[var(--ad-brand)]"
                >
                  <Dice5 className="size-4" />
                  Gerar
                </button>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40 sm:w-auto sm:px-6"
          >
            <Plus className="size-4" />
            {pending ? "Criando…" : "Criar acesso"}
          </button>
        </form>
      </section>

      {/* ── Lista de acessos ─────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="adm-mono text-[0.6rem] adm-muted">
          {users.length} {users.length === 1 ? "acesso" : "acessos"}
        </h2>

        {users.map((u) => {
          const isSelf = u.id === currentUserId;
          const isResetting = resetFor === u.id;
          const isConfirming = confirmDelete === u.id;
          return (
            <div key={u.id} className="adm-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <span className="adm-display grid size-11 shrink-0 place-items-center rounded-full bg-[var(--ad-surface-3)] text-sm adm-brand ring-1 ring-inset ring-[var(--ad-line-2)]">
                  {initials(u.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold adm-ink">{u.name}</p>
                    {isSelf && (
                      <span className="adm-mono rounded bg-[var(--ad-surface-3)] px-1.5 py-0.5 text-[0.55rem] adm-muted">
                        você
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm adm-muted">{u.email}</p>
                </div>

                <RoleBadge role={u.role} />

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setResetFor(isResetting ? null : u.id);
                      setResetPw("");
                      setConfirmDelete(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-3 py-2 text-xs font-semibold adm-ink transition-colors hover:border-[var(--ad-brand)] sm:flex-none"
                  >
                    <KeyRound className="size-4" />
                    Redefinir senha
                  </button>
                  {!isSelf &&
                    (isConfirming ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => submitDelete(u.id, u.name)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40 sm:flex-none"
                      >
                        <Trash2 className="size-4" />
                        Confirmar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDelete(u.id);
                          setResetFor(null);
                        }}
                        aria-label={`Excluir acesso de ${u.name}`}
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] adm-muted transition-colors hover:border-red-500/50 hover:text-red-300"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ))}
                </div>
              </div>

              {isResetting && (
                <div className="mt-4 border-t border-[var(--ad-line)] pt-4">
                  <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">
                    Nova senha para {u.name}
                  </span>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <input
                      className={`${inputCls} flex-1`}
                      type="text"
                      value={resetPw}
                      onChange={(e) => setResetPw(e.target.value)}
                      placeholder="Mín. 6 caracteres"
                      autoComplete="off"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setResetPw(genPassword())}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-xs font-semibold adm-ink transition-colors hover:border-[var(--ad-brand)]"
                      >
                        <Dice5 className="size-4" />
                        Gerar
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => submitReset(u.id, u.name)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-xs font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
                      >
                        <Check className="size-4" />
                        {pending ? "Salvando…" : "Salvar"}
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs adm-muted">
                    Anote e repasse a senha ao {u.role === "admin" ? "administrador" : "mecânico"} —
                    ela não fica visível depois de salva.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}
