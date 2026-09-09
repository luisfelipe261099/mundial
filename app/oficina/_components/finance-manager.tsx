"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Pencil,
  Trash2,
  Check,
  Download,
  Receipt,
} from "lucide-react";
import { brl } from "../_data/mock";
import { criarLancamento, editarLancamento, excluirLancamento } from "../actions";

export interface Lancamento {
  id: string;
  tipo: "receita" | "despesa";
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  /** AAAA-MM-DD, no fuso de Curitiba. */
  dia: string;
  iso: string;
  forma: string;
  observacoes: string;
  osId: string | null;
}

type Periodo = "mes" | "d30" | "d90" | "ano" | "tudo" | "custom";
const PERIODOS: { key: Periodo; label: string }[] = [
  { key: "mes", label: "Este mês" },
  { key: "d30", label: "30 dias" },
  { key: "d90", label: "90 dias" },
  { key: "ano", label: "Este ano" },
  { key: "tudo", label: "Tudo" },
];

const CATEGORIAS: Record<"receita" | "despesa", string[]> = {
  receita: ["Serviços", "Peças", "Outros"],
  despesa: ["Compras", "Peças", "Salários", "Aluguel", "Impostos", "Ferramentas", "Manutenção", "Outros"],
};
const FORMAS = ["Dinheiro", "PIX", "Cartão de débito", "Cartão de crédito", "Boleto", "Transferência"];

const TODAS_CAT = "Todas as categorias";
const TODAS_FORMAS = "Todas as formas";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

function hojeISO() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const vazio = (tipo: "receita" | "despesa" = "receita") => ({
  tipo,
  descricao: "",
  categoria: CATEGORIAS[tipo][0],
  valor: 0,
  data: hojeISO(),
  forma: "",
  observacoes: "",
});

