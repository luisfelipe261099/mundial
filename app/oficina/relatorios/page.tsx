import { AlertTriangle, BarChart3 } from "lucide-react";
import { brl } from "../_data/mock";
import { getRelatorios } from "@/lib/admin-data";
import { Panel, PageHeader } from "../_components/ui";

export default async function RelatoriosPage() {
  const relatorios = await getRelatorios();
  const maxReceita = Math.max(1, ...relatorios.servicosMaisVendidos.map((s) => s.receita));

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Análise"
        title="Relatórios"
        description="Serviços que mais faturam, clientes mais ativos e revisões que precisam de atenção."
      />
      <Panel
        title="Serviços mais vendidos"
        eyebrow="Ranking por receita"
        icon={BarChart3}
        bodyClass="divide-y divide-[var(--ad-line)]"
      >
        {relatorios.servicosMaisVendidos.length === 0 && (
          <p className="px-5 py-4 text-sm adm-muted">Sem dados ainda.</p>
        )}
        {relatorios.servicosMaisVendidos.map((s) => (
          <div key={s.servico} className="px-5 py-3.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold adm-ink">{s.servico}</span>
              <span className="adm-muted">
                {s.qtd}x · <span className="font-semibold adm-ink">{brl(s.receita)}</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[var(--ad-brand)] to-[var(--ad-brand-2)]"
                style={{ width: `${(s.receita / maxReceita) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Clientes mais ativos" bodyClass="divide-y divide-[var(--ad-line)]">
          {relatorios.clientesMaisAtivos.map((c, i) => (
            <div key={c.nome} className="flex items-center gap-3 px-5 py-3.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--ad-surface-2)] text-xs font-bold adm-muted">
                {i + 1}
              </span>
              <span className="flex-1 font-semibold adm-ink">{c.nome}</span>
              <span className="text-xs adm-muted">{c.os} OS</span>
              <span className="w-24 text-right text-sm font-semibold adm-ink">{brl(c.gasto)}</span>
            </div>
          ))}
        </Panel>

        <Panel title="Revisões pendentes" bodyClass="divide-y divide-[var(--ad-line)]">
          {relatorios.revisoesPendentes.length === 0 && (
            <p className="px-5 py-4 text-sm adm-muted">Nenhuma revisão vencida.</p>
          )}
          {relatorios.revisoesPendentes.map((v) => (
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
    </div>
  );
}
