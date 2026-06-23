import { business, fullAddress } from "../../_data/business";
import { Panel } from "../_components/ui";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-medium adm-muted">{label}</label>
      <div className="mt-1 rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink">
        {value}
      </div>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        on ? "bg-[var(--ad-brand)]" : "bg-[var(--ad-surface-2)]"
      }`}
    >
      <span className={`size-4 rounded-full bg-white transition-transform ${on ? "translate-x-6" : "translate-x-1"}`} />
    </span>
  );
}

const NOTIFS = [
  { label: "Lembrete de troca de óleo", on: true },
  { label: "Lembrete de revisão", on: true },
  { label: "Lembrete de IPVA / licenciamento", on: true },
  { label: "Promoções e campanhas", on: false },
];

const EQUIPE = [
  { nome: "Carlos Andrade", papel: "Mecânico" },
  { nome: "André Lima", papel: "Mecânico" },
  { nome: "Administração", papel: "Administrador" },
];

export default function ConfiguracoesPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Dados da oficina" bodyClass="p-5 space-y-4">
        <Field label="Nome" value={business.name} />
        <Field label="Endereço" value={fullAddress} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone" value={business.phoneDisplay} />
          <Field label="WhatsApp" value={business.whatsappDisplay} />
        </div>
      </Panel>

      <Panel title="Horário de funcionamento" bodyClass="divide-y divide-[var(--ad-line)]">
        {business.hours.map((h) => (
          <div key={h.days} className="flex items-center justify-between px-5 py-3.5 text-sm">
            <span className="adm-ink">{h.days}</span>
            <span className="adm-muted">{h.time}</span>
          </div>
        ))}
      </Panel>

      <Panel title="Notificações automáticas" bodyClass="divide-y divide-[var(--ad-line)]">
        {NOTIFS.map((n) => (
          <div key={n.label} className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm adm-ink">{n.label}</span>
            <Toggle on={n.on} />
          </div>
        ))}
      </Panel>

      <Panel title="Equipe" bodyClass="divide-y divide-[var(--ad-line)]">
        {EQUIPE.map((e) => (
          <div key={e.nome} className="flex items-center gap-3 px-5 py-3.5">
            <span className="adm-display grid size-9 place-items-center rounded-full bg-[var(--ad-brand)]/15 text-sm font-bold adm-brand">
              {e.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </span>
            <span className="flex-1 text-sm font-semibold adm-ink">{e.nome}</span>
            <span className="text-xs adm-muted">{e.papel}</span>
          </div>
        ))}
      </Panel>
    </div>
  );
}
