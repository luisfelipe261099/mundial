import Link from "next/link";
import { Plus } from "lucide-react";
import { brl } from "../_data/mock";
import { getClientes } from "@/lib/admin-data";
import { PageHeader } from "../_components/ui";
import { ClientsTable } from "../_components/clients-table";

export default async function ClientesPage() {
  const clientes = await getClientes();
  const cidades = new Set(clientes.map((c) => c.cidade)).size;
  const faturado = clientes.reduce((s, c) => s + c.gastoTotal, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Base de clientes"
        title="Clientes"
        description="Todos os clientes cadastrados na oficina, com contato, cidade e histórico de gastos."
        stats={[
          { label: "clientes", value: clientes.length.toString() },
          { label: "cidades", value: cidades.toString() },
          { label: "faturado", value: brl(faturado) },
        ]}
        action={
          <Link
            href="/oficina/clientes/novo"
            className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
          >
            <Plus className="size-4" />
            Novo cliente
          </Link>
        }
      />
      <ClientsTable clientes={clientes} />
    </div>
  );
}
