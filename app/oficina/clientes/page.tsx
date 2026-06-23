import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { clientes, brl } from "../_data/mock";

export default function ClientesPage() {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm adm-muted">{clientes.length} clientes cadastrados</p>
        <Link
          href="/oficina/clientes/novo"
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          <Plus className="size-4" />
          Novo cliente
        </Link>
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Telefone</th>
                <th className="px-5 py-3 font-semibold">Cidade</th>
                <th className="px-5 py-3 text-center font-semibold">Veículos</th>
                <th className="px-5 py-3 text-right font-semibold">Gasto total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/clientes/${c.id}`} className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--ad-brand)]/15 text-xs font-bold adm-brand">
                        {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                      <span className="font-semibold adm-ink">{c.nome}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 adm-muted">{c.telefone}</td>
                  <td className="px-5 py-3.5 adm-muted">{c.cidade}</td>
                  <td className="px-5 py-3.5 text-center adm-ink">{c.veiculos}</td>
                  <td className="px-5 py-3.5 text-right font-semibold adm-ink">{brl(c.gastoTotal)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/clientes/${c.id}`} className="inline-flex adm-muted hover:adm-brand">
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
