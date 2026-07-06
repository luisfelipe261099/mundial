import Link from "next/link";
import { Users, Car, ClipboardList, Wallet, AlertTriangle, ChevronRight, ClipboardCheck } from "lucide-react";
import { brl, osBadgeClass } from "./_data/mock";
import { getKpis, getOrdens, getEstoque, faturamentoMensal } from "@/lib/admin-data";
import { KpiCard, BarChart, Panel } from "./_components/ui";

export default async function DashboardPage() {
  const [kpis, ordens, estoque] = await Promise.all([getKpis(), getOrdens(), getEstoque()]);
  const baixoEstoque = estoque.filter((p) => p.qtd < p.minimo);
  const recentes = ordens.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="adm-mono text-[0.6rem] adm-brand">Painel operacional</p>
          <h1 className="adm-display mt-1.5 text-2xl adm-ink">Visão geral</h1>
        </div>
        <Link
          href="/oficina/entrada"
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
        >
          <ClipboardCheck className="size-4" />
          Dar entrada de veículo
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard label="Clientes" value={kpis.clientes.toString()} icon={Users} />
        <KpiCard label="Veículos" value={kpis.veiculos.toString()} icon={Car} />
        <KpiCard label="OS abertas" value={kpis.osAbertas.toString()} icon={ClipboardList} hint="agora" />
        <KpiCard label="Faturamento do mês" value={brl(kpis.faturamentoMes)} icon={Wallet} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Faturamento — últimos 6 meses" bodyClass="p-5">
            <BarChart data={faturamentoMensal} />
          </Panel>
        </div>
        <Panel title="Resumo do ano" bodyClass="divide-y divide-[var(--ad-line)]">
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

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel
            title="Ordens de serviço recentes"
            action={<Link href="/oficina/ordens" className="text-sm font-semibold adm-brand">Ver todas</Link>}
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
                  <p className="truncate text-xs adm-muted">{os.veiculo} · {os.placa}</p>
                </div>
                <span className={osBadgeClass[os.status]}>{os.status}</span>
                <span className="hidden w-24 text-right text-sm font-semibold adm-ink sm:block">{brl(os.total)}</span>
                <ChevronRight className="size-4 shrink-0 adm-muted" />
              </Link>
            ))}
          </Panel>
        </div>

        <Panel
          title="Alertas de estoque"
          action={<Link href="/oficina/estoque" className="text-sm font-semibold adm-brand">Estoque</Link>}
          bodyClass="divide-y divide-[var(--ad-line)]"
        >
          {baixoEstoque.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Estoque em dia.</p>}
          {baixoEstoque.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-5 py-3.5">
              <AlertTriangle className="size-5 shrink-0 text-amber-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold adm-ink">{p.produto}</p>
                <p className="text-xs adm-muted">{p.marca}</p>
              </div>
              <span className="text-sm font-semibold text-amber-400">{p.qtd}/{p.minimo}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
