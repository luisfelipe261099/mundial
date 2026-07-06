import { getSettings, getEquipe } from "@/lib/admin-data";
import { business, fullAddress } from "../../_data/business";
import { Panel } from "../_components/ui";
import { SettingsForm } from "../_components/settings-form";

export default async function ConfiguracoesPage() {
  const [settings, equipe] = await Promise.all([getSettings(), getEquipe()]);

  const inicial = {
    shopName: settings?.shopName ?? business.name,
    phone: settings?.phone ?? business.phoneDisplay,
    whatsapp: settings?.whatsapp ?? business.whatsappDisplay,
    address: settings?.address ?? fullAddress,
    notifOleo: settings?.notifOleo ?? true,
    notifRevisao: settings?.notifRevisao ?? true,
    notifIpva: settings?.notifIpva ?? true,
    notifPromo: settings?.notifPromo ?? false,
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <SettingsForm inicial={inicial} />

      <div className="space-y-6">
        <Panel title="Horário de funcionamento" bodyClass="divide-y divide-[var(--ad-line)]">
          {business.hours.map((h) => (
            <div key={h.days} className="flex items-center justify-between px-5 py-3.5 text-sm">
              <span className="adm-ink">{h.days}</span>
              <span className="adm-muted">{h.time}</span>
            </div>
          ))}
        </Panel>

        <Panel title="Equipe" bodyClass="divide-y divide-[var(--ad-line)]">
          {equipe.length === 0 && <p className="px-5 py-3.5 text-sm adm-muted">Nenhum usuário cadastrado.</p>}
          {equipe.map((e) => (
            <div key={e.nome} className="flex items-center gap-3 px-5 py-3.5">
              <span className="adm-display grid size-9 place-items-center rounded-full bg-[var(--ad-brand)]/15 text-sm font-bold adm-brand">
                {e.nome
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </span>
              <span className="flex-1 text-sm font-semibold adm-ink">{e.nome}</span>
              <span className="text-xs adm-muted">{e.papel}</span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
