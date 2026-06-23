import { requireClientId } from "@/lib/auth";
import { getCliente, getVeiculos, getReparosRecentes } from "@/lib/client-data";
import { business } from "../_data/business";
import { SectionHeading } from "./_components/section-heading";
import { VehicleCarousel } from "./_components/vehicle-carousel";
import { NextServiceCard } from "./_components/next-service-card";
import { RepairRow } from "./_components/repair-row";
import { QuickActions } from "./_components/quick-actions";

export default async function HomePage() {
  const clientId = await requireClientId();
  const [cliente, veiculos, reparos] = await Promise.all([
    getCliente(clientId),
    getVeiculos(clientId),
    getReparosRecentes(clientId),
  ]);
  const principal = veiculos[0];

  return (
    <div className="space-y-7 px-5 pb-8 pt-2">
      <header>
        <h1 className="app-display text-2xl font-extrabold t-ink">
          Olá, {cliente?.primeiroNome ?? "cliente"}! 👋
        </h1>
        <p className="mt-0.5 text-sm t-muted">Bem-vindo à {business.name}</p>
      </header>

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
