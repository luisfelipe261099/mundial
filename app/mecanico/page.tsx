import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { osBadgeClass, type StatusOS } from "../oficina/_data/mock";
import { getOrdens, getOrdensMecanico } from "@/lib/admin-data";
import { requireSession } from "@/lib/auth";

const stripeClass: Record<StatusOS, string> = {
  Aberta: "mec-stripe mec-stripe-aberta",
  "Aguardando aprovação": "mec-stripe mec-stripe-aguardando",
  "Em execução": "mec-stripe mec-stripe-execucao",
  Finalizada: "mec-stripe mec-stripe-finalizada",
  Entregue: "mec-stripe mec-stripe-entregue",
};

export default async function MecanicoHome() {
  const session = await requireSession();
  const todas =
    session.kind === "mecanico" ? await getOrdensMecanico(session.id) : await getOrdens();
  const ativas = todas.filter((o) => o.status !== "Entregue");

  const conta = (s: StatusOS) => todas.filter((o) => o.status === s).length;
  const pulso = [
    { label: "Em execução", value: conta("Em execução"), accent: false },
    { label: "Aguardando", value: conta("Aguardando aprovação"), accent: true },
    { label: "Abertas", value: conta("Aberta"), accent: false },
  ];

  // Data/saudação — fuso da oficina.
  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(now);
  const hour =
    Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "America/Sao_Paulo",
        hour: "numeric",
        hour12: false,
      }).format(now),
    ) % 24;
  const saudacao = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const primeiroNome = session.name.split(" ")[0];

  return (
    <div className="space-y-5 px-5 pb-8 pt-4">
      {/* ── Banda-herói ──────────────────────────────────────────────── */}
      <section className="mec-hero p-5">
        <p className="mec-eyebrow">{dateLabel}</p>
        <h1 className="mec-display-xl mt-1.5 text-[1.55rem] mec-ink">
          {saudacao}, {primeiroNome}.
        </h1>
        <p className="mt-1 text-sm mec-muted">Sua fila de trabalho de hoje.</p>

        <div className="mt-5 flex items-end gap-2">
          <span className="mec-display-xl text-[2.75rem] mec-ink">{ativas.length}</span>
          <span className="mec-eyebrow mb-1.5">
            {ativas.length === 1 ? "ordem ativa" : "ordens ativas"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-[var(--mec-line)] bg-[var(--mec-line)]">
          {pulso.map((c) => (
            <div key={c.label} className="bg-[var(--mec-surface)] px-3 py-3">
              <p
                className={`mec-display text-xl font-bold ${
                  c.accent && c.value > 0 ? "mec-accent" : "mec-ink"
                }`}
              >
                {c.value}
              </p>
              <p className="mec-eyebrow mt-1 leading-tight">{c.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Fila de ordens ───────────────────────────────────────────── */}
      {ativas.length === 0 && (
        <div className="mec-card p-5 text-sm mec-muted">
          Nenhuma ordem atribuída a você no momento.
        </div>
      )}
      <div className="space-y-3">
        {ativas.map((o) => (
          <Link
            key={o.id}
            href={`/mecanico/${o.id}`}
            className="mec-card relative block overflow-hidden p-4 pl-5"
          >
            <span className={stripeClass[o.status]} />
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs mec-muted">{o.id}</span>
              <span className={osBadgeClass[o.status]}>{o.status}</span>
            </div>
            <p className="mec-display mt-1.5 font-bold mec-ink">{o.veiculo}</p>
            <p className="text-xs mec-muted">
              {o.cliente} · <span className="font-mono">{o.placa}</span>
            </p>
            <p className="mt-2 line-clamp-2 text-sm mec-muted">{o.defeito}</p>
            <span className="mt-2.5 inline-flex items-center gap-1 text-sm font-semibold mec-brand">
              Abrir OS
              <ChevronRight className="size-4" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
