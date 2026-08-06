"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, Car, ChevronRight, Trash2 } from "lucide-react";
import { excluirCliente, excluirVeiculo } from "../actions";

type Carro = { id: string; modelo: string; placa: string };

const btnPerigo = "rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-50";
const btnCancelar = "rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted";
const btnIcone =
  "grid size-8 shrink-0 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:border-red-500/50 hover:text-red-400";

// Lista de veículos do cliente com exclusão por linha (a linha inteira continua
// clicável para abrir o veículo — o botão fica fora do link).
export function VeiculosDoCliente({ veiculos }: { veiculos: Carro[] }) {
  const [lista, setLista] = useState(veiculos);
  const [delId, setDelId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function excluir(id: string) {
    const antes = lista;
    setLista((x) => x.filter((v) => v.id !== id));
    setDelId(null);
    setErro(null);
    startTransition(async () => {
      const r = await excluirVeiculo(id);
      if (r.error) {
        setLista(antes);
        setErro(r.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="adm-card overflow-hidden">
      <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
        <h3 className="adm-display font-bold adm-ink">Veículos</h3>
      </div>
      <div className="divide-y divide-[var(--ad-line)]">
        {lista.length === 0 && <p className="px-5 py-4 text-sm adm-muted">Nenhum veículo cadastrado.</p>}
        {lista.map((v) => (
          <div key={v.id}>
            <div className="flex items-center gap-3 px-5 py-3.5">
              <Link href={`/oficina/veiculos/${v.id}`} className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80">
                <Car className="size-5 shrink-0 adm-muted" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold adm-ink">{v.modelo}</span>
                  <span className="block font-mono text-xs adm-muted">{v.placa}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 adm-muted" />
              </Link>
              <button
                type="button"
                onClick={() => setDelId((id) => (id === v.id ? null : v.id))}
                aria-label={`Excluir veículo ${v.placa}`}
                className={btnIcone}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            {delId === v.id && (
              <div className="flex flex-wrap items-center gap-3 bg-red-500/5 px-5 py-3">
                <AlertTriangle className="size-4 shrink-0 text-red-400" />
                <p className="text-sm adm-ink">
                  Excluir <span className="font-semibold">{v.modelo}</span>?
                  <span className="adm-muted"> As OS dele ficam no histórico, sem o vínculo.</span>
                </p>
                <button type="button" onClick={() => excluir(v.id)} disabled={pending} className={btnPerigo}>
                  Excluir de vez
                </button>
                <button type="button" onClick={() => setDelId(null)} className={btnCancelar}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
        ))}
        {erro && <p className="px-5 py-3 text-sm text-rose-300">{erro}</p>}
      </div>
    </div>
  );
}

export function ExcluirClienteCard({
  id,
  nome,
  veiculos,
  ordens,
}: {
  id: string;
  nome: string;
  veiculos: number;
  ordens: number;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function excluir() {
    setErro(null);
    startTransition(async () => {
      const r = await excluirCliente(id);
      if (r.error) setErro(r.error);
      else router.push("/oficina/clientes");
    });
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
      <h3 className="adm-display mb-1 flex items-center gap-2 font-bold adm-ink">
        <AlertTriangle className="size-4 text-red-400" />
        Excluir cliente
      </h3>
      <p className="mb-4 text-sm adm-muted">
        Apaga <span className="font-semibold adm-ink">{nome}</span>
        {veiculos > 0 && ` e ${veiculos} veículo${veiculos > 1 ? "s" : ""}`}, junto com os lembretes e o acesso ao app.
        {ordens > 0 && ` As ${ordens} OS continuam no histórico da oficina, só sem o vínculo com o cliente.`} Não dá pra
        desfazer.
      </p>
      {confirmando ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={excluir} disabled={pending} className={btnPerigo}>
            {pending ? "Excluindo…" : "Confirmar exclusão"}
          </button>
          <button type="button" onClick={() => setConfirmando(false)} className={btnCancelar}>
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="size-4" />
          Excluir cliente
        </button>
      )}
      {erro && <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}
    </div>
  );
}

export function ExcluirVeiculoCard({ id, modelo, placa }: { id: string; modelo: string; placa: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function excluir() {
    setErro(null);
    startTransition(async () => {
      const r = await excluirVeiculo(id);
      if (r.error) setErro(r.error);
      else router.push("/oficina/veiculos");
    });
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
      <h3 className="adm-display mb-1 flex items-center gap-2 font-bold adm-ink">
        <AlertTriangle className="size-4 text-red-400" />
        Excluir veículo
      </h3>
      <p className="mb-4 text-sm adm-muted">
        Apaga <span className="font-semibold adm-ink">{modelo}</span> (<span className="font-mono">{placa}</span>) e os
        lembretes dele. As OS continuam no histórico, só sem o vínculo. Não dá pra desfazer.
      </p>
      {confirmando ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={excluir} disabled={pending} className={btnPerigo}>
            {pending ? "Excluindo…" : "Confirmar exclusão"}
          </button>
          <button type="button" onClick={() => setConfirmando(false)} className={btnCancelar}>
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirmando(true)}
          className="flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="size-4" />
          Excluir veículo
        </button>
      )}
      {erro && <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}
    </div>
  );
}
