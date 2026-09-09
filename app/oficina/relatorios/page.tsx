import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  Package,
  Users,
  Wrench,
  Wallet,
  CreditCard,
  ClipboardList,
} from "lucide-react";
import { brl, osBadgeClass, type StatusOS } from "../_data/mock";
import { getRelatorios } from "@/lib/admin-data";
import { Panel, PageHeader } from "../_components/ui";

const ATALHOS: { label: string; dias?: number; ano?: boolean }[] = [
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
  { label: "Este ano", ano: true },
  { label: "Tudo" },
];

function isoDe(d: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/** Barra de ranking reutilizada nos painéis de itens. */
function Ranking({
  linhas,
  vazio,
}: {
  linhas: { servico: string; qtd: number; receita: number }[];
  vazio: string;
}) {
  const max = Math.max(1, ...linhas.map((l) => l.receita));
  if (linhas.length === 0) return <p className="px-5 py-4 text-sm adm-muted">{vazio}</p>;
  return (
    <>
      {linhas.map((s) => (
        <div key={s.servico} className="px-5 py-3.5">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate font-semibold adm-ink">{s.servico}</span>
            <span className="shrink-0 adm-muted">
              {s.qtd}x · <span className="font-semibold adm-ink">{brl(s.receita)}</span>
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--ad-brand)] to-[var(--ad-brand-2)]"
              style={{ width: `${(s.receita / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </>
  );
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ de?: string; ate?: string }>;
}) {
  const { de, ate } = await searchParams;
  const r = await getRelatorios(de, ate);

  const hoje = new Date();
  const linkAtalho = (a: (typeof ATALHOS)[number]) => {
    if (!a.dias && !a.ano) return "/oficina/relatorios";
    const inicio = a.ano
      ? new Date(hoje.getFullYear(), 0, 1)
      : new Date(hoje.getTime() - (a.dias ?? 30) * 86_400_000);
    return `/oficina/relatorios?de=${isoDe(inicio)}`;
  };
  const periodoLabel =
    de || ate
      ? `${de ? de.split("-").reverse().join("/") : "início"} até ${ate ? ate.split("-").reverse().join("/") : "hoje"}`
      : "todo o período";

  const resumo = [
    { label: "Receitas", value: brl(r.resumo.receitas), icon: BarChart3, cls: "text-emerald-400" },
    { label: "Despesas", value: brl(r.resumo.despesas), icon: Wallet, cls: "text-rose-400" },
    {
      label: "Lucro",
      value: brl(r.resumo.lucro),
      icon: Wallet,
      cls: r.resumo.lucro >= 0 ? "adm-brand" : "text-rose-400",
    },
    { label: "Ordens de serviço", value: String(r.resumo.totalOS), icon: ClipboardList, cls: "adm-ink" },
    { label: "Ticket médio", value: brl(r.resumo.ticketMedio), icon: Users, cls: "adm-ink" },
  ];

  const maxMec = Math.max(1, ...r.porMecanico.map((m) => m.valor));
  const maxForma = Math.max(1, ...r.formasPagamento.map((f) => f.valor));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análise"
        title="Relatórios"
        description={`Resultado do período, ranking de serviços e peças, produtividade da equipe e revisões pendentes — ${periodoLabel}.`}
      />

      {/* Período */}
      <div className="adm-card flex flex-wrap items-center gap-2 p-4">
        <span className="text-xs font-semibold adm-muted">Período:</span>
        {ATALHOS.map((a) => (
          <Link
            key={a.label}
            href={linkAtalho(a)}
            className="rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted transition-colors hover:bg-[var(--ad-surface-2)] hover:adm-ink"
          >
            {a.label}
          </Link>
        ))}
        <form action="/oficina/relatorios" className="ml-auto flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs adm-muted">
            De
            <input
              type="date"
              name="de"
              defaultValue={de ?? ""}
              className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2.5 py-1.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs adm-muted">
            Até
            <input
              type="date"
              name="ate"
              defaultValue={ate ?? ""}
              className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2.5 py-1.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b5fe0]"
          >
            Aplicar
          </button>
        </form>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {resumo.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="adm-card p-4">
              <Icon className={`size-5 ${k.cls}`} />
              <p className="adm-display mt-2 truncate text-[clamp(1rem,4vw,1.35rem)] adm-ink">{k.value}</p>
              <p className="text-xs adm-muted">{k.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel
          title="Serviços mais vendidos"
          eyebrow="Ranking por receita"
          icon={BarChart3}
          bodyClass="divide-y divide-[var(--ad-line)]"
        >
          <Ranking linhas={r.servicosMaisVendidos} vazio="Nenhum serviço lançado no período." />
        </Panel>

        <Panel
          title="Peças mais usadas"
          eyebrow="Ranking por receita"
          icon={Package}
          bodyClass="divide-y divide-[var(--ad-line)]"
        >
          <Ranking linhas={r.pecasMaisUsadas} vazio="Nenhuma peça lançada no período." />
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Clientes mais ativos" icon={Users} bodyClass="divide-y divide-[var(--ad-line)]">
          {r.clientesMaisAtivos.length === 0 && (
            <p className="px-5 py-4 text-sm adm-muted">Sem ordens no período.</p>
          )}
          {r.clientesMaisAtivos.map((c, i) => (
            <div key={c.nome} className="flex items-center gap-3 px-5 py-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--ad-surface-2)] text-xs font-bold adm-muted">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-semibold adm-ink">{c.nome}</span>
              <span className="shrink-0 text-xs adm-muted">{c.os} OS</span>
              <span className="w-24 shrink-0 text-right text-sm font-semibold adm-ink">{brl(c.gasto)}</span>
            </div>
          ))}
        </Panel>

        <Panel title="Produção por mecânico" icon={Wrench} bodyClass="divide-y divide-[var(--ad-line)]">
          {r.porMecanico.length === 0 && (
            <p className="px-5 py-4 text-sm adm-muted">Sem ordens no período.</p>
          )}
          {r.porMecanico.map((m) => (
            <div key={m.nome} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold adm-ink">{m.nome}</span>
                <span className="shrink-0 adm-muted">
                  {m.os} OS · <span className="font-semibold adm-ink">{brl(m.valor)}</span>
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
                <div
                  className="h-full rounded-full bg-[var(--ad-brand)]"
                  style={{ width: `${(m.valor / maxMec) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Ordens por status" icon={ClipboardList} bodyClass="divide-y divide-[var(--ad-line)]">
          {r.ordensPorStatus.length === 0 && (
            <p className="px-5 py-4 text-sm adm-muted">Sem ordens no período.</p>
          )}
          {r.ordensPorStatus.map((o) => (
            <div key={o.status} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className={osBadgeClass[o.status as StatusOS] ?? "osb osb-aguardando"}>{o.status}</span>
              <span className="text-sm font-semibold adm-ink">{o.qtd}</span>
            </div>
          ))}
        </Panel>

        <Panel title="Recebido por forma de pagamento" icon={CreditCard} bodyClass="divide-y divide-[var(--ad-line)]">
          {r.formasPagamento.length === 0 && (
            <p className="px-5 py-4 text-sm adm-muted">Sem receitas no período.</p>
          )}
          {r.formasPagamento.map((f) => (
            <div key={f.nome} className="px-5 py-3.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold adm-ink">{f.nome}</span>
                <span className="shrink-0 font-semibold adm-ink">{brl(f.valor)}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${(f.valor / maxForma) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </Panel>
      </div>

      <Panel title="Revisões pendentes" icon={AlertTriangle} bodyClass="divide-y divide-[var(--ad-line)]">
        {r.revisoesPendentes.length === 0 && (
          <p className="px-5 py-4 text-sm adm-muted">Nenhuma revisão vencida.</p>
        )}
        {r.revisoesPendentes.map((v) => (
          <div key={v.placa} className="flex items-center gap-3 px-5 py-3.5">
            <AlertTriangle className="size-5 shrink-0 text-amber-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold adm-ink">
                {v.modelo} · <span className="font-mono adm-muted">{v.placa}</span>
              </p>
              <p className="truncate text-xs adm-muted">{v.proprietario}</p>
            </div>
            <span className="osb osb-aguardando">{v.quando}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
