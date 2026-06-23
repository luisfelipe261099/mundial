import Link from "next/link";
import { Plus } from "lucide-react";
import { getOrdens } from "@/lib/admin-data";
import { OrdersTable } from "../_components/orders-table";

export default async function OrdensPage() {
  const ordens = await getOrdens();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm adm-muted">{ordens.length} ordens de serviço</p>
        <Link
          href="/oficina/ordens/nova"
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <Plus className="size-4" />
          Nova OS
        </Link>
      </div>
      <OrdersTable ordens={ordens} />
    </div>
  );
}
