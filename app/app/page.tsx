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
      <header>
        <p className="app-mono text-[0.6rem] t-brand">{business.name}</p>
        <h1 className="app-display mt-1.5 text-[1.9rem] leading-none t-ink">
          Olá, {cliente?.primeiroNome ?? "cliente"}
        </h1>
        <p className="mt-1.5 text-sm t-muted">Sua garagem, sob controle.</p>
      </header>

      {emAndamento && (
        <Link href="/app/acompanhar" className="app-card flex items-center gap-4 p-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--app-brand)]/15">
            <Activity className="size-6 t-brand" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs t-muted">Seu carro na oficina</p>
            <p className="app-display truncate font-bold t-ink">{emAndamento.veiculo}</p>
            <p className="text-xs font-semibold t-brand">
              {ACOMP_LABEL[emAndamento.status] ?? emAndamento.status}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 t-muted" />
        </Link>
      )}

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
