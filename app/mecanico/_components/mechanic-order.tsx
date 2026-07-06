"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Check, Camera, ChevronRight, Plus, Trash2, ClipboardList } from "lucide-react";
import { brl, osBadgeClass, type StatusOS, type Produto } from "../../oficina/_data/mock";
import type { OsControle } from "@/lib/admin-data";
import {
  mudarStatus,
  adicionarItemOS,
  removerItemOS,
  salvarTechChecklist,
  salvarFotos,
} from "../../oficina/os-actions";
import { salvarObservacoes } from "../actions";

const FLUXO: StatusOS[] = ["Aberta", "Aguardando aprovação", "Em execução", "Finalizada", "Entregue"];
const CHECKLIST_TEC = [
  "Motor",
  "Freios",
  "Suspensão",
  "Pneus",
  "Óleo / fluidos",
  "Elétrica",
  "Ar-condicionado",
  "Escapamento",
];
const STATUS3 = [
  { key: "ok", label: "OK", on: "bg-emerald-600 text-white" },
  { key: "atencao", label: "Atenção", on: "bg-amber-500 text-white" },
  { key: "avaria", label: "Avaria", on: "bg-rose-600 text-white" },
];

const inputCls =
  "w-full rounded-lg border border-[var(--mec-line)] bg-[var(--mec-surface)] px-3 py-2 text-sm mec-ink outline-none focus:border-[var(--mec-brand)]";

