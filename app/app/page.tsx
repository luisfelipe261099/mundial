import Link from "next/link";
import { Activity, ChevronRight } from "lucide-react";
import { requireClientId } from "@/lib/auth";
import { getCliente, getVeiculos, getReparosRecentes, getOrdensAtivas } from "@/lib/client-data";
import { business } from "../_data/business";
import { SectionHeading } from "./_components/section-heading";
import { VehicleCarousel } from "./_components/vehicle-carousel";
import { NextServiceCard } from "./_components/next-service-card";
import { RepairRow } from "./_components/repair-row";
import { QuickActions } from "./_components/quick-actions";

const ACOMP_LABEL: Record<string, string> = {
  Aberta: "Recebido",
  "Aguardando aprovação": "Orçamento pronto",
  "Em execução": "Em serviço",
  Finalizada: "Pronto p/ retirada",
};

export default async function HomePage() {
  const clientId = await requireClientId();
  const [cliente, veiculos, reparos, ativas] = await Promise.all([
    getCliente(clientId),
    getVeiculos(clientId),
    getReparosRecentes(clientId),
    getOrdensAtivas(clientId),
  ]);
  const principal = veiculos[0];
  const emAndamento = ativas[0];

  return (
    <div className="space-y-7 px-5 pb-8 pt-2">
      {/* ── Banda-herói ────────────────────────────────────────────────── */}
      <section className="app-hero p-6">
        <p className="app-eyebrow t-brand">{business.name}</p>
        <h1 className="app-display-xl mt-2 text-[2.35rem] t-ink">
          Olá, {cliente?.primeiroNome ?? "cliente"}.
        </h1>
        <p className="mt-1.5 text-sm t-muted">Sua garagem, sob controle.</p>

        <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2">
          <div className="flex items-baseline gap-1.5">
            <span className="app-display text-lg font-bold t-ink">{veiculos.length}</span>
            <span className="app-eyebrow">{veiculos.length === 1 ? "veículo" : "veículos"}</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="app-display text-lg font-bold t-ink">{reparos.length}</span>
            <span className="app-eyebrow">no histórico</span>
          </div>
        </div>

        {emAndamento && (
          <Link
            href="/app/acompanhar"
            className="mt-5 flex items-center gap-3.5 rounded-2xl border border-[var(--app-line-2)] bg-[var(--app-surface-2)] p-3.5"
          >
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--app-brand)]/15">
              <Activity className="size-5 t-brand" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="app-eyebrow">Seu carro na oficina</p>
              <p className="app-display mt-0.5 truncate font-bold t-ink">{emAndamento.veiculo}</p>
              <p className="text-xs font-semibold t-brand">
                {ACOMP_LABEL[emAndamento.status] ?? emAndamento.status}
              </p>
            </div>
            <ChevronRight className="size-5 shrink-0 t-muted" />
          </Link>
        )}
      </section>

      <section>
        <SectionHeading title="Meus veículos" actionLabel="Ver todos" actionHref="/app/veiculos" />
        {veiculos.length ? (
          <VehicleCarousel veiculos={veiculos} />
        ) : (
          <div className="app-card p-5 text-sm t-muted">Nenhum veículo cadastrado ainda.</div>
        )}
      </section>

      {principal && (
        <section>
          <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Próxima revisão</h2>
          <NextServiceCard veiculo={principal} />
        </section>
      )}

      <section>
        <SectionHeading
          title="Últimos reparos"
          actionLabel="Ver histórico"
          actionHref="/app/historico"
        />
        {reparos.length ? (
          <div className="app-card divide-y divide-[var(--app-line)] px-4">
            {reparos.map((r) => (
              <RepairRow key={r.id} reparo={r} />
            ))}
          </div>
        ) : (
          <div className="app-card p-5 text-sm t-muted">Você ainda não tem serviços registrados.</div>
        )}
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Serviços rápidos</h2>
        <QuickActions />
      </section>
    </div>
  );
}
