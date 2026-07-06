import Link from "next/link";
import { Plus, ClipboardCheck } from "lucide-react";
import { getOrdens } from "@/lib/admin-data";
import { OrdersTable } from "../_components/orders-table";

export default async function OrdensPage() {
  const ordens = await getOrdens();

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm adm-muted">{ordens.length} ordens de serviço</p>
        <div className="flex gap-2">
          <Link
            href="/oficina/ordens/nova"
            className="flex items-center gap-2 rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink transition-colors hover:bg-[var(--ad-surface-2)]"
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
      </div>
      <OrdersTable ordens={ordens} />
    </div>
  );
}