export function FinanceManager({ seed }: { seed: Lancamento[] }) {
  const router = useRouter();
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [de, setDe] = useState("");
  const [ate, setAte] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "receita" | "despesa">("todos");
  const [filtroCat, setFiltroCat] = useState(TODAS_CAT);
  const [filtroForma, setFiltroForma] = useState(TODAS_FORMAS);
  const [busca, setBusca] = useState("");

  const [form, setForm] = useState(vazio());
  const [editId, setEditId] = useState<string | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // ── Filtro ──────────────────────────────────────────────────────────
  const janela = useMemo(() => {
    if (periodo === "custom") return { de, ate };
    if (periodo === "tudo") return { de: "", ate: "" };
    const agora = new Date();
    const iso = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    if (periodo === "mes") return { de: iso(new Date(agora.getFullYear(), agora.getMonth(), 1)), ate: "" };
    if (periodo === "ano") return { de: iso(new Date(agora.getFullYear(), 0, 1)), ate: "" };
    const dias = periodo === "d30" ? 30 : 90;
    return { de: iso(new Date(agora.getTime() - dias * 86_400_000)), ate: "" };
  }, [periodo, de, ate]);

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return seed.filter((l) => {
      if (janela.de && l.dia < janela.de) return false;
      if (janela.ate && l.dia > janela.ate) return false;
      if (filtroTipo !== "todos" && l.tipo !== filtroTipo) return false;
      if (filtroCat !== TODAS_CAT && l.categoria !== filtroCat) return false;
      if (filtroForma !== TODAS_FORMAS && (l.forma || "Não informado") !== filtroForma) return false;
      if (!termo) return true;
      return `${l.descricao} ${l.categoria} ${l.observacoes} ${l.osId ?? ""}`.toLowerCase().includes(termo);
    });
  }, [seed, janela, filtroTipo, filtroCat, filtroForma, busca]);

  const totalR = visiveis.filter((l) => l.tipo === "receita").reduce((s, l) => s + l.valor, 0);
  const totalD = visiveis.filter((l) => l.tipo === "despesa").reduce((s, l) => s + l.valor, 0);
  const saldo = totalR - totalD;

  const categorias = useMemo(
    () => [TODAS_CAT, ...Array.from(new Set(seed.map((l) => l.categoria))).sort()],
    [seed]
  );
  const formas = useMemo(
    () => [TODAS_FORMAS, ...Array.from(new Set(seed.map((l) => l.forma || "Não informado"))).sort()],
    [seed]
  );

  // Quebra por categoria do que está filtrado.
  const porCategoria = useMemo(() => {
    const m = new Map<string, { receita: number; despesa: number }>();
    for (const l of visiveis) {
      const a = m.get(l.categoria) ?? { receita: 0, despesa: 0 };
      if (l.tipo === "receita") a.receita += l.valor;
      else a.despesa += l.valor;
      m.set(l.categoria, a);
    }
    return [...m.entries()]
      .map(([nome, a]) => ({ nome, ...a, total: a.receita + a.despesa }))
      .sort((x, y) => y.total - x.total);
  }, [visiveis]);
  const maxCat = Math.max(1, ...porCategoria.map((c) => c.total));

  const filtroAtivo =
    periodo !== "mes" ||
    filtroTipo !== "todos" ||
    filtroCat !== TODAS_CAT ||
    filtroForma !== TODAS_FORMAS ||
    busca !== "";

  function limpar() {
    setPeriodo("mes");
    setDe("");
    setAte("");
    setFiltroTipo("todos");
    setFiltroCat(TODAS_CAT);
    setFiltroForma(TODAS_FORMAS);
    setBusca("");
  }

  // ── Ações ───────────────────────────────────────────────────────────
  function trocarTipo(t: "receita" | "despesa") {
    setForm((f) => ({ ...f, tipo: t, categoria: CATEGORIAS[t][0] }));
  }

  function salvar() {
    setErro(null);
    startTransition(async () => {
      const r = editId ? await editarLancamento(editId, form) : await criarLancamento(form);
      if (r.error) setErro(r.error);
      else {
        setForm(vazio(form.tipo));
        setEditId(null);
        router.refresh();
      }
    });
  }

  function abrirEdicao(l: Lancamento) {
    setErro(null);
    setEditId(l.id);
    setForm({
      tipo: l.tipo,
      descricao: l.descricao,
      categoria: l.categoria,
      valor: l.valor,
      data: l.dia,
      forma: l.forma,
      observacoes: l.observacoes,
    });
    document.getElementById("form-lancamento")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function apagar(id: string) {
    setErro(null);
    startTransition(async () => {
      const r = await excluirLancamento(id);
      if (r.error) setErro(r.error);
      else {
        setDelId(null);
        router.refresh();
      }
    });
  }

  function exportarCSV() {
    const linhas = [
      ["Data", "Tipo", "Descrição", "Categoria", "Forma de pagamento", "Valor", "OS", "Observações"],
      ...visiveis.map((l) => [
        l.data,
        l.tipo === "receita" ? "Receita" : "Despesa",
        l.descricao,
        l.categoria,
        l.forma || "—",
        (l.tipo === "receita" ? l.valor : -l.valor).toString(),
        l.osId ?? "",
        l.observacoes,
      ]),
    ];
    const csv = linhas
      .map((c) => c.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";"))
      .join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `financeiro-${janela.de || "inicio"}-a-${janela.ate || hojeISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const tiles = [
    { label: "Receitas", value: brl(totalR), icon: TrendingUp, cls: "bg-emerald-500/15 text-emerald-400" },
    { label: "Despesas", value: brl(totalD), icon: TrendingDown, cls: "bg-rose-500/15 text-rose-400" },
    {
      label: "Saldo",
      value: brl(saldo),
      icon: Wallet,
      cls: saldo >= 0 ? "bg-[var(--ad-brand)]/15 adm-brand" : "bg-rose-500/15 text-rose-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Filtros ── */}
      <div className="adm-card space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {PERIODOS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriodo(p.key)}
              className={`rounded-lg border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                periodo === p.key
                  ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
                  : "border-[var(--ad-line)] adm-muted hover:bg-[var(--ad-surface-2)]"
              }`}
            >
              {p.label}
            </button>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-[var(--ad-line)] sm:block" />
          <label className="flex items-center gap-1.5 text-xs adm-muted">
            De
            <input
              type="date"
              value={de}
              onChange={(e) => {
                setDe(e.target.value);
                setPeriodo("custom");
              }}
              aria-label="Data inicial"
              className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2.5 py-1.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs adm-muted">
            Até
            <input
              type="date"
              value={ate}
              onChange={(e) => {
                setAte(e.target.value);
                setPeriodo("custom");
              }}
              aria-label="Data final"
              className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-2.5 py-1.5 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar descrição, categoria, OS…"
            className={`${inputCls} w-full sm:w-64`}
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as typeof filtroTipo)}
            aria-label="Filtrar por tipo"
            className={`${inputCls} w-auto`}
          >
            <option value="todos">Receitas e despesas</option>
            <option value="receita">Só receitas</option>
            <option value="despesa">Só despesas</option>
          </select>
          <select
            value={filtroCat}
            onChange={(e) => setFiltroCat(e.target.value)}
            aria-label="Filtrar por categoria"
            className={`${inputCls} w-auto`}
          >
            {categorias.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filtroForma}
            onChange={(e) => setFiltroForma(e.target.value)}
            aria-label="Filtrar por forma de pagamento"
            className={`${inputCls} w-auto`}
          >
            {formas.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
          <span className="text-xs adm-muted">
            {visiveis.length} de {seed.length}
          </span>
          {filtroAtivo && (
            <button type="button" onClick={limpar} className="text-xs font-semibold adm-brand hover:underline">
              Limpar filtros
            </button>
          )}
          <button
            type="button"
            onClick={exportarCSV}
            disabled={visiveis.length === 0}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-3 py-2 text-xs font-semibold adm-ink transition-colors enabled:hover:bg-[var(--ad-surface-2)] disabled:opacity-40"
          >
            <Download className="size-3.5" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* ── Totais do período ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="adm-card p-4">
              <span className={`grid size-10 place-items-center rounded-xl ${t.cls}`}>
                <Icon className="size-5" />
              </span>
              <p className="adm-display mt-3 text-2xl font-bold adm-ink">{t.value}</p>
              <p className="text-sm adm-muted">{t.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Quebra por categoria ── */}
      {porCategoria.length > 0 && (
        <div className="adm-card overflow-hidden">
          <div className="border-b border-[var(--ad-line)] px-5 py-3.5">
            <h2 className="adm-display font-bold adm-ink">Por categoria</h2>
            <p className="text-xs adm-muted">No período filtrado.</p>
          </div>
          <div className="divide-y divide-[var(--ad-line)]">
            {porCategoria.map((c) => (
              <div key={c.nome} className="px-5 py-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold adm-ink">{c.nome}</span>
                  <span className="flex gap-3">
                    {c.receita > 0 && <span className="text-emerald-400">+{brl(c.receita)}</span>}
                    {c.despesa > 0 && <span className="text-rose-400">−{brl(c.despesa)}</span>}
                  </span>
                </div>
                <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-[var(--ad-surface-2)]">
                  {c.receita > 0 && (
                    <div className="h-full bg-emerald-500" style={{ width: `${(c.receita / maxCat) * 100}%` }} />
                  )}
                  {c.despesa > 0 && (
                    <div className="h-full bg-rose-500" style={{ width: `${(c.despesa / maxCat) * 100}%` }} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Novo lançamento / edição ── */}
      <div id="form-lancamento" className="adm-card p-5">
        <h2 className="adm-display mb-4 font-bold adm-ink">
          {editId ? "Editar lançamento" : "Novo lançamento"}
        </h2>

        <div className="mb-4 inline-flex rounded-lg border border-[var(--ad-line)] p-1">
          <button
            type="button"
            onClick={() => trocarTipo("receita")}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              form.tipo === "receita" ? "bg-emerald-600 text-white" : "adm-muted"
            }`}
          >
            Receita
          </button>
          <button
            type="button"
            onClick={() => trocarTipo("despesa")}
            className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
              form.tipo === "despesa" ? "bg-rose-600 text-white" : "adm-muted"
            }`}
          >
            Despesa
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <label className={labelCls} htmlFor="fin-desc">Descrição</label>
            <input
              id="fin-desc"
              className={inputCls}
              placeholder="Ex.: Compra de óleo Motul"
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="fin-valor">Valor (R$)</label>
            <input
              id="fin-valor"
              type="number"
              min={0}
              className={inputCls}
              placeholder="0"
              value={form.valor || ""}
              onChange={(e) => setForm((f) => ({ ...f, valor: Number(e.target.value) }))}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="fin-data">Data</label>
            <input
              id="fin-data"
              type="date"
              className={inputCls}
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="fin-cat">Categoria</label>
            <select
              id="fin-cat"
              className={inputCls}
              value={form.categoria}
              onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
            >
              {CATEGORIAS[form.tipo].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="fin-forma">Forma de pagamento</label>
            <select
              id="fin-forma"
              className={inputCls}
              value={form.forma}
              onChange={(e) => setForm((f) => ({ ...f, forma: e.target.value }))}
            >
              <option value="">Não informado</option>
              {FORMAS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls} htmlFor="fin-obs">Observações (opcional)</label>
            <input
              id="fin-obs"
              className={inputCls}
              placeholder="Nota fiscal, fornecedor, parcela…"
              value={form.observacoes}
              onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
            />
          </div>
        </div>

        {erro && <p className="mt-3 rounded-lg bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{erro}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={salvar}
            disabled={pending || !form.descricao.trim() || form.valor <= 0}
            className="flex items-center justify-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-5 py-2.5 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
          >
            {editId ? <Check className="size-4" /> : <Plus className="size-4" />}
            {pending ? "Salvando…" : editId ? "Salvar alterações" : "Lançar"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={() => {
                setEditId(null);
                setForm(vazio(form.tipo));
                setErro(null);
              }}
              className="rounded-lg border border-[var(--ad-line)] px-4 py-2.5 text-sm font-semibold adm-muted"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* ── Lançamentos ── */}
      <div className="adm-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--ad-line)] px-5 py-3.5">
          <h2 className="adm-display font-bold adm-ink">Lançamentos</h2>
          <span className="text-xs adm-muted">{visiveis.length} no período</span>
        </div>
        <div className="divide-y divide-[var(--ad-line)]">
          {visiveis.length === 0 && (
            <p className="px-5 py-4 text-sm adm-muted">Nenhum lançamento com esses filtros.</p>
          )}
          {visiveis.map((l) => {
            const receita = l.tipo === "receita";
            if (delId === l.id) {
              return (
                <div key={l.id} className="flex flex-wrap items-center gap-3 bg-rose-500/5 px-5 py-3.5">
                  <span className="flex-1 text-sm adm-ink">
                    Excluir <strong>{l.descricao}</strong> ({brl(l.valor)})?
                    {l.osId && " Este lançamento veio da entrega de uma OS — a OS em si não muda."}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => apagar(l.id)}
                    className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    Excluir
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelId(null)}
                    className="rounded-lg border border-[var(--ad-line)] px-3.5 py-2 text-xs font-semibold adm-muted"
                  >
                    Cancelar
                  </button>
                </div>
              );
            }
            return (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3.5">
                <span
                  className={`grid size-9 shrink-0 place-items-center rounded-lg ${
                    receita ? "bg-emerald-500/15 text-emerald-400" : "bg-rose-500/15 text-rose-400"
                  }`}
                >
                  {receita ? <ArrowUpRight className="size-5" /> : <ArrowDownRight className="size-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold adm-ink">
                    {l.descricao}
                    {l.osId && (
                      <Link
                        href={`/oficina/ordens/${l.osId}`}
                        className="ml-2 inline-flex items-center gap-1 font-mono text-xs adm-brand hover:underline"
                      >
                        <Receipt className="size-3" />
                        {l.osId}
                      </Link>
                    )}
                  </p>
                  <p className="truncate text-xs adm-muted">
                    {l.data} · {l.categoria}
                    {l.forma && ` · ${l.forma}`}
                    {l.observacoes && ` · ${l.observacoes}`}
                  </p>
                </div>
                <span className={`text-sm font-semibold ${receita ? "text-emerald-400" : "text-rose-400"}`}>
                  {receita ? "+" : "−"} {brl(l.valor)}
                </span>
                <button type="button" onClick={() => abrirEdicao(l)} aria-label={`Editar ${l.descricao}`}>
                  <Pencil className="size-4 adm-muted hover:adm-brand" />
                </button>
                <button type="button" onClick={() => setDelId(l.id)} aria-label={`Excluir ${l.descricao}`}>
                  <Trash2 className="size-4 text-rose-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
