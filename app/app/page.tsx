import { business } from "../_data/business";
import { cliente, veiculos, reparosRecentes } from "./_data/mock";
import { SectionHeading } from "./_components/section-heading";
import { VehicleCarousel } from "./_components/vehicle-carousel";
import { NextServiceCard } from "./_components/next-service-card";
import { RepairRow } from "./_components/repair-row";
import { QuickActions } from "./_components/quick-actions";

export default function HomePage() {
  const principal = veiculos[0];

  return (
    <div className="space-y-7 px-5 pb-8 pt-2">
      <header>
        <h1 className="app-display text-2xl font-extrabold t-ink">
          Olá, {cliente.primeiroNome}! 👋
        </h1>
        <p className="mt-0.5 text-sm t-muted">Bem-vindo à {business.name}</p>
      </header>

      <section>
        <SectionHeading title="Meus veículos" actionLabel="Ver todos" actionHref="/app/veiculos" />
        <VehicleCarousel veiculos={veiculos} />
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Próxima revisão</h2>
        <NextServiceCard veiculo={principal} />
      </section>

      <section>
        <SectionHeading
          title="Últimos reparos"
          actionLabel="Ver histórico"
          actionHref="/app/historico"
        />
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {reparosRecentes.map((r) => (
            <RepairRow key={r.id} reparo={r} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Serviços rápidos</h2>
        <QuickActions />
      </section>
    </div>
  );
}
