"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wrench,
  Plus,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Dice5,
  Check,
  X,
  AlertTriangle,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import type { MecanicoRow, OrdemAtribuivel } from "@/lib/admin-data";
import { osBadgeClass } from "../../_data/mock";
import { criarMecanico, definirAcessoMecanico, excluirMecanico, vincularOS } from "../actions";

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

type Feedback = { type: "ok" | "err"; text: string } | null;

export function MecanicosManager({
  mecanicos,
  ordensAtivas,
  currentUserId,
}: {
  mecanicos: MecanicoRow[];
  ordensAtivas: OrdemAtribuivel[];
  currentUserId: string;
}) {
  const [pending, start] = useTransition();
  const [feedback, setFeedback] = useState<Feedback>(null);
  const router = useRouter();

  // Form de cadastro — sempre visível: cadastrar mecânico é a razão de ser
  // desta tela, não pode ficar escondido atrás de um botão.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  // Estado por-mecânico — painel de acesso (e-mail + senha) e exclusão
  const [acessoFor, setAcessoFor] = useState<string | null>(null);
  const [acessoEmail, setAcessoEmail] = useState("");
  const [acessoPw, setAcessoPw] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Vínculo de OS
  const [soSemMecanico, setSoSemMecanico] = useState(false);

  const ordens = soSemMecanico ? ordensAtivas.filter((o) => !o.mechanicId) : ordensAtivas;
  const semMecanico = ordensAtivas.filter((o) => !o.mechanicId).length;

  function submitCreate(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await criarMecanico({ name, email, password });
      if (r.ok) {
        setFeedback({
          type: "ok",
          text: password.trim()
            ? `${name} cadastrado. Repasse a senha — ela não aparece de novo.`
            : `${name} cadastrado. Já dá pra vincular OS a ele; o login pode ser criado depois.`,
        });
        setName("");
        setEmail("");
        setPassword("");
        setShowPw(false);
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível cadastrar o mecânico." });
      }
    });
  }

  function submitAcesso(userId: string, userName: string) {
    start(async () => {
      const r = await definirAcessoMecanico({ userId, email: acessoEmail, password: acessoPw });
      if (r.ok) {
        setFeedback({ type: "ok", text: `Acesso de ${userName} atualizado.` });
        setAcessoFor(null);
        setAcessoEmail("");
        setAcessoPw("");
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível salvar o acesso." });
      }
    });
  }

  function submitDelete(userId: string, userName: string) {
    start(async () => {
      const r = await excluirMecanico({ userId });
      if (r.ok) {
        setFeedback({ type: "ok", text: `Acesso de ${userName} removido. As OS dele seguem no histórico.` });
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível excluir o mecânico." });
      }
      setConfirmDelete(null);
    });
  }

  function submitVinculo(osId: string, mechanicId: string) {
    start(async () => {
      const r = await vincularOS(osId, mechanicId);
      if (r.ok) {
        const nome = mecanicos.find((m) => m.id === mechanicId)?.name;
        setFeedback({
          type: "ok",
          text: nome ? `${osId} vinculada a ${nome}.` : `${osId} ficou sem mecânico.`,
        });
        router.refresh();
      } else {
        setFeedback({ type: "err", text: r.error ?? "Não foi possível vincular a OS." });
      }
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

      {/* ── Cadastrar mecânico ───────────────────────────────────────── */}
      <section className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-4 py-3.5 sm:px-5">
          <h2 className="adm-display flex items-center gap-2 adm-ink">
            <Wrench className="size-4 text-amber-400" />
            Cadastrar mecânico
          </h2>
          <p className="text-xs adm-muted">
            Só o nome é obrigatório — assim ele já aparece para receber OS. E-mail e senha são o
            login do app do mecânico, e podem ser definidos depois.
          </p>
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
                <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">
                  E-mail (login) — opcional
                </span>
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

            <label className="block sm:max-w-md">
              <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">
                Senha inicial — opcional
              </span>
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

            <button
              type="submit"
              disabled={pending || name.trim() === ""}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] py-3 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40 sm:w-auto sm:px-6"
            >
              <Plus className="size-4" />
              {pending ? "Cadastrando…" : "Cadastrar mecânico"}
            </button>
        </form>
      </section>

      {/* ── Equipe ───────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <h2 className="adm-mono text-[0.6rem] adm-muted">
          {mecanicos.length} {mecanicos.length === 1 ? "mecânico" : "mecânicos"}
        </h2>

        {mecanicos.length === 0 && (
          <p className="adm-card px-5 py-6 text-center text-sm adm-muted">
            Nenhum mecânico cadastrado ainda. Crie o primeiro acima para poder vincular as OS.
          </p>
        )}

        {mecanicos.map((m) => {
          const isSelf = m.id === currentUserId;
          const isEditandoAcesso = acessoFor === m.id;
          const isConfirming = confirmDelete === m.id;
          const temLogin = m.email !== "" && m.hasPassword;
          return (
            <div key={m.id} className="adm-card p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <span className="adm-display grid size-11 shrink-0 place-items-center rounded-full bg-[var(--ad-surface-3)] text-sm adm-brand ring-1 ring-inset ring-[var(--ad-line-2)]">
                  {initials(m.name)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold adm-ink">{m.name}</p>
                    {!temLogin && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[0.6rem] font-semibold text-amber-300">
                        <AlertTriangle className="size-3" />
                        {m.email === "" ? "sem login" : "sem senha"}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm adm-muted">
                    {m.email || "sem e-mail — recebe OS, mas não entra no app"}
                  </p>
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="flex items-baseline gap-1.5">
                    <span className={`adm-display text-lg ${m.emAndamento > 0 ? "adm-brand" : "adm-ink"}`}>
                      {m.emAndamento}
                    </span>
                    <span className="adm-eyebrow">em andamento</span>
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="adm-display text-lg adm-ink">{m.finalizadas + m.entregues}</span>
                    <span className="adm-eyebrow">concluídas</span>
                  </span>
                </div>

                <div className="flex w-full items-center gap-2 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setAcessoFor(isEditandoAcesso ? null : m.id);
                      setAcessoEmail(m.email);
                      setAcessoPw("");
                      setConfirmDelete(null);
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-3 py-2 text-xs font-semibold adm-ink transition-colors hover:border-[var(--ad-brand)] sm:flex-none"
                  >
                    <KeyRound className="size-4" />
                    {temLogin ? "Alterar acesso" : "Criar login"}
                  </button>
                  {!isSelf &&
                    (isConfirming ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => submitDelete(m.id, m.name)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-500/40 bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300 transition-colors hover:bg-red-500/25 disabled:opacity-40 sm:flex-none"
                      >
                        <Trash2 className="size-4" />
                        Confirmar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDelete(m.id);
                          setAcessoFor(null);
                        }}
                        aria-label={`Excluir acesso de ${m.name}`}
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] adm-muted transition-colors hover:border-red-500/50 hover:text-red-300"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    ))}
                </div>
              </div>

              {isConfirming && (
                <p className="mt-3 text-xs adm-muted">
                  Remove o login de {m.name}.
                  {m.emAndamento > 0 &&
                    ` As ${m.emAndamento} OS em andamento dele ficam sem mecânico — lembre de repassar.`}
                </p>
              )}

              {isEditandoAcesso && (
                <div className="mt-4 space-y-3 border-t border-[var(--ad-line)] pt-4">
                  <label className="block">
                    <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">
                      E-mail (login) de {m.name}
                    </span>
                    <input
                      className={inputCls}
                      type="email"
                      value={acessoEmail}
                      onChange={(e) => setAcessoEmail(e.target.value)}
                      placeholder="Vazio = sem login no app"
                      autoComplete="off"
                    />
                  </label>

                  <div>
                    <span className="adm-mono mb-1.5 block text-[0.58rem] adm-muted">
                      {m.hasPassword ? "Nova senha (vazio mantém a atual)" : "Senha"}
                    </span>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        className={`${inputCls} flex-1`}
                        type="text"
                        value={acessoPw}
                        onChange={(e) => setAcessoPw(e.target.value)}
                        placeholder="Mín. 6 caracteres"
                        autoComplete="off"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAcessoPw(genPassword())}
                          className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-xs font-semibold adm-ink transition-colors hover:border-[var(--ad-brand)]"
                        >
                          <Dice5 className="size-4" />
                          Gerar
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => submitAcesso(m.id, m.name)}
                          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-xs font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
                        >
                          <Check className="size-4" />
                          {pending ? "Salvando…" : "Salvar"}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs adm-muted">
                    Anote e repasse a senha ao mecânico — ela não fica visível depois de salva.
                  </p>
                </div>
              )}

              {m.ordens.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-[var(--ad-line)] pt-3">
                  <p className="adm-mono text-[0.58rem] adm-muted">Fila atual</p>
                  {m.ordens.map((o) => (
                    <Link
                      key={o.id}
                      href={`/oficina/ordens/${o.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--ad-surface-2)]"
                    >
                      <span className="adm-mono text-xs adm-muted">{o.id}</span>
                      <span className="min-w-0 flex-1 truncate text-sm adm-ink">
                        {o.veiculo} · {o.cliente}
                      </span>
                      <span className={osBadgeClass[o.status]}>{o.status}</span>
                      <ChevronRight className="size-4 shrink-0 adm-muted" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ── Vincular OS ──────────────────────────────────────────────── */}
      <section className="adm-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--ad-line)] px-4 py-3.5 sm:px-5">
          <div>
            <h2 className="adm-display flex items-center gap-2 adm-ink">
              <ClipboardList className="size-4 adm-brand" />
              Vincular OS a mecânico
            </h2>
            <p className="text-xs adm-muted">
              Ordens ainda não entregues. Trocar o mecânico aqui é o mesmo que trocar dentro da OS.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSoSemMecanico((v) => !v)}
            className={`rounded-lg border px-3.5 py-2 text-xs font-semibold transition-colors ${
              soSemMecanico
                ? "border-[var(--ad-brand)] bg-[var(--ad-brand)]/10 adm-brand"
                : "border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] adm-ink hover:border-[var(--ad-brand)]"
            }`}
          >
            Sem mecânico ({semMecanico})
          </button>
        </div>

        <div className="divide-y divide-[var(--ad-line)]">
          {ordens.length === 0 && (
            <p className="px-5 py-6 text-center text-sm adm-muted">
              {soSemMecanico ? "Todas as OS ativas já têm mecânico." : "Nenhuma OS ativa no momento."}
            </p>
          )}
          {ordens.map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-5">
              <Link href={`/oficina/ordens/${o.id}`} className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold adm-ink">
                  <span className="adm-mono adm-muted">{o.id}</span> · {o.veiculo}
                </p>
                <p className="truncate text-xs adm-muted">
                  {o.cliente} · <span className="font-mono">{o.placa}</span> · {o.data}
                </p>
              </Link>

              <span className={osBadgeClass[o.status]}>{o.status}</span>

              <select
                value={o.mechanicId ?? ""}
                disabled={pending || mecanicos.length === 0}
                onChange={(e) => submitVinculo(o.id, e.target.value)}
                aria-label={`Mecânico da ${o.id}`}
                className={`rounded-lg border bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)] disabled:opacity-50 ${
                  o.mechanicId ? "border-[var(--ad-line)]" : "border-amber-500/40"
                }`}
              >
                <option value="">Sem mecânico</option>
                {mecanicos.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
