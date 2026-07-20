import { requireClientId } from "@/lib/auth";
import { getOrdens, getVeiculos } from "@/lib/client-data";
import { HistoryList } from "../_components/history-list";
import { AppHeader } from "../_components/app-header";

export default async function HistoricoPage() {
  const clientId = await requireClientId();
  const [ordens, veiculos] = await Promise.all([getOrdens(clientId), getVeiculos(clientId)]);

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <AppHeader
        eyebrow="Serviços"
        title="Histórico"
        description="Tudo que já passou pela oficina, do mais recente ao mais antigo."
        stats={[{ label: "realizados", value: ordens.length.toString() }]}
      />
      {ordens.length ? (
        <HistoryList ordens={ordens} veiculos={veiculos.map((v) => ({ id: v.id, modelo: v.modelo }))} />
      ) : (
        <div className="app-card p-5 text-sm t-muted">Você ainda não tem serviços no histórico.</div>
      )}
    </div>
  );
}
