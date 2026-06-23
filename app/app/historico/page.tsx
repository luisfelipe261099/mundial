import { ordensServico, veiculos } from "../_data/mock";
import { HistoryList } from "../_components/history-list";

export default function HistoricoPage() {
  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <p className="text-sm t-muted">{ordensServico.length} serviços realizados</p>
      <HistoryList
        ordens={ordensServico}
        veiculos={veiculos.map((v) => ({ id: v.id, modelo: v.modelo }))}
      />
    </div>
  );
}