export function MechanicOrder({ os, estoque }: { os: OsControle; estoque: Produto[] }) {
  const [pending, startTransition] = useTransition();
  const run = (fn: () => Promise<unknown>) => startTransition(() => void fn());

  const idx = FLUXO.indexOf(os.status as StatusOS);
  const proximo = idx >= 0 && idx < FLUXO.length - 1 ? FLUXO[idx + 1] : null;

  // vistoria técnica
  const [check, setCheck] = useState<Record<string, string>>(() => {
    const saved = new Map((os.techChecklist ?? []).map((c) => [c.item, c.status]));
    return Object.fromEntries(CHECKLIST_TEC.map((i) => [i, saved.get(i) ?? "ok"]));
  });
  const [checkSalvo, setCheckSalvo] = useState(false);

  // itens
  const [draft, setDraft] = useState({ tipo: "Peça", descricao: "", qtd: 1, valor: 0, productId: "" });

  // fotos (Vercel Blob)
  const [fotos, setFotos] = useState<string[]>(os.fotos ?? []);
  const [enviando, setEnviando] = useState(false);
  const [erroFoto, setErroFoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function enviarFotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setErroFoto(null);
    setEnviando(true);
    try {
      const novas: string[] = [];
      for (const file of Array.from(files)) {
        const blob = await upload(`os/${os.id}/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        novas.push(blob.url);
      }
      const todas = [...fotos, ...novas];
      setFotos(todas);
      run(() => salvarFotos(os.id, todas));
    } catch {
      setErroFoto("Não foi possível enviar. Configure o Vercel Blob (veja docs/INTEGRACOES.md).");
    } finally {
      setEnviando(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removerFoto(url: string) {
    const todas = fotos.filter((f) => f !== url);
    setFotos(todas);
    run(() => salvarFotos(os.id, todas));
  }

  // observações
  const [obs, setObs] = useState(os.observacoes);
  const [obsSalvo, setObsSalvo] = useState(false);

  function addItem() {
    if (!draft.descricao.trim() || draft.valor <= 0) return;
    const payload = { ...draft, productId: draft.productId || undefined };
    setDraft({ tipo: "Peça", descricao: "", qtd: 1, valor: 0, productId: "" });
    run(() => adicionarItemOS(os.id, payload));
  }

  return (
    <div className="space-y-5 px-5 pb-8 pt-3">
      {/* cabeçalho */}
      <div className="mec-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs mec-muted">{os.id}</span>
          <span className={osBadgeClass[os.status as StatusOS]}>{os.status}</span>
        </div>
        <p className="mec-display mt-1.5 text-lg font-bold mec-ink">{os.veiculo}</p>
        <p className="text-xs mec-muted">
          {os.cliente} · <span className="font-mono">{os.placa}</span> · {os.km.toLocaleString("pt-BR")} km
        </p>
      </div>

      {/* defeito */}
      <div className="mec-card p-4">
        <p className="text-xs uppercase tracking-wide mec-muted">Defeito relatado</p>
        <p className="mt-1.5 text-sm mec-ink">{os.defeito}</p>
      </div>

      {/* status */}
      <section>
        <h2 className="mec-display mb-2 text-[1.05rem] font-bold mec-ink">Status</h2>
        <div className="mec-card p-4">
          <div className="flex flex-wrap gap-2">
            {FLUXO.map((s, i) => (
              <span
                key={s}
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  i <= idx ? "bg-[var(--mec-brand)] text-white" : "bg-[var(--mec-surface-2)] mec-muted"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
          {proximo ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => mudarStatus(os.id, proximo))}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[var(--mec-brand)] py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
            >
              Avançar para “{proximo}”
              <ChevronRight className="size-4" />
            </button>
          ) : (
            <p className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-500/15 py-3 text-sm font-semibold text-emerald-400">
              <Check className="size-4" />
              Serviço concluído e entregue
            </p>
          )}
        </div>
      </section>

      {/* vistoria técnica */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="mec-display flex items-center gap-2 text-[1.05rem] font-bold mec-ink">
            <ClipboardList className="size-5 mec-brand" />
            Vistoria técnica
          </h2>
        </div>
        <div className="mec-card divide-y divide-[var(--mec-line)] px-4">
          {CHECKLIST_TEC.map((item) => (
            <div key={item} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
              <span className="text-sm mec-ink">{item}</span>
              <div className="flex gap-1 rounded-lg border border-[var(--mec-line)] p-0.5">
                {STATUS3.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setCheck((c) => ({ ...c, [item]: s.key }));
                      setCheckSalvo(false);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                      check[item] === s.key ? s.on : "mec-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => {
            setCheckSalvo(true);
            run(() => salvarTechChecklist(os.id, CHECKLIST_TEC.map((i) => ({ item: i, status: check[i] }))));
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--mec-line)] py-3 text-sm font-semibold mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
        >
          {checkSalvo ? (
            <>
              <Check className="size-4 text-emerald-400" />
              Vistoria salva
            </>
          ) : (
            "Salvar vistoria técnica"
          )}
        </button>
      </section>

      {/* peças e serviços */}
      <section>
        <h2 className="mec-display mb-2 text-[1.05rem] font-bold mec-ink">Peças e serviços</h2>
        <div className="mec-card divide-y divide-[var(--mec-line)] px-4">
          {os.itens.length === 0 && <p className="py-3 text-sm mec-muted">Nenhum item ainda.</p>}
          {os.itens.map((it) => (
            <div key={it.id} className="flex items-center gap-2 py-2.5">
              <span className="rounded-md bg-[var(--mec-surface-2)] px-2 py-0.5 text-xs mec-muted">{it.tipo}</span>
              <span className="min-w-0 flex-1 truncate text-sm mec-ink">{it.descricao}</span>
              <span className="text-xs mec-muted">×{it.qtd}</span>
              <span className="text-sm font-semibold mec-ink">{brl(it.valor * it.qtd)}</span>
              <button type="button" disabled={pending} onClick={() => run(() => removerItemOS(it.id, os.id))} aria-label="Remover">
                <Trash2 className="size-4 text-rose-400" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 space-y-2 rounded-xl border border-[var(--mec-line)] p-3">
          <div className="grid grid-cols-2 gap-2">
            <select value={draft.tipo} onChange={(e) => setDraft((d) => ({ ...d, tipo: e.target.value, productId: e.target.value === "Serviço" ? "" : d.productId }))} className={inputCls}>
              <option value="Peça">Peça</option>
              <option value="Serviço">Serviço</option>
            </select>
            <input type="number" min={0} value={draft.valor || ""} onChange={(e) => setDraft((d) => ({ ...d, valor: Number(e.target.value) }))} placeholder="Valor R$" className={inputCls} />
          </div>
          <input value={draft.descricao} onChange={(e) => setDraft((d) => ({ ...d, descricao: e.target.value, productId: "" }))} placeholder="Descrição" className={inputCls} />
          {draft.tipo === "Peça" && estoque.length > 0 && (
            <select
              value={draft.productId}
              onChange={(e) => {
                const p = estoque.find((x) => x.id === e.target.value);
                setDraft((d) => ({ ...d, productId: e.target.value, descricao: p ? p.produto : d.descricao }));
              }}
              className={inputCls}
            >
              <option value="">Vincular ao estoque (opcional)…</option>
              {estoque.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.produto} ({p.qtd} un.)
                </option>
              ))}
            </select>
          )}
          <button type="button" onClick={addItem} disabled={pending || !draft.descricao.trim() || draft.valor <= 0} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--mec-brand)] py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1d4ed8] disabled:opacity-40">
            <Plus className="size-4" />
            Adicionar item
          </button>
        </div>
      </section>

      {/* fotos */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="mec-display text-[1.05rem] font-bold mec-ink">Fotos</h2>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={enviando}
            className="flex items-center gap-1.5 text-sm font-semibold mec-brand disabled:opacity-50"
          >
            <Camera className="size-4" />
            {enviando ? "Enviando…" : "Adicionar"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            hidden
            onChange={(e) => enviarFotos(e.target.files)}
          />
        </div>
        {erroFoto && (
          <p className="mb-2 rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300">{erroFoto}</p>
        )}
        {fotos.length === 0 && !enviando && <p className="text-sm mec-muted">Nenhuma foto ainda.</p>}
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((src) => (
            <div
              key={src}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--mec-line)]"
            >
              <Image src={src} alt="Foto da OS" fill sizes="120px" className="object-cover" unoptimized />
              <button
                type="button"
                onClick={() => removerFoto(src)}
                aria-label="Remover foto"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* observações */}
      <section>
        <h2 className="mec-display mb-2 text-[1.05rem] font-bold mec-ink">Observações</h2>
        <textarea
          value={obs}
          onChange={(e) => {
            setObs(e.target.value);
            setObsSalvo(false);
          }}
          rows={4}
          className="w-full resize-none rounded-xl border border-[var(--mec-line)] bg-[var(--mec-surface)] p-3 text-sm mec-ink outline-none focus:border-[var(--mec-brand)]"
          placeholder="O que foi feito, peças trocadas, recomendações…"
        />
        <button
          type="button"
          onClick={() => {
            setObsSalvo(true);
            run(() => salvarObservacoes(os.id, obs));
          }}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--mec-line)] py-3 text-sm font-semibold mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
        >
          {obsSalvo ? (
            <>
              <Check className="size-4 text-emerald-400" />
              Observações salvas
            </>
          ) : (
            "Salvar observações"
          )}
        </button>
      </section>
    </div>
  );
}
