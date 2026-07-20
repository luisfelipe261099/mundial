import Link from "next/link";
import {
  Users,
  Car,
  ClipboardList,
  Wallet,
  AlertTriangle,
  ChevronRight,
  ClipboardCheck,
  Plus,
  CalendarClock,
  Package,
  TrendingUp,
} from "lucide-react";
import { brl, osBadgeClass } from "./_data/mock";
import { getKpis, getOrdens, getEstoque, getAgendaHoje, faturamentoMensal } from "@/lib/admin-data";
import { business } from "../_data/business";
import { StatCard, Sparkline, Delta, BarChart, Panel } from "./_components/ui";

export default async function DashboardPage() {
  const [kpis, ordens, estoque, agenda] = await Promise.all([
    getKpis(),
    getOrdens(),
    getEstoque(),
    getAgendaHoje(),
  ]);

  const baixoEstoque = estoque.filter((p) => p.qtd < p.minimo);
  const recentes = ordens.slice(0, 5);
  const confirmadosHoje = agenda.filter((a) => a.status === "Confirmado").length;

  // Data/saudação — fuso da oficina (Curitiba/São Paulo).
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

  // Trend real (série 6m, ilustrativa no protótipo) → sparkline + variação MoM.
  const serie = faturamentoMensal.map((m) => m.valor);
  const ult = serie[serie.length - 1];
  const pen = serie[serie.length - 2];
  const momPct = Math.round(((ult - pen) / pen) * 100);
  const momDir = momPct > 0 ? "up" : momPct < 0 ? "down" : "flat";

  // Pulso operacional de hoje/agora (ações que pedem atenção).
  const pulso = [
    { label: "OS abertas", value: kpis.osAbertas, sub: "no fluxo", warn: false },
    { label: "Aguardando", value: kpis.osAguardando, sub: "aprovação", warn: true },
    { label: "Agenda hoje", value: agenda.length, sub: `${confirmadosHoje} confirmados`, warn: false },
    { label: "Estoque baixo", value: baixoEstoque.length, sub: "abaixo do mínimo", warn: true },
  ];

  return (
    <div className="space-y-6">
      {/* ── BANDA-HERÓI ──────────────────────────────────────────────── */}
      <section className="adm-hero p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          {/* Esquerda: saudação + número-herói */}
          <div>
            <p className="adm-eyebrow">
              {dateLabel} · Painel operacional
            </p>
            <h1 className="adm-display mt-2 text-2xl adm-ink">
              {saudacao}. Aqui está a {business.shortName} hoje.
            </h1>

            <div className="mt-7">
              <p className="adm-eyebrow adm-brand">Faturamento do mês</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <p className="adm-display-xl text-[clamp(2.6rem,7vw,4rem)] adm-ink">
                  {brl(kpis.faturamentoMes)}
                </p>
                <Delta dir={momDir}>
                  {momPct > 0 ? "+" : ""}
                  {momPct}%
                </Delta>
              </div>
              <p className="mt-2 text-xs adm-muted">
                Receita registrada · variação vs. mês anterior (série de 6 meses)
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/oficina/entrada"
                className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
              >
                <ClipboardCheck className="size-4" />
                Dar entrada de veículo
              </Link>
              <Link
                href="/oficina/ordens/nova"
                className="flex items-center gap-2 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-4 py-2.5 text-sm font-semibold adm-ink transition-colors hover:bg-[var(--ad-surface-3)]"
              >
                <Plus className="size-4" />
                Nova OS
              </Link>
            </div>
          </div>

          {/* Direita: mini-trend 6 meses */}
          <div className="adm-card-2 p-5">
            <div className="flex items-center justify-between">
              <p className="adm-eyebrow">Faturamento · 6 meses</p>
              <TrendingUp className="size-4 adm-brand" strokeWidth={2} />
            </div>
            <div className="mt-4 h-24 w-full">
              <Sparkline data={serie} className="h-full w-full" />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="adm-eyebrow">{faturamentoMensal[0].mes}</span>
              <span className="adm-mono text-[0.62rem] adm-brand">
                {faturamentoMensal[faturamentoMensal.length - 1].mes} · {brl(ult)}
              </span>
            </div>
          </div>
        </div>

        {/* Pulso operacional */}
        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[var(--ad-line)] bg-[var(--ad-line)] sm:grid-cols-4">
          {pulso.map((c) => (
            <div key={c.label} className="bg-[var(--ad-surface)] px-5 py-4">
              <p className="adm-eyebrow">{c.label}</p>
              <p
                className={`adm-display mt-2 text-2xl ${
                  c.warn && c.value > 0 ? "adm-accent" : "adm-ink"
                }`}
              >
                {c.value}
              </p>
              <p className="mt-1 text-xs adm-muted">{c.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAIXA DE TOTAIS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Clientes" value={kpis.clientes.toString()} icon={Users} sub="na base cadastrada" />
        <StatCard
          label="Veículos"
          value={kpis.veiculos.toString()}
          icon={Car}
          sub={
            kpis.revisoesVencidas > 0 ? (
              <span className="adm-accent">{kpis.revisoesVencidas} com revisão vencida</span>
            ) : (
              "frota em dia"
            )
          }
        />
        <StatCard
          label="OS concluídas"
          value={kpis.osConcluidasMes.toString()}
          icon={ClipboardCheck}
          sub="finalizadas + entregues"
        />
        <StatCard
          label="Ticket médio"
          value={brl(kpis.ticketMedio)}
          icon={Wallet}
          accent
          sub={`base de ${kpis.osTotal} OS`}
        />
      </div>

      {/* ── FATURAMENTO + RESUMO ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Faturamento"
            eyebrow="Últimos 6 meses"
            icon={TrendingUp}
            bodyClass="p-5"
          >
            <BarChart data={faturamentoMensal} />
          </Panel>
        </div>
        <Panel title="Resumo do ano" eyebrow="Acumulado" bodyClass="divide-y divide-[var(--ad-line)]">
          {[
            { label: "Faturamento no ano", value: brl(kpis.faturamentoAno) },
            { label: "OS concluídas", value: kpis.osConcluidasMes.toString() },
            { label: "Ticket médio", value: brl(kpis.ticketMedio) },
          ].map((r) => (
            <div key={r.label} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm adm-muted">{r.label}</span>
              <span className="adm-display font-bold adm-ink">{r.value}</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* ── OS RECENTES + RAIL (estoque, agenda) ─────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Ordens de serviço recentes"
            eyebrow="Atividade"
            icon={ClipboardList}
            action={
              <Link href="/oficina/ordens" className="text-sm font-semibold adm-brand">
                Ver todas
              </Link>
            }
            bodyClass="divide-y divide-[var(--ad-line)]"
          >
            {recentes.map((os) => (
              <Link
                key={os.id}
                href={`/oficina/ordens/${os.id}`}
                className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-[var(--ad-surface-2)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold adm-ink">
                    <span className="font-mono adm-muted">{os.id}</span> · {os.cliente}
                  </p>
                  <p className="truncate text-xs adm-muted">
                    {os.veiculo} · {os.placa}
                  </p>
                </div>
                <span className={osBadgeClass[os.status]}>{os.status}</span>
                <span className="hidden w-24 text-right text-sm font-semibold adm-ink sm:block">
                  {brl(os.total)}
                </span>
                <ChevronRight className="size-4 shrink-0 adm-muted" />
              </Link>
            ))}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel
            title="Alertas de estoque"
            eyebrow="Reposição"
            icon={Package}
            action={
              <Link href="/oficina/estoque" className="text-sm font-semibold adm-brand">
                Estoque
              </Link>
            }
            bodyClass="divide-y divide-[var(--ad-line)]"
          >
            {baixoEstoque.length === 0 && (
              <p className="px-5 py-4 text-sm adm-muted">Estoque em dia.</p>
            )}
            {baixoEstoque.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <AlertTriangle className="size-5 shrink-0 text-amber-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold adm-ink">{p.produto}</p>
                  <p className="text-xs adm-muted">{p.marca}</p>
                </div>
                <span className="adm-display text-sm font-bold adm-accent">
                  {p.qtd}/{p.minimo}
                </span>
              </div>
            ))}
          </Panel>

          <Panel
            title="Agenda de hoje"
            eyebrow="Compromissos"
            icon={CalendarClock}
            action={
              <Link href="/oficina/agenda" className="text-sm font-semibold adm-brand">
                Agenda
              </Link>
            }
            bodyClass="divide-y divide-[var(--ad-line)]"
          >
            {agenda.length === 0 && (
              <p className="px-5 py-4 text-sm adm-muted">Sem agendamentos para hoje.</p>
            )}
            {agenda.map((a, i) => (
              <div key={`${a.hora}-${i}`} className="flex items-center gap-3 px-5 py-3.5">
                <span className="adm-mono text-xs tabular-nums adm-brand">{a.hora}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold adm-ink">{a.cliente}</p>
                  <p className="truncate text-xs adm-muted">
                    {a.veiculo} · {a.servico}
                  </p>
                </div>
                <span
                  className={
                    a.status === "Confirmado" ? "osb osb-finalizada" : "osb osb-aguardando"
                  }
                >
                  {a.status}
                </span>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
