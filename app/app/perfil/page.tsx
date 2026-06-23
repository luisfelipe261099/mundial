import {
  Hash,
  Phone,
  Smartphone,
  Mail,
  MapPin,
  Download,
  Bell,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { requireClientId } from "@/lib/auth";
import { getCliente } from "@/lib/client-data";
import { logout } from "../../login/actions";

const AJUSTES = [
  { icon: Bell, label: "Notificações" },
  { icon: ShieldCheck, label: "Privacidade e segurança" },
  { icon: Settings, label: "Preferências" },
];

export default async function PerfilPage() {
  const clientId = await requireClientId();
  const cliente = await getCliente(clientId);
  if (!cliente) return null;

  const DADOS = [
    { icon: Hash, label: "CPF", value: cliente.cpf },
    { icon: Phone, label: "Telefone", value: cliente.telefone },
    { icon: Smartphone, label: "WhatsApp", value: cliente.whatsapp },
    { icon: Mail, label: "E-mail", value: cliente.email },
    { icon: MapPin, label: "Endereço", value: cliente.endereco },
  ];

  return (
    <div className="space-y-6 px-5 pb-8 pt-4">
      <div className="flex flex-col items-center text-center">
        <span className="app-display grid size-20 place-items-center rounded-full bg-[var(--app-brand)] text-2xl font-bold text-white">
          {cliente.iniciais}
        </span>
        <p className="app-display mt-3 text-xl font-bold t-ink">{cliente.nome}</p>
        <p className="text-sm t-muted">{cliente.email}</p>
      </div>

      <div className="app-card flex items-center gap-3 p-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--app-brand)]/15">
          <Smartphone className="size-5 t-brand" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold t-ink">Instalar na tela inicial</p>
          <p className="text-xs t-muted">Use como um app, sem loja de aplicativos.</p>
        </div>
        <Download className="size-5 shrink-0 t-muted" />
      </div>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Dados pessoais</h2>
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {DADOS.map((d) => {
            const Icon = d.icon;
            return (
              <div key={d.label} className="flex items-center gap-3 py-3">
                <Icon className="size-5 shrink-0 t-muted" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs t-muted">{d.label}</p>
                  <p className="text-sm font-semibold t-ink">{d.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">Ajustes</h2>
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {AJUSTES.map((a) => {
            const Icon = a.icon;
            return (
              <button key={a.label} type="button" className="flex w-full items-center gap-3 py-3.5 text-left">
                <Icon className="size-5 shrink-0 t-muted" />
                <span className="flex-1 text-sm font-medium t-ink">{a.label}</span>
                <ChevronRight className="size-4 shrink-0 t-muted" />
              </button>
            );
          })}
        </div>
      </section>

      <form action={logout}>
        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/30 py-3 text-sm font-semibold text-rose-300 transition-colors hover:bg-rose-500/10"
        >
          <LogOut className="size-4" />
          Sair da conta
        </button>
      </form>
    </div>
  );
}
