import { requireClientId } from "@/lib/auth";
import { getOrdensAtivas } from "@/lib/client-data";

const FLUXO = ["Aberta", "Aguardando aprovação", "Em execução", "Finalizada", "Entregue"];
const LABEL: Record<string, string> = {
  Aberta: "Recebido",
  "Aguardando aprovação": "Orçamento",
  "Em execução": "Em serviço",
  Finalizada: "Pronto",
  Entregue: "Entregue",
};

export default async function AcompanharPage() {
  const clientId = await requireClientId();
  const ordens = await getOrdensAtivas(clientId);

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <p className="text-sm t-muted">Acompanhe em que etapa está o seu carro.</p>

      {ordens.length === 0 && (
        <div className="app-card p-6 text-center text-sm t-muted">
          Nenhum carro seu está na oficina agora.
        </div>
      )}

      {ordens.map((o) => {
        const idx = FLUXO.indexOf(o.status);
        return (
          <div key={o.id} className="app-card p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="app-display truncate font-bold t-ink">{o.veiculo}</p>
                <p className="font-mono text-xs t-muted">{o.id}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[var(--app-brand)]/15 px-3 py-1 text-xs font-semibold t-brand">
                {LABEL[o.status] ?? o.status}
              </span>
            </div>

            <div className="mt-5 flex items-center">
              {FLUXO.map((s, i) => {
                const done = i <= idx;
                return (
                  <div key={s} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`size-3 rounded-full ${done ? "bg-[var(--app-brand)]" : "bg-[var(--app-surface-2)]"}`} />
                      <span className={`text-center text-[0.6rem] leading-tight ${done ? "t-brand" : "t-muted"}`}>
                        {LABEL[s]}
                      </span>
                    </div>
                    {i < FLUXO.length - 1 && (
                      <div className={`mx-1 h-0.5 flex-1 ${i < idx ? "bg-[var(--app-brand)]" : "bg-[var(--app-surface-2)]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
