import Link from "next/link";
import { Plus, ClipboardCheck } from "lucide-react";
import { getOrdens } from "@/lib/admin-data";
import { OrdersTable } from "../_components/orders-table";
import { PageHeader } from "../_components/ui";

const ABERTAS = ["Aberta", "Aguardando aprovação", "Em execução"];

export default async function OrdensPage() {
  const ordens = await getOrdens();
  const abertas = ordens.filter((o) => ABERTAS.includes(o.status)).length;

  return (
    <div>
      <PageHeader
        eyebrow="Fluxo da oficina"
        title="Ordens de Serviço"
        description="Acompanhe cada OS da entrada à entrega. Filtre por status abaixo."
        stats={[
          { label: "no total", value: ordens.length.toString() },
          { label: "abertas", value: abertas.toString(), accent: abertas > 0 },
        ]}
        action={
          <div className="flex gap-2">
            <Link
              href="/oficina/ordens/nova"
              className="flex items-center gap-2 rounded-lg border border-[var(--ad-line-2)] bg-[var(--ad-surface-2)] px-4 py-2.5 text-sm font-semibold adm-ink transition-colors hover:bg-[var(--ad-surface-3)]"
            >
              <Plus className="size-4" />
              Nova OS
            </Link>
            <Link
              href="/oficina/entrada"
              className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
            >
              <ClipboardCheck className="size-4" />
              Dar entrada
            </Link>
          </div>
        }
      />
      <OrdersTable ordens={ordens} />
    </div>
  );
}
