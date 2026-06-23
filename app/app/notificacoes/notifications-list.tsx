"use client";

import { useState, useTransition } from "react";
import { CheckCheck } from "lucide-react";
import { CatChip } from "../_components/category";
import type { Notificacao } from "../_data/mock";
import { marcarLida, marcarTodas } from "./actions";

export function NotificationsList({ initial }: { initial: Notificacao[] }) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const naoLidas = items.filter((n) => !n.lido).length;

  function toggle(n: Notificacao) {
    const novo = !n.lido;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, lido: novo } : x)));
    startTransition(() => marcarLida(n.id, novo));
  }

  function todas() {
    setItems((prev) => prev.map((n) => ({ ...n, lido: true })));
    startTransition(() => marcarTodas());
  }

  if (items.length === 0) {
    return (
      <div className="px-5 pt-3">
        <div className="app-card p-5 text-sm t-muted">Nenhuma notificação no momento.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-5 pb-8 pt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm t-muted">{naoLidas > 0 ? `${naoLidas} não lidas` : "Tudo em dia"}</p>
        {naoLidas > 0 && (
          <button
            type="button"
            onClick={todas}
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
            onClick={() => toggle(n)}
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
                {!n.lido && <span className="size-2 shrink-0 rounded-full bg-[var(--app-brand-2)]" />}
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
