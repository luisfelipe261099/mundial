"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRightLeft, AlertTriangle } from "lucide-react";
import { criarVeiculo, transferirVeiculo, type ConflitoPlaca } from "../../actions";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none transition-colors focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

const COMBUSTIVEIS = ["Flex", "Gasolina", "Diesel", "Híbrido", "Elétrico"];

const vazio = {
  proprietario: "",
  modelo: "",
  placa: "",
  motor: "",
  ano: "",
  km: "",
  combustivel: "",
  cor: "",
};

export function NovoVeiculoForm({ clientes }: { clientes: { id: string; nome: string }[] }) {
  const router = useRouter();
  const [v, setV] = useState(vazio);
  const [criado, setCriado] = useState(false);
  const [transferido, setTransferido] = useState<ConflitoPlaca | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  // Placa já cadastrada em outro cliente: o carro foi vendido e a gente
  // oferece passar o veículo para o novo dono, em vez de barrar o cadastro.
  const [conflito, setConflito] = useState<ConflitoPlaca | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (k: keyof typeof vazio, valor: string) => {
    setV((x) => ({ ...x, [k]: valor }));
    setErro(null);
    setConflito(null);
  };
  const pode = v.proprietario !== "" && v.modelo.trim() !== "" && v.placa.trim() !== "";

  function salvar() {
    setErro(null);
    setConflito(null);
    startTransition(async () => {
      try {
        const r = await criarVeiculo(v);
        if (r.conflito) {
          setConflito(r.conflito);
          setErro(r.error ?? null);
          return;
        }
        if (r.error) {
          setErro(r.error);
          return;
        }
        setCriado(true);
        router.refresh();
      } catch {
        setErro("Não foi possível salvar agora. Confira os dados e tente de novo.");
      }
    });
  }

  function transferir(c: ConflitoPlaca) {
    setErro(null);
    startTransition(async () => {
      const r = await transferirVeiculo(c.veiculoId, c.novoDonoId);
      if (r.error) {
        setErro(r.error);
        return;
      }
      setConflito(null);
      setTransferido(c);
      router.refresh();
    });
  }

  // ── Transferência concluída ──
  if (transferido) {
    return (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <ArrowRightLeft className="size-8 text-emerald-400" />
        </span>
        <h2 className="adm-display mt-4 text-2xl font-bold adm-ink">Veículo transferido!</h2>
        <p className="mt-2 text-sm adm-muted">
          O {transferido.veiculoNome} agora está no nome de{" "}
          <strong className="adm-ink">{transferido.novoDonoNome}</strong>. O histórico de serviços
          do carro continua na ficha dele; as ordens antigas seguem no nome de{" "}
          {transferido.donoAtual}.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href={`/oficina/veiculos/${transferido.veiculoId}`}
            className="rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b5fe0]"
          >
            Abrir veículo
          </Link>
          <Link
            href="/oficina/veiculos"
            className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            Veículos
          </Link>
        </div>
      </div>
    );
  }

  // ── Cadastro concluído ──
  if (criado) {
    const resumo: [string, string][] = [
      ["Proprietário", v.proprietario],
      ["Modelo", v.modelo],
      ["Placa", v.placa.toUpperCase()],
      ["Motor", v.motor],
      ["Ano", v.ano],
      ["Quilometragem", v.km],
      ["Combustível", v.combustivel],
      ["Cor", v.cor],
    ];
    return (
      <div className="mx-auto max-w-md py-6 text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15">
          <Check className="size-8 text-emerald-400" />
        </span>
        <h2 className="adm-display mt-4 text-2xl font-bold adm-ink">Veículo cadastrado!</h2>
        <div className="adm-card mt-5 space-y-2 p-5 text-left text-sm">
          {resumo
            .filter(([, valor]) => valor.trim() !== "")
            .map(([rotulo, valor]) => (
              <div key={rotulo} className="flex justify-between gap-3">
                <span className="adm-muted">{rotulo}</span>
                <span className="truncate text-right adm-ink">{valor}</span>
              </div>
            ))}
        </div>
        <div className="mt-5 flex justify-center gap-3">
          <Link
            href="/oficina/veiculos"
            className="rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b5fe0]"
          >
            Veículos
          </Link>
          <button
            type="button"
            onClick={() => {
              setV(vazio);
              setCriado(false);
            }}
            className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
          >
            Cadastrar outro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/oficina/veiculos" className="text-sm font-semibold adm-muted hover:adm-brand">
        ← Veículos
      </Link>

      <div className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">Cadastrar veículo</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="nv-dono">
              Proprietário <span className="text-rose-400">*</span>
            </label>
            <select
              id="nv-dono"
              className={inputCls}
              value={v.proprietario}
              onChange={(e) => set("proprietario", e.target.value)}
            >
              <option value="">Selecione…</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="nv-modelo">
              Modelo (marca + modelo) <span className="text-rose-400">*</span>
            </label>
            <input id="nv-modelo" className={inputCls} value={v.modelo} onChange={(e) => set("modelo", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="nv-placa">
              Placa <span className="text-rose-400">*</span>
            </label>
            <input id="nv-placa" className={inputCls} value={v.placa} onChange={(e) => set("placa", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="nv-motor">Motor (ex.: 1.0 Flex)</label>
            <input id="nv-motor" className={inputCls} value={v.motor} onChange={(e) => set("motor", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="nv-ano">Ano</label>
            <input id="nv-ano" type="number" className={inputCls} value={v.ano} onChange={(e) => set("ano", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="nv-km">Quilometragem</label>
            <input id="nv-km" type="number" className={inputCls} value={v.km} onChange={(e) => set("km", e.target.value)} />
          </div>
          <div>
            <label className={labelCls} htmlFor="nv-comb">Combustível</label>
            <select id="nv-comb" className={inputCls} value={v.combustivel} onChange={(e) => set("combustivel", e.target.value)}>
              <option value="">Selecione…</option>
              {COMBUSTIVEIS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="nv-cor">Cor</label>
            <input id="nv-cor" className={inputCls} value={v.cor} onChange={(e) => set("cor", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Placa de um carro que já está no sistema — provavelmente vendido. */}
      {conflito && (
        <div className="adm-card border-amber-500/40 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div className="min-w-0">
              <h3 className="adm-display font-bold adm-ink">Esse carro já está no sistema</h3>
              <p className="mt-1.5 text-sm adm-muted">
                A placa <strong className="adm-ink">{v.placa.toUpperCase()}</strong> é do{" "}
                <strong className="adm-ink">{conflito.veiculoNome}</strong>, hoje no nome de{" "}
                <strong className="adm-ink">{conflito.donoAtual}</strong>.
              </p>
              <p className="mt-2 text-sm adm-muted">
                Se o carro foi vendido para{" "}
                <strong className="adm-ink">{conflito.novoDonoNome}</strong>, transfira o veículo: a
                placa e o histórico de manutenção continuam os mesmos e as ordens antigas seguem no
                nome do dono anterior.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => transferir(conflito)}
                  className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
                >
                  <ArrowRightLeft className="size-4" />
                  {pending ? "Transferindo…" : `Transferir para ${conflito.novoDonoNome}`}
                </button>
                <Link
                  href={`/oficina/veiculos/${conflito.veiculoId}`}
                  className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-ink hover:bg-[var(--ad-surface-2)]"
                >
                  Ver veículo
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {erro && !conflito && (
        <p className="rounded-lg bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{erro}</p>
      )}

      <button
        type="button"
        disabled={!pode || pending}
        onClick={salvar}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--ad-brand)] py-3.5 text-sm font-semibold text-white transition-colors enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
      >
        <Check className="size-5" />
        {pending ? "Salvando…" : "Cadastrar veículo"}
      </button>
    </div>
  );
}
