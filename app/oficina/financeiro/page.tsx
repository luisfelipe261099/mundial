import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { financeiro, faturamentoMensal, brl } from "../_data/mock";
import { BarChart, Panel } from "../_components/ui";

export default function FinanceiroPage() {
  const totalReceitas = financeiro.receitas.reduce((s, r) => s + r.valor, 0);
  const totalDespesas = financeiro.despesas.reduce((s, d) => s + d.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const tiles = [
    { label: "Receitas", value: brl(totalReceitas), icon: TrendingUp, cls: "bg-emerald-500/15 text-emerald-400" },
    { label: "Despesas", value: brl(totalDespesas), icon: TrendingDown, cls: "bg-rose-500/15 text-rose-400" },
    { label: "Saldo do mês", value: brl(saldo), icon: Wallet, cls: "bg-[var(--ad-brand)]/15 adm-brand" },
  ];

  const maxR = Math.max(...financeiro.receitas.map((r) => r.valor));
  const maxD = Math.max(...financeiro.despesas.map((d) => d.valor));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="adm-card p-4">
              <span className={`grid size-10 place-items-center rounded-xl ${t.cls}`}>
                <Icon className="size-5" />
              </span>
              <p className="adm-display mt-3 text-2xl font-bold adm-ink">{t.value}</p>
              <p className="text-sm adm-muted">{t.label}</p>
            </div>
          );
        })}
      </div>

      <Panel title="Faturamento — últimos 6 meses" bodyClass="p-5">
        <BarChart data={faturamentoMensal} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Receitas" bodyClass="p-5 space-y-4">
          {financeiro.receitas.map((r) => (
            <div key={r.fonte}>
              <div className="flex items-center justify-between text-sm">
                <span className="adm-ink">{r.fonte}</span>
                <span className="font-semibold adm-ink">{brl(r.valor)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(r.valor / maxR) * 100}%` }} />
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Despesas" bodyClass="p-5 space-y-4">
          {financeiro.despesas.map((d) => (
            <div key={d.fonte}>
              <div className="flex items-center justify-between text-sm">
                <span className="adm-ink">{d.fonte}</span>
                <span className="font-semibold adm-ink">{brl(d.valor)}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
                <div className="h-full rounded-full bg-rose-500" style={{ width: `${(d.valor / maxD) * 100}%` }} />
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
