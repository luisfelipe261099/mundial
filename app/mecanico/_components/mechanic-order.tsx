"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Camera, ChevronRight } from "lucide-react";
import {
  osBadgeClass,
  type OrdemServicoAdmin,
  type StatusOS,
} from "../../oficina/_data/mock";

const FLUXO: StatusOS[] = [
  "Aberta",
  "Aguardando aprovação",
  "Em execução",
  "Finalizada",
  "Entregue",
];

export function MechanicOrder({ os }: { os: OrdemServicoAdmin }) {
  const [status, setStatus] = useState<StatusOS>(os.status);
  const [fotos, setFotos] = useState<string[]>([
    "/images/real-diagnostic.jpg",
    "/images/real-garage.jpg",
  ]);
  const [obs, setObs] = useState(os.observacoes);
  const [salvo, setSalvo] = useState(false);

  const idx = FLUXO.indexOf(status);
  const proximo = idx < FLUXO.length - 1 ? FLUXO[idx + 1] : null;

  return (
    <div className="space-y-5 px-5 pb-8 pt-3">
      {/* cabeçalho */}
      <div className="mec-card p-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs mec-muted">{os.id}</span>
          <span className={osBadgeClass[status]}>{status}</span>
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
        <h2 className="mec-display mb-2 text-[1.05rem] font-bold mec-ink">Status do serviço</h2>
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
              onClick={() => setStatus(proximo)}
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

      {/* fotos */}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="mec-display text-[1.05rem] font-bold mec-ink">Fotos</h2>
          <button
            type="button"
            onClick={() =>
              setFotos((f) => [
                ...f,
                f.length % 2 ? "/images/real-diagnostic.jpg" : "/images/real-garage.jpg",
              ])
            }
            className="flex items-center gap-1.5 text-sm font-semibold mec-brand"
          >
            <Camera className="size-4" />
            Adicionar
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {fotos.map((src, i) => (
            <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-[var(--mec-line)]">
              <Image src={src} alt={`Foto ${i + 1}`} fill sizes="120px" className="object-cover" />
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
            setSalvo(false);
          }}
          rows={4}
          className="w-full resize-none rounded-xl border border-[var(--mec-line)] bg-[var(--mec-surface)] p-3 text-sm mec-ink outline-none placeholder:mec-muted focus:border-[var(--mec-brand)]"
          placeholder="Anote o que foi feito, peças trocadas, recomendações…"
        />
        <button
          type="button"
          onClick={() => setSalvo(true)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--mec-line)] py-3 text-sm font-semibold mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
        >
          {salvo ? (
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
