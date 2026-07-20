"use client";

import { useState, useTransition } from "react";
import { Check, ChevronLeft, ChevronRight, CalendarCheck, RotateCcw } from "lucide-react";
import { CatChip } from "./category";
import { criarAgendamento } from "../agendar/actions";

interface VeiculoOpt {
  id: string;
  modelo: string;
  placa: string;
}
interface ServicoOpt {
  nome: string;
  categoria: string;
}

const DATAS = [
  "Seg · 23/06",
  "Ter · 24/06",
  "Qua · 25/06",
  "Qui · 26/06",
  "Sex · 27/06",
  "Sáb · 28/06",
];

const PASSOS = ["Veículo", "Serviço", "Data", "Horário"];

export function BookingFlow({
  veiculos,
  servicos,
  horarios,
}: {
  veiculos: VeiculoOpt[];
  servicos: ServicoOpt[];
  horarios: string[];
}) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [veiculo, setVeiculo] = useState<VeiculoOpt | null>(null);
  const [servico, setServico] = useState<ServicoOpt | null>(null);
  const [data, setData] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const selecionado = [veiculo, servico, data, hora][step];
  const ultimo = step === PASSOS.length - 1;

  function reset() {
    setStep(0);
    setDone(false);
    setVeiculo(null);
    setServico(null);
    setData(null);
    setHora(null);
  }

  if (done) {
    return (
      <div className="app-card p-6 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-7 text-emerald-400" />
        </span>
        <p className="app-display mt-4 text-lg font-bold t-ink">Agendamento confirmado!</p>
        <p className="mt-1 text-sm t-muted">
          {servico?.nome} · {veiculo?.modelo}
        </p>
        <p className="text-sm t-muted">
          {data} às {hora}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[var(--app-brand)]/15 px-3 py-1 text-xs font-semibold t-brand">
          <CalendarCheck className="size-4" />
          Você receberá a confirmação no WhatsApp
        </div>
        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-5 flex items-center gap-2 text-sm font-semibold t-brand"
        >
          <RotateCcw className="size-4" />
          Novo agendamento
        </button>
      </div>
    );
  }

  const baseOpt =
    "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors";
  const sel = (on: boolean) =>
    on
      ? "border-[var(--app-brand)] bg-[var(--app-brand)]/12"
      : "border-[var(--app-line)] hover:border-[var(--app-brand)]/40";

  return (
    <div data-tour="app-booking" className="app-card space-y-4 p-4">
      {/* progresso */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold t-muted">
            Passo {step + 1} de {PASSOS.length} · {PASSOS[step]}
          </p>
        </div>
        <div className="mt-2 flex gap-1.5">
          {PASSOS.map((p, i) => (
            <span
              key={p}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[var(--app-brand)]" : "bg-[var(--app-surface-2)]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* conteúdo do passo */}
      {step === 0 && (
        <div className="space-y-2">
          {veiculos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setVeiculo(v)}
              className={`${baseOpt} ${sel(veiculo?.id === v.id)}`}
            >
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--app-brand)]/15 text-xs font-bold t-brand">
                {v.modelo.charAt(0)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold t-ink">{v.modelo}</span>
                <span className="block font-mono text-xs t-muted">{v.placa}</span>
              </span>
              {veiculo?.id === v.id && <Check className="size-5 t-brand" />}
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          {servicos.map((s) => (
            <button
              key={s.nome}
              type="button"
              onClick={() => setServico(s)}
              className={`${baseOpt} ${sel(servico?.nome === s.nome)}`}
            >
              <CatChip categoria={s.categoria} className="!size-9" />
              <span className="flex-1 text-sm font-semibold t-ink">{s.nome}</span>
              {servico?.nome === s.nome && <Check className="size-5 t-brand" />}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-2 gap-2">
          {DATAS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setData(d)}
              className={`rounded-xl border py-3 text-sm font-semibold t-ink transition-colors ${sel(
                data === d
              )}`}
            >
              {d}
            </button>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="grid grid-cols-3 gap-2">
          {horarios.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setHora(h)}
              className={`rounded-xl border py-3 text-sm font-semibold t-ink transition-colors ${sel(
                hora === h
              )}`}
            >
              {h}
            </button>
          ))}
        </div>
      )}

      {/* navegação */}
      <div className="flex items-center gap-3 pt-1">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="app-card-2 flex items-center gap-1 px-4 py-3 text-sm font-semibold t-ink"
          >
            <ChevronLeft className="size-4" />
            Voltar
          </button>
        )}
        <button
          type="button"
          disabled={!selecionado}
          onClick={() => {
            if (!ultimo) {
              setStep((s) => s + 1);
              return;
            }
            setDone(true);
            if (veiculo && servico && data && hora) {
              startTransition(() =>
                criarAgendamento({
                  veiculoNome: veiculo.modelo,
                  servico: servico.nome,
                  data,
                  hora,
                })
              );
            }
          }}
          className="app-btn-primary flex-1 py-3 text-sm"
        >
          {ultimo ? "Confirmar agendamento" : "Continuar"}
          {!ultimo && <ChevronRight className="size-4" />}
        </button>
      </div>
    </div>
  );
}
