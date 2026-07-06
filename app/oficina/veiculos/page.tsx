import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { getVeiculos } from "@/lib/admin-data";

export default async function VeiculosAdminPage() {
  const veiculos = await getVeiculos();

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm adm-muted">{veiculos.length} veículos cadastrados</p>
        <Link
          href="/oficina/veiculos/novo"
          className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
        >
          <Plus className="size-4" />
          Novo veículo
        </Link>
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Proprietário</th>
                <th className="px-5 py-3 font-semibold">Modelo</th>
                <th className="px-5 py-3 font-semibold">Placa</th>
                <th className="px-5 py-3 text-center font-semibold">Ano</th>
                <th className="px-5 py-3 text-right font-semibold">KM</th>
                <th className="px-5 py-3 font-semibold">Próxima revisão</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5 font-semibold adm-ink">{v.proprietario}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/veiculos/${v.id}`} className="adm-brand hover:underline">
                      {v.modelo}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono adm-muted">{v.placa}</td>
                  <td className="px-5 py-3.5 text-center adm-muted">{v.ano}</td>
                  <td className="px-5 py-3.5 text-right adm-muted">{v.km.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3.5">
                    {v.revisaoVencida ? (
                      <span className="osb osb-aguardando">Vencida · {v.proximaRevisao}</span>
                    ) : (
                      <span className="adm-muted">{v.proximaRevisao}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/veiculos/${v.id}`} className="inline-flex adm-muted hover:adm-brand">
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
