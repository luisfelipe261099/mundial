"use client";

import { useState, useTransition } from "react";
import { Check, Save } from "lucide-react";
import { salvarConfiguracoes } from "../actions";

const inputCls =
  "mt-1 w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

type Inicial = {
  shopName: string;
  phone: string;
  whatsapp: string;
  address: string;
  notifOleo: boolean;
  notifRevisao: boolean;
  notifIpva: boolean;
  notifPromo: boolean;
};

type NotifKey = "notifOleo" | "notifRevisao" | "notifIpva" | "notifPromo";
const NOTIFS: { key: NotifKey; label: string }[] = [
  { key: "notifOleo", label: "Lembrete de troca de óleo" },
  { key: "notifRevisao", label: "Lembrete de revisão" },
  { key: "notifIpva", label: "Lembrete de IPVA / licenciamento" },
  { key: "notifPromo", label: "Promoções e campanhas" },
];

export function SettingsForm({ inicial }: { inicial: Inicial }) {
  const [form, setForm] = useState<Inicial>(inicial);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function salvar() {
    setSaved(false);
    const payload = { ...form };
    startTransition(async () => {
      await salvarConfiguracoes(payload);
      setSaved(true);
    });
  }

  return (
    <form
      data-tour="adm-settings"
      onSubmit={(e) => {
        e.preventDefault();
        salvar();
      }}
      className="space-y-6"
    >
      <div className="adm-card">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h2 className="adm-display font-bold adm-ink">Dados da oficina</h2>
        </div>
        <div className="space-y-4 p-5">
          <label className="block">
            <span className="text-xs font-medium adm-muted">Nome</span>
            <input className={inputCls} value={form.shopName} onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))} />
          </label>
          <label className="block">
            <span className="text-xs font-medium adm-muted">Endereço</span>
            <input className={inputCls} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium adm-muted">Telefone</span>
              <input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-xs font-medium adm-muted">WhatsApp</span>
              <input className={inputCls} value={form.whatsapp} onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))} />
            </label>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
          <h2 className="adm-display font-bold adm-ink">Notificações automáticas</h2>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {NOTIFS.map((n) => (
            <div key={n.key} className="flex items-center justify-between px-5 py-3.5">
              <span className="text-sm adm-ink">{n.label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={form[n.key]}
                onClick={() => setForm((f) => ({ ...f, [n.key]: !f[n.key] }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  form[n.key] ? "bg-[var(--ad-brand)]" : "bg-[var(--ad-surface-2)]"
                }`}
              >
                <span className={`size-4 rounded-full bg-white transition-transform ${form[n.key] ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="adm-btn-primary px-5 py-2.5 text-sm"
        >
          <Save className="size-4" />
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
        {saved && !pending && (
          <span className="flex items-center gap-1 text-sm font-medium text-emerald-400">
            <Check className="size-4" /> Salvo
          </span>
        )}
      </div>
    </form>
  );
}
