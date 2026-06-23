import Link from "next/link";
import {
  CalendarPlus,
  CalendarCheck,
  FileText,
  Wrench,
  ChevronRight,
} from "lucide-react";
import { catalogoServicos } from "../_data/mock";
import { CatChip } from "../_components/category";

const ATALHOS = [
  { label: "Agendar serviço", desc: "Escolha data e horário", href: "/app/agendar", icon: CalendarPlus },
  { label: "Meus agendamentos", desc: "Acompanhe o status", href: "/app/agendar", icon: CalendarCheck },
  { label: "Orçamentos", desc: "Aprovar ou rejeitar", href: "/app/orcamentos", icon: FileText },
  { label: "Histórico", desc: "Serviços já feitos", href: "/app/historico", icon: Wrench },
];

export default function ServicosPage() {
  return (
    <div className="space-y-6 px-5 pb-8 pt-3">
      <section>
        <div className="grid grid-cols-2 gap-3">
          {ATALHOS.map((a) => {
            const Icon = a.icon;
            return (
              <Link key={a.label} href={a.href} className="app-card flex flex-col gap-2.5 p-4">
                <span className="grid size-10 place-items-center rounded-xl bg-[var(--app-brand)]/15">
                  <Icon className="size-5 t-brand" />
                </span>
                <div>
                  <p className="text-sm font-bold t-ink">{a.label}</p>
                  <p className="text-xs t-muted">{a.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="app-display mb-3 text-[1.05rem] font-bold t-ink">
          Catálogo de serviços
        </h2>
        <div className="app-card divide-y divide-[var(--app-line)] px-4">
          {catalogoServicos.map((s) => (
            <Link key={s.nome} href="/app/agendar" className="flex items-center gap-3 py-3">
              <CatChip categoria={s.categoria} />
              <span className="flex-1 text-[0.95rem] font-semibold t-ink">{s.nome}</span>
              <ChevronRight className="size-4 t-muted" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
