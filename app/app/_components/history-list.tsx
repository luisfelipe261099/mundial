"use client";

import { useState } from "react";
import { OsRow } from "./os-row";
import type { OrdemServico } from "../_data/mock";

interface VeiculoOpt {
  id: string;
  modelo: string;
}

export function HistoryList({
  ordens,
  veiculos,
}: {
  ordens: OrdemServico[];
  veiculos: VeiculoOpt[];
}) {
  const [filtro, setFiltro] = useState("todos");
  const lista = filtro === "todos" ? ordens : ordens.filter((o) => o.veiculoId === filtro);

  const chips = [{ id: "todos", modelo: "Todos" }, ...veiculos];

  return (
    <div>
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {chips.map((c) => {
          const active = filtro === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setFiltro(c.id)}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                active
                  ? "border-[var(--app-brand)] bg-[var(--app-brand)] text-white"
                  : "border-[var(--app-line)] t-muted"
              }`}
            >
              {c.modelo}
            </button>
          );
        })}
      </div>

      <div className="mt-3 app-card divide-y divide-[var(--app-line)] px-4">
        {lista.map((os) => (
          <OsRow key={os.id} os={os} />
        ))}
      </div>
    </div>
  );
}
