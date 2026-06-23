import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Hash,
  Phone,
  Smartphone,
  Mail,
  MapPin,
  Car,
  ClipboardList,
  Wallet,
  ChevronRight,
} from "lucide-react";
import {
  getCliente,
  veiculosAdmin,
  ordens,
  brl,
  osBadgeClass,
} from "../../_data/mock";

export default async function ClienteDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cliente = getCliente(id);
  if (!cliente) notFound();

  const veiculos = veiculosAdmin.filter((v) => v.proprietario === cliente.nome);
  const os = ordens.filter((o) => o.cliente === cliente.nome);

  const contato = [
    { icon: Hash, label: "CPF", value: cliente.cpf },
    { icon: Phone, label: "Telefone", value: cliente.telefone },
    { icon: Smartphone, label: "WhatsApp", value: cliente.whatsapp },
    { icon: Mail, label: "E-mail", value: cliente.email },
    { icon: MapPin, label: "Cidade", value: cliente.cidade },
  ];

  const kpis = [
    { icon: Car, label: "Veículos", value: veiculos.length.toString() },
    { icon: ClipboardList, label: "Ordens de serviço", value: os.length.toString() },
    { icon: Wallet, label: "Gasto total", value: brl(cliente.gastoTotal) },
  ];

  return (
    <div className="space-y-6">
      <Link href="/oficina/clientes" className="inline-flex items-center gap-1.5 text-sm font-semibold adm-muted hover:adm-brand">
        <ArrowLeft className="size-4" />
        Clientes
      </Link>

      {/* cabeçalho */}
      <div className="flex items-center gap-4">
        <span className="adm-display grid size-14 shrink-0 place-items-center rounded-full bg-[var(--ad-brand)]/15 text-lg font-bold adm-brand">
          {cliente.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
        </span>
        <div>
          <h2 className="adm-display text-2xl font-bold adm-ink">{cliente.nome}</h2>
          <p className="text-sm adm-muted">{cliente.cidade} · cliente desde {cliente.desde}</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="adm-card p-4">
              <Icon className="size-5 adm-brand" />
              <p className="adm-display mt-2 text-xl font-bold adm-ink">{k.value}</p>
              <p className="text-xs adm-muted">{k.label}</p>
            </div>
          );
        })}
      </div>

      {/* contato */}
      <div className="adm-card p-5">
        <h3 className="adm-display mb-4 font-bold adm-ink">Contato</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {contato.map((c) => {
            const Icon = c.icon;
            return (
              <div key={c.label} className="flex items-center gap-3">
                <Icon className="size-5 shrink-0 adm-muted" />
                <div className="min-w-0">
                  <p className="text-xs adm-muted">{c.label}</p>
                  <p className="truncate text-sm font-semibold adm-ink">{c.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* veículos */}
      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display font-bold adm-ink">Veículos</h3>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {veiculos.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Nenhum veículo cadastrado.</p>}
          {veiculos.map((v) => (
            <Link key={v.id} href={`/oficina/veiculos/${v.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--ad-surface-2)]">
              <Car className="size-5 shrink-0 adm-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold adm-ink">{v.modelo}</p>
                <p className="font-mono text-xs adm-muted">{v.placa}</p>
              </div>
              <ChevronRight className="size-4 shrink-0 adm-muted" />
            </Link>
          ))}
        </div>
      </div>

      {/* ordens */}
      <div className="adm-card overflow-hidden">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h3 className="adm-display font-bold adm-ink">Ordens de serviço</h3>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {os.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Nenhuma OS registrada.</p>}
          {os.map((o) => (
            <Link key={o.id} href={`/oficina/ordens/${o.id}`} className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--ad-surface-2)]">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold adm-ink">
                  <span className="font-mono adm-muted">{o.id}</span> · {o.veiculo}
                </p>
                <p className="text-xs adm-muted">{o.data}</p>
              </div>
              <span className={osBadgeClass[o.status]}>{o.status}</span>
              <span className="hidden w-20 text-right text-sm font-semibold adm-ink sm:block">{brl(o.total)}</span>
              <ChevronRight className="size-4 shrink-0 adm-muted" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
