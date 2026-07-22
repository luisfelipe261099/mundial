"use client";

import { useState, useTransition } from "react";
import { Plus, Minus, PackagePlus, AlertTriangle, Check, X, ArrowDownUp, Pencil, Trash2 } from "lucide-react";
import { brl, type Produto } from "../_data/mock";
import { movimentarEstoque, criarProduto, editarProduto, excluirProduto } from "../actions";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

const ORDENS = ["Status", "Nome", "Quantidade"] as const;
const MOTIVOS = ["Compra", "Uso em OS", "Ajuste", "Perda"];

type NovoProduto = { produto: string; marca: string; codigo: string; qtd: number; minimo: number; preco: number };
type EdicaoProduto = { produto: string; marca: string; codigo: string; minimo: number; preco: number };
type Movimentacao = { tipo: "entrada" | "saida"; qtd: number; motivo: string };

const NOVO_VAZIO: NovoProduto = { produto: "", marca: "", codigo: "", qtd: 0, minimo: 0, preco: 0 };

export function StockManager({ seed }: { seed: Produto[] }) {
  const [itens, setItens] = useState<Produto[]>(seed);
  const [busca, setBusca] = useState("");
  const [soBaixos, setSoBaixos] = useState(false);
  const [ordem, setOrdem] = useState<(typeof ORDENS)[number]>("Status");
  const [showForm, setShowForm] = useState(false);
  const [novo, setNovo] = useState<NovoProduto>(NOVO_VAZIO);

  // painel inline aberto por linha: movimentar | editar | excluir
  const [movId, setMovId] = useState<string | null>(null);
  const [mov, setMov] = useState<Movimentacao>({ tipo: "entrada", qtd: 1, motivo: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EdicaoProduto>({ produto: "", marca: "", codigo: "", minimo: 0, preco: 0 });
  const [delId, setDelId] = useState<string | null>(null);

  const [, startTransition] = useTransition();

  const baixos = itens.filter((p) => p.qtd < p.minimo);

  const lista = itens
    .filter((p) => (!soBaixos || p.qtd < p.minimo) && matches([p.produto, p.marca, p.codigo], busca))
    .sort((a, b) => {
      if (ordem === "Nome") return a.produto.localeCompare(b.produto, "pt-BR");
      if (ordem === "Quantidade") return a.qtd - b.qtd;
      // Status: abaixo do mínimo primeiro, depois nome
      const ba = a.qtd < a.minimo ? 0 : 1;
      const bb = b.qtd < b.minimo ? 0 : 1;
      return ba - bb || a.produto.localeCompare(b.produto, "pt-BR");
    });
  const filtroAtivo = busca !== "" || soBaixos;

  function fecharPaineis() {
    setMovId(null);
    setEditId(null);
    setDelId(null);
  }

  function movimentar(id: string, delta: number, motivo?: string) {
    if (delta === 0) return;
    setItens((x) => x.map((p) => (p.id === id ? { ...p, qtd: Math.max(0, p.qtd + delta), movs: (p.movs ?? 0) + 1 } : p)));
    startTransition(() => movimentarEstoque(id, delta, motivo));
  }

  function addProduto() {
    if (!novo.produto.trim() || !novo.codigo.trim()) return;
    const preco = novo.preco || null;
    setItens((x) => [{ id: `p${Date.now()}`, ...novo, preco, movs: novo.qtd > 0 ? 1 : 0 }, ...x]);
    setNovo(NOVO_VAZIO);
    setShowForm(false);
    startTransition(() => criarProduto({ ...novo, preco }));
  }

  function abrirEdicao(p: Produto) {
    fecharPaineis();
    setEditId(p.id);
    setEdit({ produto: p.produto, marca: p.marca === "—" ? "" : p.marca, codigo: p.codigo, minimo: p.minimo, preco: p.preco ?? 0 });
  }

  function salvarEdicao(id: string) {
    if (!edit.produto.trim() || !edit.codigo.trim()) return;
    const preco = edit.preco || null;
    setItens((x) => x.map((p) => (p.id === id ? { ...p, produto: edit.produto, marca: edit.marca || "—", codigo: edit.codigo, minimo: edit.minimo, preco } : p)));
    setEditId(null);
    startTransition(() => editarProduto(id, { ...edit, preco }));
  }

  function excluir(id: string) {
    setItens((x) => x.filter((p) => p.id !== id));
    setDelId(null);
    startTransition(() => excluirProduto(id));
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar produto, marca, código…" />
        <FilterChip active={soBaixos} onClick={() => setSoBaixos((v) => !v)}>
          Abaixo do mínimo
        </FilterChip>
        <span className="flex items-center gap-1.5">
          <ArrowDownUp className="size-4 adm-muted" />
          <FilterSelect value={ordem} onChange={(v) => setOrdem(v as (typeof ORDENS)[number])} options={[...ORDENS]} ariaLabel="Ordenar por" />
        </span>
        <ResultBar shown={lista.length} total={itens.length} active={filtroAtivo} onClear={() => { setBusca(""); setSoBaixos(false); }} />
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="ml-auto flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
        >
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Cancelar" : "Novo produto"}
        </button>
      </div>

      {showForm && (
        <div className="adm-card p-4">
          <h3 className="adm-display mb-3 flex items-center gap-2 text-sm font-bold adm-ink">
            <PackagePlus className="size-4 adm-brand" />
            Cadastrar produto
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
            <input className={`${inputCls} col-span-2`} placeholder="Produto" value={novo.produto} onChange={(e) => setNovo((n) => ({ ...n, produto: e.target.value }))} />
            <input className={inputCls} placeholder="Marca" value={novo.marca} onChange={(e) => setNovo((n) => ({ ...n, marca: e.target.value }))} />
            <input className={inputCls} placeholder="Código" value={novo.codigo} onChange={(e) => setNovo((n) => ({ ...n, codigo: e.target.value }))} />
            <input type="number" min={0} className={inputCls} placeholder="Preço R$" value={novo.preco || ""} onChange={(e) => setNovo((n) => ({ ...n, preco: Number(e.target.value) }))} aria-label="Preço em reais" />
            <div className="flex gap-2">
              <input type="number" min={0} className={inputCls} placeholder="Qtd" value={novo.qtd || ""} onChange={(e) => setNovo((n) => ({ ...n, qtd: Number(e.target.value) }))} aria-label="Quantidade" />
              <input type="number" min={0} className={inputCls} placeholder="Mín" value={novo.minimo || ""} onChange={(e) => setNovo((n) => ({ ...n, minimo: Number(e.target.value) }))} aria-label="Mínimo" />
            </div>
          </div>
          <button
            type="button"
            onClick={addProduto}
            disabled={!novo.produto.trim() || !novo.codigo.trim()}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
          >
            <Check className="size-4" />
            Adicionar ao estoque
          </button>
        </div>
      )}

      {baixos.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="size-5 shrink-0 text-amber-400" />
          <p className="text-sm adm-ink">
            <span className="font-semibold">{baixos.length} produtos</span> abaixo do estoque mínimo.
          </p>
        </div>
      )}

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Produto</th>
                <th className="px-5 py-3 font-semibold">Marca</th>
                <th className="px-5 py-3 font-semibold">Código</th>
                <th className="px-5 py-3 text-right font-semibold">Preço</th>
                <th className="px-5 py-3 text-center font-semibold">Qtd</th>
                <th className="px-5 py-3 text-center font-semibold">Mínimo</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={8} busca={busca} />}
              {lista.map((p) => (
                <ProductRow
                  key={p.id}
                  p={p}
                  movAberto={movId === p.id}
                  editAberto={editId === p.id}
                  delAberto={delId === p.id}
                  mov={mov}
                  setMov={setMov}
                  edit={edit}
                  setEdit={setEdit}
                  onToggleMov={() => {
                    const abre = movId !== p.id;
                    fecharPaineis();
                    if (abre) {
                      setMovId(p.id);
                      setMov({ tipo: "entrada", qtd: 1, motivo: "" });
                    }
                  }}
                  onToggleEdit={() => (editId === p.id ? setEditId(null) : abrirEdicao(p))}
                  onToggleDel={() => {
                    const abre = delId !== p.id;
                    fecharPaineis();
                    if (abre) setDelId(p.id);
                  }}
                  onMais={() => movimentar(p.id, 1)}
                  onMenos={() => movimentar(p.id, -1)}
                  onConfirmarMov={() => {
                    movimentar(p.id, mov.tipo === "saida" ? -mov.qtd : mov.qtd, mov.motivo);
                    setMovId(null);
                  }}
                  onSalvarEdicao={() => salvarEdicao(p.id)}
                  onExcluir={() => excluir(p.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  p, movAberto, editAberto, delAberto, mov, setMov, edit, setEdit,
  onToggleMov, onToggleEdit, onToggleDel, onMais, onMenos, onConfirmarMov, onSalvarEdicao, onExcluir,
}: {
  p: Produto;
  movAberto: boolean;
  editAberto: boolean;
  delAberto: boolean;
  mov: Movimentacao;
  setMov: React.Dispatch<React.SetStateAction<Movimentacao>>;
  edit: EdicaoProduto;
  setEdit: React.Dispatch<React.SetStateAction<EdicaoProduto>>;
  onToggleMov: () => void;
  onToggleEdit: () => void;
  onToggleDel: () => void;
  onMais: () => void;
  onMenos: () => void;
  onConfirmarMov: () => void;
  onSalvarEdicao: () => void;
  onExcluir: () => void;
}) {
  const baixo = p.qtd < p.minimo;
  const painelAberto = movAberto || editAberto || delAberto;
  const btnCls = "grid size-7 place-items-center rounded-md border border-[var(--ad-line)] adm-ink hover:bg-[var(--ad-surface-2)]";
  return (
    <>
      <tr className={`border-b border-[var(--ad-line)] ${painelAberto ? "" : "last:border-0"}`}>
        <td className="px-5 py-3 font-semibold adm-ink">{p.produto}</td>
        <td className="px-5 py-3 adm-muted">{p.marca}</td>
        <td className="px-5 py-3 font-mono adm-muted">{p.codigo}</td>
        <td className="px-5 py-3 text-right adm-muted">{p.preco != null ? brl(p.preco) : "—"}</td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-center gap-2">
            <button type="button" onClick={onMenos} aria-label="Saída" className={btnCls}>
              <Minus className="size-4" />
            </button>
            <span className={`w-8 text-center font-semibold ${baixo ? "text-amber-400" : "adm-ink"}`}>{p.qtd}</span>
            <button type="button" onClick={onMais} aria-label="Entrada" className={btnCls}>
              <Plus className="size-4" />
            </button>
          </div>
        </td>
        <td className="px-5 py-3 text-center adm-muted">{p.minimo}</td>
        <td className="px-5 py-3">
          <span className={baixo ? "osb osb-aguardando" : "osb osb-finalizada"}>{baixo ? "Baixo" : "Em dia"}</span>
        </td>
        <td className="px-5 py-3">
          <div className="flex items-center justify-end gap-1.5">
            <button type="button" onClick={onToggleMov} className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${movAberto ? "border-[var(--ad-brand)] adm-brand" : "border-[var(--ad-line)] adm-muted hover:adm-ink"}`}>
              Movimentar
            </button>
            <button type="button" onClick={onToggleEdit} aria-label={`Editar ${p.produto}`} className={btnCls}>
              <Pencil className="size-3.5" />
            </button>
            <button type="button" onClick={onToggleDel} aria-label={`Excluir ${p.produto}`} className={`${btnCls} hover:border-red-500/50 hover:text-red-400`}>
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </td>
      </tr>

      {movAberto && (
        <tr className="border-b border-[var(--ad-line)] bg-[var(--ad-surface-2)]/40">
          <td colSpan={8} className="px-5 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <select value={mov.tipo} onChange={(e) => setMov((m) => ({ ...m, tipo: e.target.value as "entrada" | "saida" }))} className={`${inputCls} w-auto`} aria-label="Tipo de movimentação">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
              <input type="number" min={1} value={mov.qtd || ""} onChange={(e) => setMov((m) => ({ ...m, qtd: Math.max(1, Number(e.target.value)) }))} className={`${inputCls} w-24`} aria-label="Quantidade da movimentação" />
              <input list="mov-motivos" value={mov.motivo} onChange={(e) => setMov((m) => ({ ...m, motivo: e.target.value }))} placeholder="Motivo (Compra, Uso em OS…)" className={`${inputCls} min-w-48 flex-1 sm:max-w-64`} />
              <datalist id="mov-motivos">
                {MOTIVOS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              <button type="button" onClick={onConfirmarMov} className="flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b5fe0]">
                <Check className="size-4" />
                Confirmar {mov.tipo === "saida" ? "saída" : "entrada"} de {mov.qtd}
              </button>
            </div>
          </td>
        </tr>
      )}

      {editAberto && (
        <tr className="border-b border-[var(--ad-line)] bg-[var(--ad-surface-2)]/40">
          <td colSpan={8} className="px-5 py-3">
            <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-6">
              <input className={`${inputCls} col-span-2`} value={edit.produto} onChange={(e) => setEdit((x) => ({ ...x, produto: e.target.value }))} aria-label="Nome do produto" />
              <input className={inputCls} value={edit.marca} onChange={(e) => setEdit((x) => ({ ...x, marca: e.target.value }))} placeholder="Marca" aria-label="Marca" />
              <input className={inputCls} value={edit.codigo} onChange={(e) => setEdit((x) => ({ ...x, codigo: e.target.value }))} aria-label="Código" />
              <input type="number" min={0} className={inputCls} value={edit.preco || ""} onChange={(e) => setEdit((x) => ({ ...x, preco: Number(e.target.value) }))} placeholder="Preço R$" aria-label="Preço em reais" />
              <div className="flex items-center gap-2">
                <input type="number" min={0} className={inputCls} value={edit.minimo || ""} onChange={(e) => setEdit((x) => ({ ...x, minimo: Number(e.target.value) }))} placeholder="Mín" aria-label="Mínimo" />
                <button type="button" onClick={onSalvarEdicao} disabled={!edit.produto.trim() || !edit.codigo.trim()} className="flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-3 py-2 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40">
                  <Check className="size-4" />
                  Salvar
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs adm-muted">Quantidade não se edita aqui — use Movimentar, para o histórico registrar.</p>
          </td>
        </tr>
      )}

      {delAberto && (
        <tr className="border-b border-[var(--ad-line)] bg-red-500/5">
          <td colSpan={8} className="px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <AlertTriangle className="size-4 shrink-0 text-red-400" />
              <p className="text-sm adm-ink">
                Excluir <span className="font-semibold">{p.produto}</span>?
                {(p.movs ?? 0) > 0 && (
                  <span className="adm-muted"> Apaga também as {p.movs} movimentações do histórico.</span>
                )}
              </p>
              <button type="button" onClick={onExcluir} className="rounded-lg bg-red-500/90 px-3.5 py-1.5 text-sm font-semibold text-white hover:bg-red-500">
                Excluir de vez
              </button>
              <button type="button" onClick={onToggleDel} className="rounded-lg border border-[var(--ad-line)] px-3.5 py-1.5 text-sm font-semibold adm-muted">
                Cancelar
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
