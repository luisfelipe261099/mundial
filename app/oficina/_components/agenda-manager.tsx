"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  STATUS_AGENDAMENTO,
  STATUS_INATIVOS,
  agruparPorDia,
  badgeAdmin,
  type StatusAgendamento,
} from "@/lib/agendamentos";
import type { AgendaItem } from "@/lib/admin-data";
import {
  atualizarAgendamento,
  criarAgendamento,
  excluirAgendamento,
  mudarStatusAgendamento,
} from "../actions";
import { AgendaForm, deItem, type AgendaFormValor } from "./agenda-form";
import type { ClienteOpt, VeiculoOpt } from "./client-picker";
import { matches } from "./filter-utils";
import { FilterChip, FilterSelect, ResultBar, SearchInput } from "./table-filters";

const STATUS_FILTRO = ["Todos", ...STATUS_AGENDAMENTO];

export function AgendaManager({
  seed,
  clientes,
  veiculos,
  hoje,
}: {
  seed: AgendaItem[];
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
  hoje: string;
}) {
  const [itens, setItens] = useState<AgendaItem[]>(seed);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("Todos");
  const [soFuturos, setSoFuturos] = useState(true);
  const [criando, setCriando] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Sincroniza a lista quando o servidor manda dados novos (depois de
  // router.refresh()). É o padrão oficial do React de ajustar estado durante o
  // render quando uma prop muda — sem isso o item recém-criado ficaria para
  // sempre com o id provisório, e editá-lo mandaria "tmp-…" para o Prisma.
  const [seedAnterior, setSeedAnterior] = useState(seed);
  if (seed !== seedAnterior) {
    setSeedAnterior(seed);
    setItens(seed);
  }

  /** Depois de gravar, busca do servidor para trocar o id provisório pelo real. */
  function aplicar(acao: () => Promise<void>) {
    startTransition(async () => {
      await acao();
      router.refresh();
    });
  }

  const filtrados = itens.filter(
    (a) =>
      matches([a.cliente, a.veiculo, a.placa, a.servico], busca) &&
      (status === "Todos" || a.status === status) &&
      (!soFuturos || a.data >= hoje)
  );
  const { futuros, passados } = agruparPorDia(filtrados, hoje);
  const filtroAtivo = busca !== "" || status !== "Todos" || !soFuturos;

  function salvarNovo(v: AgendaFormValor) {
    setItens((x) => [
      {
        // Provisório até o router.refresh() trazer o registro real. O prefixo
        // "tmp-" é o que a linha usa para desabilitar editar/excluir/status.
        id: `tmp-${x.length}-${v.data}-${v.hora}`,
        data: v.data,
        hora: v.hora,
        clienteId: v.clienteId,
        cliente: v.cliente.trim() || "—",
        veiculoId: v.veiculoId,
        veiculo: v.veiculo.trim() || "—",
        placa: null,
        servico: v.servico.trim(),
        status: v.status as StatusAgendamento,
      },
      ...x,
    ]);
    setCriando(false);
    aplicar(() => criarAgendamento(v));
  }

  function salvarEdicao(id: string, v: AgendaFormValor) {
    setItens((x) =>
      x.map((a) =>
        a.id === id
          ? {
              ...a,
              data: v.data,
              hora: v.hora,
              clienteId: v.clienteId,
              cliente: v.cliente.trim() || "—",
              veiculoId: v.veiculoId,
              veiculo: v.veiculo.trim() || "—",
              servico: v.servico.trim(),
              status: v.status as StatusAgendamento,
            }
          : a
      )
    );
    setEditId(null);
    aplicar(() => atualizarAgendamento(id, v));
  }

  function trocarStatus(id: string, novo: string) {
    setItens((x) => x.map((a) => (a.id === id ? { ...a, status: novo as StatusAgendamento } : a)));
    aplicar(() => mudarStatusAgendamento(id, novo));
  }

  function excluir(id: string) {
    setItens((x) => x.filter((a) => a.id !== id));
    setDelId(null);
    aplicar(() => excluirAgendamento(id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar cliente, veículo, serviço…"
        />
        <FilterSelect
          value={status}
          onChange={setStatus}
          options={STATUS_FILTRO}
          ariaLabel="Filtrar por status"
        />
        <FilterChip active={soFuturos} onClick={() => setSoFuturos((s) => !s)}>
          Só a partir de hoje
        </FilterChip>
        <ResultBar
          shown={filtrados.length}
          total={itens.length}
          active={filtroAtivo}
          onClear={() => {
            setBusca("");
            setStatus("Todos");
            setSoFuturos(true);
          }}
        />
        <button
          type="button"
          onClick={() => {
            setCriando((c) => !c);
            setEditId(null);
          }}
          className="ml-auto flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
        >
          {criando ? <X className="size-4" /> : <Plus className="size-4" />}
          {criando ? "Cancelar" : "Novo agendamento"}
        </button>
      </div>

      {criando && (
        <AgendaForm
          titulo="Novo agendamento"
          clientes={clientes}
          veiculos={veiculos}
          onSalvar={salvarNovo}
          onCancelar={() => setCriando(false)}
        />
      )}

      {futuros.length === 0 && passados.length === 0 && (
        <p className="adm-card px-5 py-8 text-center text-sm adm-muted">
          Nenhum agendamento{filtroAtivo ? " para esses filtros" : ""}.
        </p>
      )}

      {futuros.map((g) => (
        <section key={g.iso} className="space-y-2">
          <h3 className="adm-display px-1 text-sm font-bold adm-ink">
            {g.rotulo}
            <span className="ml-2 text-xs font-normal adm-muted">{g.itens.length}</span>
          </h3>
          <div className="adm-card divide-y divide-[var(--ad-line)]">
            {g.itens.map((a) => (
              <Linha
                key={a.id}
                a={a}
                editando={editId === a.id}
                excluindo={delId === a.id}
                clientes={clientes}
                veiculos={veiculos}
                onEditar={() => {
                  setEditId(editId === a.id ? null : a.id);
                  setDelId(null);
                  setCriando(false);
                }}
                onSalvarEdicao={(v) => salvarEdicao(a.id, v)}
                onTrocarStatus={(s) => trocarStatus(a.id, s)}
                onPedirExcluir={() => {
                  setDelId(delId === a.id ? null : a.id);
                  setEditId(null);
                }}
                onExcluir={() => excluir(a.id)}
              />
            ))}
          </div>
        </section>
      ))}

      {passados.length > 0 && (
        <details className="adm-card px-5 py-3">
          <summary className="cursor-pointer text-sm font-semibold adm-muted">
            Anteriores ({passados.reduce((s, g) => s + g.itens.length, 0)})
          </summary>
          <div className="mt-3 space-y-4">
            {passados.map((g) => (
              <section key={g.iso}>
                <h4 className="mb-1 text-xs font-semibold adm-muted">{g.rotulo}</h4>
                <div className="divide-y divide-[var(--ad-line)]">
                  {g.itens.map((a) => (
                    <Linha
                      key={a.id}
                      a={a}
                      editando={editId === a.id}
                      excluindo={delId === a.id}
                      clientes={clientes}
                      veiculos={veiculos}
                      onEditar={() => {
                        setEditId(editId === a.id ? null : a.id);
                        setDelId(null);
                      }}
                      onSalvarEdicao={(v) => salvarEdicao(a.id, v)}
                      onTrocarStatus={(s) => trocarStatus(a.id, s)}
                      onPedirExcluir={() => {
                        setDelId(delId === a.id ? null : a.id);
                        setEditId(null);
                      }}
                      onExcluir={() => excluir(a.id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Linha({
  a,
  editando,
  excluindo,
  clientes,
  veiculos,
  onEditar,
  onSalvarEdicao,
  onTrocarStatus,
  onPedirExcluir,
  onExcluir,
}: {
  a: AgendaItem;
  editando: boolean;
  excluindo: boolean;
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
  onEditar: () => void;
  onSalvarEdicao: (v: AgendaFormValor) => void;
  onTrocarStatus: (s: string) => void;
  onPedirExcluir: () => void;
  onExcluir: () => void;
}) {
  const inativo = STATUS_INATIVOS.includes(a.status);
  // Item recém-criado, ainda sem id real do banco: editar/excluir/mudar status
  // mandariam "tmp-…" para o Prisma. Some assim que o router.refresh() chega.
  const provisorio = a.id.startsWith("tmp-");
  const btnCls =
    "grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)] disabled:opacity-30";

  return (
    <div className={inativo ? "opacity-50" : ""}>
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <div className="w-14 shrink-0 text-center">
          <p className="adm-display text-base font-bold adm-ink">{a.hora}</p>
        </div>
        <div className="h-10 w-px shrink-0 bg-[var(--ad-line)]" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold adm-ink">{a.servico}</p>
          <p className="truncate text-xs adm-muted">
            {a.cliente}
            {a.clienteId ? "" : " · avulso"} · {a.veiculo}
            {a.placa ? ` · ${a.placa}` : ""}
          </p>
        </div>

        <span className={badgeAdmin[a.status]}>{a.status}</span>

        {provisorio ? (
          <span className="text-xs adm-muted">salvando…</span>
        ) : (
          <FilterSelect
            value={a.status}
            onChange={onTrocarStatus}
            options={[...STATUS_AGENDAMENTO]}
            ariaLabel={`Status de ${a.servico}`}
          />
        )}

        {!provisorio && a.clienteId && a.veiculoId && (
          <Link
            href={`/oficina/entrada?cliente=${a.clienteId}&veiculo=${a.veiculoId}`}
            className="flex items-center gap-1 rounded-md border border-[var(--ad-brand)] px-2.5 py-1 text-xs font-semibold adm-brand"
          >
            Cliente chegou
            <ArrowRight className="size-3.5" />
          </Link>
        )}

        <button
          type="button"
          onClick={onEditar}
          disabled={provisorio}
          aria-label={`Editar ${a.servico}`}
          className={btnCls}
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={onPedirExcluir}
          disabled={provisorio}
          aria-label={`Excluir ${a.servico}`}
          className={`${btnCls} hover:border-red-500/50 hover:text-red-400`}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {editando && (
        <div className="px-5 pb-4">
          <AgendaForm
            titulo="Editar agendamento"
            inicial={deItem(a)}
            clientes={clientes}
            veiculos={veiculos}
            onSalvar={onSalvarEdicao}
            onCancelar={onEditar}
          />
        </div>
      )}

      {excluindo && (
        <div className="flex flex-wrap items-center gap-3 bg-red-500/5 px-5 py-3">
          <p className="text-sm adm-ink">
            Excluir o agendamento de <span className="font-semibold">{a.servico}</span>?
          </p>
          <button
            type="button"
            onClick={onExcluir}
            className="rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
          >
            Excluir de vez
          </button>
          <button
            type="button"
            onClick={onPedirExcluir}
            className="rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
