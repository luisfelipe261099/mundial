"use client";

import { useState } from "react";
import { CheckCheck } from "lucide-react";
import { notificacoes as seed } from "../_data/mock";
import { CatChip } from "../_components/category";

export default function NotificacoesPage() {
  const [items, setItems] = useState(seed);
  const naoLidas = items.filter((n) => !n.lido).length;

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm t-muted">
          {naoLidas > 0 ? `${naoLidas} não lidas` : "Tudo em dia"}
        </p>
        {naoLidas > 0 && (
          <button
            type="button"
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, lido: true })))}
            className="flex items-center gap-1.5 text-sm font-semibold t-brand"
          >
            <CheckCheck className="size-4" />
            Marcar todas
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {items.map((n) => (
          <button
            key={n.id}
            type="button"
            onClick={() =>
              setItems((prev) =>
                prev.map((x) => (x.id === n.id ? { ...x, lido: !x.lido } : x))
              )
            }
            className={`flex w-full gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
              n.lido
                ? "border-[var(--app-line)] bg-[var(--app-surface)]"
                : "border-[var(--app-brand)]/30 bg-[var(--app-brand)]/10"
            }`}
          >
            <CatChip categoria={n.tipo} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="flex-1 truncate text-[0.95rem] font-semibold t-ink">{n.titulo}</p>
                {!n.lido && (
                  <span className="size-2 shrink-0 rounded-full bg-[var(--app-brand-2)]" />
                )}
              </div>
              <p className="mt-0.5 text-sm t-muted">{n.texto}</p>
              <p className="mt-1 text-xs t-muted">{n.quando}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
