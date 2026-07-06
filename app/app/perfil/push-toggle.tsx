"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { salvarPushSubscription } from "./push-actions";

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

type Estado = "carregando" | "indisponivel" | "desligado" | "ligado" | "negado" | "trabalhando";

export function PushToggle() {
  const [estado, setEstado] = useState<Estado>("carregando");

  useEffect(() => {
    const suportado = "serviceWorker" in navigator && "PushManager" in window && !!VAPID;
    if (!suportado) return setEstado("indisponivel");
    if (Notification.permission === "denied") return setEstado("negado");
    navigator.serviceWorker
      .getRegistration()
      .then(async (reg) => {
        const sub = await reg?.pushManager.getSubscription();
        setEstado(sub ? "ligado" : "desligado");
      })
      .catch(() => setEstado("desligado"));
  }, []);

  async function ativar() {
    if (!VAPID) return;
    setEstado("trabalhando");
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return setEstado("negado");
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID),
      });
      const j = sub.toJSON();
      await salvarPushSubscription({ endpoint: j.endpoint!, p256dh: j.keys!.p256dh, auth: j.keys!.auth });
      setEstado("ligado");
    } catch {
      setEstado("desligado");
    }
  }

  if (estado === "indisponivel") return null;

  const ligado = estado === "ligado";
  return (
    <div className="app-card flex items-center gap-3 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--app-brand)]/15">
        {ligado ? <BellRing className="size-5 t-brand" /> : <Bell className="size-5 t-brand" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold t-ink">Avisos no celular</p>
        <p className="text-xs t-muted">
          {estado === "ligado" && "Ativado — você recebe lembretes de manutenção."}
          {estado === "desligado" && "Receba troca de óleo, revisão e IPVA no celular."}
          {estado === "negado" && "Permissão bloqueada — libere nas configurações do navegador."}
          {estado === "carregando" && "Verificando…"}
          {estado === "trabalhando" && "Ativando…"}
        </p>
      </div>
      {estado !== "ligado" && estado !== "negado" && (
        <button
          type="button"
          onClick={ativar}
          disabled={estado === "trabalhando" || estado === "carregando"}
          className="shrink-0 rounded-lg bg-[var(--app-brand)] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Ativar
        </button>
      )}
      {ligado && <span className="shrink-0 text-xs font-semibold text-emerald-400">Ativo</span>}
    </div>
  );
}
