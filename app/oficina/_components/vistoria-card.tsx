"use client";

import { useState, useTransition } from "react";
import { Camera, Check, ClipboardList, Pencil } from "lucide-react";
import type { Vistoria } from "@/lib/admin-data";
import { salvarVistoria } from "../os-actions";
import { FotoUpload } from "./foto-upload";
import {
  CHECKLIST_ITENS,
  VISTORIA_COR,
  VISTORIA_LABEL,
  VISTORIA_STATUS,
} from "../_data/vistoria";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

// Vistoria de entrada dentro da OS: dá pra conferir, corrigir e — o que mais
// pesa numa discussão com cliente — guardar as fotos do carro como ele chegou.
// A OS aberta pelo balcão ou por pedido do app nasce sem vistoria; aqui o
// admin preenche depois.
export function VistoriaCard({
  osId,
  vistoria,
  authorized,
}: {
  osId: string;
  vistoria: Vistoria | null;
  authorized: boolean;
}) {
  const salvos = vistoria?.checklist ?? [];
  // Itens da lista padrão + qualquer item antigo que não esteja mais nela.
  const itens = [
    ...CHECKLIST_ITENS,
    ...salvos.map((c) => c.item).filter((i) => !CHECKLIST_ITENS.includes(i)),
  ];

  const [editando, setEditando] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, string>>(() =>
    Object.fromEntries(itens.map((i) => [i, salvos.find((c) => c.item === i)?.status ?? "ok"]))
  );
  const [avarias, setAvarias] = useState(vistoria?.avarias ?? "");
  const [objetos, setObjetos] = useState(vistoria?.objetos ?? "");
  const [fotos, setFotos] = useState<string[]>(vistoria?.fotos ?? []);
  const [salvo, setSalvo] = useState(false);
  const [pending, startTransition] = useTransition();

  const preenchida = salvos.length > 0;

  function salvarFichas() {
    startTransition(async () => {
      await salvarVistoria(osId, {
        checklist: itens.map((item) => ({ item, status: checklist[item] ?? "ok" })),
        avarias,
        objetos,
      });
      setEditando(false);
      setSalvo(true);
    });
  }

  function trocarFotos(novas: string[]) {
    setFotos(novas);
    setSalvo(false);
    startTransition(async () => {
      await salvarVistoria(osId, { fotos: novas });
      setSalvo(true);
    });
  }

  const linhas = preenchida
    ? salvos
    : itens.map((item) => ({ item, status: checklist[item] ?? "ok" }));

  return (
    <div className="adm-card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--ad-line)] px-5 py-3.5">
        <h3 className="adm-display flex items-center gap-2 font-bold adm-ink">
          <ClipboardList className="size-5 adm-brand" />
          Vistoria de entrada
        </h3>
        <div className="flex items-center gap-2">
          {salvo && !pending && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Check className="size-3.5" />
              Salvo
            </span>
          )}
          <span className={authorized ? "osb osb-finalizada" : "osb osb-aguardando"}>
            {authorized ? "Autorizada" : "Sem autorização"}
          </span>
          {!editando && (
            <button
              type="button"
              onClick={() => setEditando(true)}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-3 py-1.5 text-xs font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
            >
              <Pencil className="size-3.5" />
              {preenchida ? "Editar" : "Preencher"}
            </button>
          )}
        </div>
      </div>

      {editando ? (
        <div className="p-5">
          <div className="divide-y divide-[var(--ad-line)]">
            {itens.map((item) => (
              <div key={item} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                <span className="text-sm adm-ink">{item}</span>
                <div className="flex gap-1 rounded-lg border border-[var(--ad-line)] p-0.5">
                  {VISTORIA_STATUS.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setChecklist((c) => ({ ...c, [item]: s.key }))}
                      className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                        checklist[item] === s.key ? s.on : "adm-muted hover:adm-ink"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium adm-muted">
                Avarias / observações
              </label>
              <textarea
                value={avarias}
                onChange={(e) => setAvarias(e.target.value)}
                rows={2}
                placeholder="Riscos, amassados, itens danificados…"
                className={`${inputCls} resize-none`}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium adm-muted">
                Objetos no veículo
              </label>
              <textarea
                value={objetos}
                onChange={(e) => setObjetos(e.target.value)}
                rows={2}
                placeholder="Pertences deixados no carro…"
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={pending}
              onClick={salvarFichas}
              className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
            >
              <Check className="size-4" />
              {pending ? "Salvando…" : "Salvar vistoria"}
            </button>
            <button
              type="button"
              onClick={() => setEditando(false)}
              className="rounded-lg border border-[var(--ad-line)] px-5 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          {preenchida ? (
            <div className="grid gap-x-6 gap-y-2 p-5 sm:grid-cols-2">
              {linhas.map((c) => (
                <div key={c.item} className="flex items-center justify-between py-1 text-sm">
                  <span className="adm-ink">{c.item}</span>
                  <span className={`font-semibold ${VISTORIA_COR[c.status] ?? "adm-muted"}`}>
                    {VISTORIA_LABEL[c.status] ?? c.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="px-5 pt-5 text-sm adm-muted">
              Esta OS não passou pelo “Dar entrada”, então não tem checklist. Clique em
              <span className="font-semibold adm-ink"> Preencher</span> para registrar o
              estado do carro.
            </p>
          )}

          {(avarias || objetos) && (
            <div className="grid gap-4 border-t border-[var(--ad-line)] p-5 sm:grid-cols-2">
              {avarias && (
                <div>
                  <p className="text-xs uppercase tracking-wide adm-muted">Avarias</p>
                  <p className="mt-1 text-sm adm-ink">{avarias}</p>
                </div>
              )}
              {objetos && (
                <div>
                  <p className="text-xs uppercase tracking-wide adm-muted">Objetos no veículo</p>
                  <p className="mt-1 text-sm adm-ink">{objetos}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Fotos: sempre disponíveis, mesmo sem entrar no modo de edição */}
      <div className="border-t border-[var(--ad-line)] p-5">
        <div className="mb-1 flex items-center gap-2">
          <Camera className="size-4 adm-brand" />
          <h4 className="text-sm font-semibold adm-ink">Fotos do carro na entrada</h4>
        </div>
        <p className="mb-3 text-xs adm-muted">
          Saem no PDF da OS, logo abaixo da vistoria.
        </p>
        <FotoUpload
          fotos={fotos}
          onChange={trocarFotos}
          osId={osId}
          kind="vistoria"
          vazio="Nenhuma foto da entrada."
        />
      </div>
    </div>
  );
}
