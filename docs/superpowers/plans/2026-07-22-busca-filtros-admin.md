# Busca e filtros no admin + upgrade do Estoque — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Busca instantânea e filtros nas listagens do `/oficina` (Clientes, Veículos, Ordens, Estoque) e upgrade do Estoque: movimentação com quantidade+motivo, editar/excluir produto, preço e valor total, ordenação.

**Architecture:** Filtro 100% client-side (dados já chegam completos dos server components; base pequena). Helpers puros em `filter-utils.ts`, componentes de UI compartilhados em `table-filters.tsx`, e um client component de tabela por página (padrão já usado pela `OrdersTable`). Única mudança de banco: coluna aditiva `price Int?` em `Product`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind 4 (tokens `--ad-*`), Prisma 7 (driver adapter pg), lucide-react.

## Global Constraints

- **Banco único dev/prod (Neon/Retool)**: `prisma db push` altera produção NA HORA. Só mudança aditiva (coluna nullable). **NUNCA** rodar `npm run db:seed`.
- **Não fazer `git push`** — push no `main` faz deploy automático; commits ficam locais até o usuário mandar publicar.
- Dinheiro: `Int` em **reais inteiros**; formatar com `brl()` de `app/oficina/_data/mock.ts`.
- Copy em **pt-BR**; visual com os tokens admin existentes (`adm-card`, `adm-ink`, `adm-muted`, `adm-brand`, `--ad-line`, `--ad-surface-2`, `--ad-brand`).
- Tipos `Cliente`/`VeiculoAdmin`/`Produto` vivem em `app/oficina/_data/mock.ts` e são satisfeitos por literais legados do seed → campos novos devem ser **opcionais** (`?`).
- Projeto **não tem test runner**; lógica pura é verificada com scripts `tsx` + `node:assert`, UI com `npm run build` + navegação real. Prisma 7: import do client é `@/lib/generated/prisma/client`; CLI não lê `.env` sozinho (o `prisma.config.ts` carrega).
- Trabalhar na branch `feat/plataforma-oficina-noturna`.

---

### Task 1: Coluna `price` no Product (schema + client)

**Files:**
- Modify: `prisma/schema.prisma` (model Product, ~linha 162)
- Modify: `app/oficina/_data/mock.ts` (interface Produto, ~linha 200)
- Modify: `lib/admin-data.ts` (getEstoque, ~linha 274)

**Interfaces:**
- Produces: `Product.price Int?` no banco; `Produto.preco?: number | null` e `Produto.movs?: number` no tipo; `getEstoque()` devolve `preco` e `movs` (contagem de movimentações, usada no confirm de exclusão da Task 7).

- [ ] **Step 1: Adicionar o campo no schema**

Em `prisma/schema.prisma`, model `Product`:

```prisma
model Product {
  id        String          @id @default(cuid())
  name      String
  brand     String?
  code      String          @unique
  qty       Int             @default(0)
  min       Int             @default(0)
  price     Int? // preço de custo em reais inteiros (convenção do sistema)
  movements StockMovement[]

  @@map("products")
}
```

- [ ] **Step 2: Aplicar no banco (aditivo) e regenerar o client**

Run: `npx prisma db push && npx prisma generate`
Expected: "Your database is now in sync" — sem prompts de drop/reset. **Se aparecer qualquer aviso de perda de dados, ABORTAR** (não confirmar) e investigar.

- [ ] **Step 3: Expor `preco` e `movs` no tipo e na query**

Em `app/oficina/_data/mock.ts`:

```ts
export interface Produto {
  id: string;
  produto: string;
  marca: string;
  codigo: string;
  qtd: number;
  minimo: number;
  preco?: number | null;
  movs?: number; // nº de movimentações (para o confirm de exclusão)
}
```

Em `lib/admin-data.ts`, substituir `getEstoque`:

```ts
export async function getEstoque(): Promise<Produto[]> {
  const rows = await prisma.product.findMany({
    include: { _count: { select: { movements: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    produto: p.name,
    marca: p.brand ?? "—",
    codigo: p.code,
    qtd: p.qty,
    minimo: p.min,
    preco: p.price,
    movs: p._count.movements,
  }));
}
```

- [ ] **Step 4: Verificar que compila e que a coluna existe**

Run: `npm run build 2>&1 | tail -5`
Expected: build OK.

Run (script descartável no scratchpad, padrão de import absoluto por causa do dotenv):

```ts
// scratchpad/check-price.ts
import "/home/luisf/project/mundial/node_modules/dotenv/config";
import { PrismaPg } from "/home/luisf/project/mundial/node_modules/@prisma/adapter-pg/dist/index.mjs";
import { PrismaClient } from "/home/luisf/project/mundial/lib/generated/prisma/client";
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
prisma.product.findFirst({ select: { id: true, price: true } })
  .then((p) => console.log("ok, price acessível:", p))
  .finally(() => prisma.$disconnect());
```

Run: `npx tsx <scratchpad>/check-price.ts`
Expected: `ok, price acessível: null` ou um objeto — sem erro de coluna.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma app/oficina/_data/mock.ts lib/admin-data.ts
git commit -m "feat(estoque): coluna price no Product + preco/movs no getEstoque"
```

---

### Task 2: Helpers de busca (`filter-utils.ts`) + componentes (`table-filters.tsx`)

**Files:**
- Create: `app/oficina/_components/filter-utils.ts`
- Create: `app/oficina/_components/table-filters.tsx`
- Test: script tsx descartável no scratchpad (TDD nos helpers puros)

**Interfaces:**
- Produces (usado pelas Tasks 3–7):
  - `norm(s: string): string` — minúsculas, sem acento, só `[a-z0-9]`.
  - `matches(fields: (string | null | undefined)[], busca: string): boolean` — busca vazia → `true`.
  - `SearchInput({ value, onChange, placeholder })`
  - `FilterChip({ active, onClick, children })`
  - `FilterSelect({ value, onChange, options, ariaLabel })` — `options: string[]`, o item 0 é o "todos".
  - `ResultBar({ shown, total, active, onClear })` — renderiza `null` se `!active`.
  - `EmptyRow({ colSpan, busca })` — `<tr>` de estado vazio.

- [ ] **Step 1: Escrever o teste que falha (helpers puros)**

```ts
// scratchpad/test-filter-utils.ts
import assert from "node:assert";
import { norm, matches } from "/home/luisf/project/mundial/app/oficina/_components/filter-utils";

assert.equal(norm("João Mendes"), "joaomendes");
assert.equal(norm("ABC-1D23"), "abc1d23");
assert.equal(norm("(41) 99650-6790"), "41996506790");
// placa com/sem hífen casa nos dois sentidos
assert.ok(matches(["ABC-1D23"], "abc1d23"));
assert.ok(matches(["ABC1D23"], "abc-1d23"));
// acento e caixa não importam
assert.ok(matches(["Cláudia Pereira"], "claudia"));
// telefone com máscara casa busca só-dígitos
assert.ok(matches(["(41) 99650-6790"], "99650"));
// busca vazia deixa tudo passar; null/undefined não explodem
assert.ok(matches([null, undefined], ""));
assert.ok(!matches([null, "Fiat Uno"], "gol"));
console.log("✅ filter-utils ok");
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx tsx <scratchpad>/test-filter-utils.ts`
Expected: FAIL — `Cannot find module ... filter-utils`

- [ ] **Step 3: Implementar `filter-utils.ts`**

```ts
// Normalização de busca compartilhada pelas listagens do admin.
// Remove acentos e tudo que não é letra/número — assim "ABC-1D23",
// "abc1d23" e "(41) 99650-6790"/"99650" se encontram.
export function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function matches(fields: (string | null | undefined)[], busca: string): boolean {
  const b = norm(busca);
  if (!b) return true;
  return fields.some((f) => f != null && norm(f).includes(b));
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx tsx <scratchpad>/test-filter-utils.ts`
Expected: `✅ filter-utils ok`

- [ ] **Step 5: Implementar `table-filters.tsx`**

```tsx
"use client";

import { Search, X } from "lucide-react";

const fieldCls =
  "rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function SearchInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative min-w-0 flex-1 sm:max-w-xs">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 adm-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${fieldCls} w-full pl-9 ${value ? "pr-8" : ""}`}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Limpar busca"
          className="absolute right-2 top-1/2 -translate-y-1/2 adm-muted hover:adm-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
          : "border-[var(--ad-line)] adm-muted"
      }`}
    >
      {children}
    </button>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  ariaLabel: string;
}) {
  return (
    <select aria-label={ariaLabel} value={value} onChange={(e) => onChange(e.target.value)} className={fieldCls}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function ResultBar({
  shown,
  total,
  active,
  onClear,
}: {
  shown: number;
  total: number;
  active: boolean;
  onClear: () => void;
}) {
  if (!active) return null;
  return (
    <div className="flex items-center gap-3 text-sm adm-muted">
      <span>
        <span className="font-semibold adm-ink">{shown}</span> de {total}
      </span>
      <button type="button" onClick={onClear} className="font-semibold adm-brand hover:underline">
        Limpar filtros
      </button>
    </div>
  );
}

export function EmptyRow({ colSpan, busca }: { colSpan: number; busca: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center adm-muted">
        Nenhum resultado{busca ? (
          <>
            {" "}para “<span className="adm-ink">{busca}</span>”
          </>
        ) : null}
        .
      </td>
    </tr>
  );
}
```

- [ ] **Step 6: Build + commit**

Run: `npm run build 2>&1 | tail -5` — Expected: OK.

```bash
git add app/oficina/_components/filter-utils.ts app/oficina/_components/table-filters.tsx
git commit -m "feat(oficina): helpers de busca normalizada + componentes de filtro"
```

---

### Task 3: Clientes — placas na query + `ClientsTable`

**Files:**
- Modify: `app/oficina/_data/mock.ts` (interface Cliente, ~linha 34)
- Modify: `lib/admin-data.ts` (mapCliente ~linha 96, getClientes ~linha 112)
- Create: `app/oficina/_components/clients-table.tsx`
- Modify: `app/oficina/clientes/page.tsx`

**Interfaces:**
- Consumes: `matches`, `SearchInput`, `FilterChip`, `ResultBar`, `EmptyRow` (Task 2).
- Produces: `Cliente.placas?: string[]`; `ClientsTable({ clientes: Cliente[] })`.

- [ ] **Step 1: Tipo + query com placas**

`app/oficina/_data/mock.ts` — adicionar ao `interface Cliente` (campo opcional para não quebrar os literais do seed):

```ts
export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cidade: string;
  veiculos: number;
  gastoTotal: number;
  desde: string;
  placas?: string[];
}
```

`lib/admin-data.ts` — `mapCliente` ganha o 4º parâmetro e `getClientes` busca as placas (o `_count` sai; usa-se `vehicles.length`):

```ts
function mapCliente(c: ClientRow, veiculos: number, gastoTotal: number, placas: string[] = []): Cliente {
  return {
    id: c.id,
    nome: c.name,
    cpf: c.cpf ?? "—",
    telefone: c.phone ?? "—",
    whatsapp: c.whatsapp ?? "—",
    email: c.email ?? "—",
    cidade: c.city ?? "—",
    veiculos,
    gastoTotal,
    desde: c.since ?? "—",
    placas,
  };
}

export async function getClientes(): Promise<Cliente[]> {
  const [clients, gastos] = await Promise.all([
    prisma.client.findMany({
      include: { vehicles: { select: { plate: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.serviceOrder.groupBy({ by: ["clientId"], _sum: { total: true } }),
  ]);
  const gastoMap = new Map(gastos.map((g) => [g.clientId, g._sum.total ?? 0]));
  return clients.map((c) =>
    mapCliente(c, c.vehicles.length, gastoMap.get(c.id) ?? 0, c.vehicles.map((v) => v.plate))
  );
}
```

⚠️ `getClienteDetalhe` (linha ~121) também chama `mapCliente` — conferir a chamada; o novo parâmetro tem default, então não deve precisar de mudança.

- [ ] **Step 2: Criar `clients-table.tsx`**

A tabela é a MESMA marcação hoje dentro de `clientes/page.tsx` (thead/tbody), movida para cá:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { brl, type Cliente } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, ResultBar, EmptyRow } from "./table-filters";

export function ClientsTable({ clientes }: { clientes: Cliente[] }) {
  const [busca, setBusca] = useState("");
  const [semTelefone, setSemTelefone] = useState(false);
  const [semVeiculo, setSemVeiculo] = useState(false);

  const lista = clientes.filter((c) => {
    if (semTelefone && c.telefone !== "—") return false;
    if (semVeiculo && c.veiculos > 0) return false;
    return matches([c.nome, c.telefone, c.email, c.cidade, ...(c.placas ?? [])], busca);
  });
  const filtroAtivo = busca !== "" || semTelefone || semVeiculo;

  function limpar() {
    setBusca("");
    setSemTelefone(false);
    setSemVeiculo(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar nome, telefone, placa…" />
        <FilterChip active={semTelefone} onClick={() => setSemTelefone((v) => !v)}>
          Sem telefone
        </FilterChip>
        <FilterChip active={semVeiculo} onClick={() => setSemVeiculo((v) => !v)}>
          Sem veículo
        </FilterChip>
        <ResultBar shown={lista.length} total={clientes.length} active={filtroAtivo} onClear={limpar} />
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Cliente</th>
                <th className="px-5 py-3 font-semibold">Telefone</th>
                <th className="px-5 py-3 font-semibold">Cidade</th>
                <th className="px-5 py-3 text-center font-semibold">Veículos</th>
                <th className="px-5 py-3 text-right font-semibold">Gasto total</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={6} busca={busca} />}
              {lista.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/clientes/${c.id}`} className="flex items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[var(--ad-brand)]/15 text-xs font-bold adm-brand">
                        {c.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </span>
                      <span className="font-semibold adm-ink">{c.nome}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 adm-muted">{c.telefone}</td>
                  <td className="px-5 py-3.5 adm-muted">{c.cidade}</td>
                  <td className="px-5 py-3.5 text-center adm-ink">{c.veiculos}</td>
                  <td className="px-5 py-3.5 text-right font-semibold adm-ink">{brl(c.gastoTotal)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/clientes/${c.id}`} className="inline-flex adm-muted hover:adm-brand">
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Enxugar `clientes/page.tsx`**

A página server mantém `PageHeader` (stats globais) e delega a tabela:

```tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { brl } from "../_data/mock";
import { getClientes } from "@/lib/admin-data";
import { PageHeader } from "../_components/ui";
import { ClientsTable } from "../_components/clients-table";

export default async function ClientesPage() {
  const clientes = await getClientes();
  const cidades = new Set(clientes.map((c) => c.cidade)).size;
  const faturado = clientes.reduce((s, c) => s + c.gastoTotal, 0);

  return (
    <div>
      <PageHeader
        eyebrow="Base de clientes"
        title="Clientes"
        description="Todos os clientes cadastrados na oficina, com contato, cidade e histórico de gastos."
        stats={[
          { label: "clientes", value: clientes.length.toString() },
          { label: "cidades", value: cidades.toString() },
          { label: "faturado", value: brl(faturado) },
        ]}
        action={
          <Link
            href="/oficina/clientes/novo"
            className="flex items-center gap-2 rounded-lg bg-[var(--ad-brand)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#1b5fe0]"
          >
            <Plus className="size-4" />
            Novo cliente
          </Link>
        }
      />
      <ClientsTable clientes={clientes} />
    </div>
  );
}
```

(Repare: o import de `ChevronRight` sai da página — foi para a tabela.)

- [ ] **Step 4: Verificar**

Run: `npm run build 2>&1 | tail -5` — Expected: OK.
No dev server (`npm run dev`), logado como admin, `/oficina/clientes`:
- digitar `bag3829` → só **Aldecir** aparece (busca por placa, sem hífen);
- digitar `aldecir` → idem;
- chip **Sem telefone** → 9 clientes; **Sem veículo** → 6; contador "X de 64" visível;
- busca sem resultado (`zzz`) → linha "Nenhum resultado para “zzz”." e **Limpar filtros** funciona.

- [ ] **Step 5: Commit**

```bash
git add app/oficina/_data/mock.ts lib/admin-data.ts app/oficina/_components/clients-table.tsx app/oficina/clientes/page.tsx
git commit -m "feat(oficina): busca e filtros na lista de clientes"
```

---

### Task 4: Veículos — `VehiclesTable` com marca e revisão vencida

**Files:**
- Modify: `app/oficina/_data/mock.ts` (interface VeiculoAdmin, ~linha 56)
- Modify: `lib/admin-data.ts` (mapVeiculo, ~linha 73)
- Create: `app/oficina/_components/vehicles-table.tsx`
- Modify: `app/oficina/veiculos/page.tsx`

**Interfaces:**
- Consumes: Task 2 (`matches`, `SearchInput`, `FilterChip`, `FilterSelect`, `ResultBar`, `EmptyRow`).
- Produces: `VeiculoAdmin.marca?: string`; `VehiclesTable({ veiculos: VeiculoAdmin[] })`.

- [ ] **Step 1: Tipo + mapper com marca**

`mock.ts` — `interface VeiculoAdmin` ganha `marca?: string;` (opcional pelos literais do seed).

`lib/admin-data.ts` — em `mapVeiculo`, adicionar `marca: v.brand,` ao objeto retornado.

- [ ] **Step 2: Criar `vehicles-table.tsx`**

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { VeiculoAdmin } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterChip, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const TODAS = "Todas as marcas";

export function VehiclesTable({ veiculos }: { veiculos: VeiculoAdmin[] }) {
  const [busca, setBusca] = useState("");
  const [marca, setMarca] = useState(TODAS);
  const [soVencidas, setSoVencidas] = useState(false);

  const marcas = [TODAS, ...Array.from(new Set(veiculos.map((v) => v.marca ?? v.modelo.split(" ")[0]))).sort()];

  const lista = veiculos.filter((v) => {
    if (soVencidas && !v.revisaoVencida) return false;
    if (marca !== TODAS && (v.marca ?? v.modelo.split(" ")[0]) !== marca) return false;
    return matches([v.placa, v.modelo, v.proprietario], busca);
  });
  const filtroAtivo = busca !== "" || marca !== TODAS || soVencidas;

  function limpar() {
    setBusca("");
    setMarca(TODAS);
    setSoVencidas(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar placa, modelo, dono…" />
        <FilterSelect value={marca} onChange={setMarca} options={marcas} ariaLabel="Filtrar por marca" />
        <FilterChip active={soVencidas} onClick={() => setSoVencidas((v) => !v)}>
          Revisão vencida
        </FilterChip>
        <ResultBar shown={lista.length} total={veiculos.length} active={filtroAtivo} onClear={limpar} />
      </div>

      <div className="adm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-[var(--ad-line)] text-left text-xs uppercase tracking-wide adm-muted">
                <th className="px-5 py-3 font-semibold">Proprietário</th>
                <th className="px-5 py-3 font-semibold">Modelo</th>
                <th className="px-5 py-3 font-semibold">Placa</th>
                <th className="px-5 py-3 text-center font-semibold">Ano</th>
                <th className="px-5 py-3 text-right font-semibold">KM</th>
                <th className="px-5 py-3 font-semibold">Próxima revisão</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {lista.length === 0 && <EmptyRow colSpan={7} busca={busca} />}
              {lista.map((v) => (
                <tr
                  key={v.id}
                  className="border-b border-[var(--ad-line)] transition-colors last:border-0 hover:bg-[var(--ad-surface-2)]"
                >
                  <td className="px-5 py-3.5 font-semibold adm-ink">{v.proprietario}</td>
                  <td className="px-5 py-3.5">
                    <Link href={`/oficina/veiculos/${v.id}`} className="adm-brand hover:underline">
                      {v.modelo}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 font-mono adm-muted">{v.placa}</td>
                  <td className="px-5 py-3.5 text-center adm-muted">{v.ano}</td>
                  <td className="px-5 py-3.5 text-right adm-muted">{v.km.toLocaleString("pt-BR")}</td>
                  <td className="px-5 py-3.5">
                    {v.revisaoVencida ? (
                      <span className="osb osb-aguardando">Vencida · {v.proximaRevisao}</span>
                    ) : (
                      <span className="adm-muted">{v.proximaRevisao}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href={`/oficina/veiculos/${v.id}`} className="inline-flex adm-muted hover:adm-brand">
                      <ChevronRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Enxugar `veiculos/page.tsx`**

Mesmo movimento da Task 3: página mantém `PageHeader` e `action` (Novo veículo) e renderiza `<VehiclesTable veiculos={veiculos} />`. Remover a `<table>` e os imports que sobrarem (`ChevronRight`).

- [ ] **Step 4: Verificar**

Run: `npm run build 2>&1 | tail -5` — OK.
Browser `/oficina/veiculos`: buscar `kombi` (≈8 resultados), select **Volkswagen** filtra, chip **Revisão vencida** + select combinam (E lógico), `rhe0e51` acha o T-Cross.

- [ ] **Step 5: Commit**

```bash
git add app/oficina/_data/mock.ts lib/admin-data.ts app/oficina/_components/vehicles-table.tsx app/oficina/veiculos/page.tsx
git commit -m "feat(oficina): busca e filtros na lista de veiculos"
```

---

### Task 5: Ordens — busca + filtro de mecânico na `OrdersTable`

**Files:**
- Modify: `app/oficina/_components/orders-table.tsx`

**Interfaces:**
- Consumes: Task 2. Mantém a prop existente `OrdersTable({ ordens })` — usada por `app/oficina/ordens/page.tsx` (não muda).

- [ ] **Step 1: Adicionar busca e select de mecânico**

Substituir o miolo do componente (mantendo abas de status e a tabela como estão):

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { brl, osBadgeClass, type OrdemServicoAdmin, type StatusOS } from "../_data/mock";
import { matches } from "./filter-utils";
import { SearchInput, FilterSelect, ResultBar, EmptyRow } from "./table-filters";

const FILTROS: ("Todas" | StatusOS)[] = [
  "Todas",
  "Aberta",
  "Aguardando aprovação",
  "Em execução",
  "Finalizada",
  "Entregue",
];

const TODOS = "Todos os mecânicos";

export function OrdersTable({ ordens }: { ordens: OrdemServicoAdmin[] }) {
  const [filtro, setFiltro] = useState<"Todas" | StatusOS>("Todas");
  const [busca, setBusca] = useState("");
  const [mecanico, setMecanico] = useState(TODOS);

  const mecanicos = [TODOS, ...Array.from(new Set(ordens.map((o) => o.mecanico).filter((m) => m !== "—"))).sort()];

  const lista = ordens.filter((o) => {
    if (filtro !== "Todas" && o.status !== filtro) return false;
    if (mecanico !== TODOS && o.mecanico !== mecanico) return false;
    return matches([o.id, o.cliente, o.placa, o.veiculo], busca);
  });
  const filtroAtivo = busca !== "" || mecanico !== TODOS || filtro !== "Todas";

  function limpar() {
    setBusca("");
    setMecanico(TODOS);
    setFiltro("Todas");
  }

  return (
    <div>
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {FILTROS.map((x) => (
          <button
            key={x}
            type="button"
            onClick={() => setFiltro(x)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filtro === x
                ? "border-[var(--ad-brand)] bg-[var(--ad-brand)] text-white"
                : "border-[var(--ad-line)] adm-muted"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar OS, cliente, placa…" />
        <FilterSelect value={mecanico} onChange={setMecanico} options={mecanicos} ariaLabel="Filtrar por mecânico" />
        <ResultBar shown={lista.length} total={ordens.length} active={filtroAtivo} onClear={limpar} />
      </div>

      {/* tabela existente, inalterada, exceto: */}
      {/* <tbody> começa com: {lista.length === 0 && <EmptyRow colSpan={7} busca={busca} />} */}
      ...
    </div>
  );
}
```

O bloco `<div className="adm-card ...">` com a `<table>` permanece byte a byte como hoje (linhas 45–89 atuais), apenas com o `EmptyRow` adicionado no topo do `<tbody>`.

- [ ] **Step 2: Verificar**

Run: `npm run build 2>&1 | tail -5` — OK.
Browser `/oficina/ordens`: (banco sem OS ainda — validar com estado vazio) as abas continuam funcionando; busca digitada mostra "Nenhum resultado"; **Limpar filtros** reseta aba para "Todas".

- [ ] **Step 3: Commit**

```bash
git add app/oficina/_components/orders-table.tsx
git commit -m "feat(oficina): busca e filtro de mecanico nas ordens"
```

---

### Task 6: Actions do Estoque — motivo, editar, excluir, preço

**Files:**
- Modify: `app/oficina/actions.ts` (movimentarEstoque ~linha 53, criarProduto ~linha 74; novas actions na sequência)

**Interfaces:**
- Consumes: `requireAdmin` de `@/lib/auth`, `prisma` de `@/lib/prisma` (já importados no arquivo).
- Produces (assinaturas que a Task 7 usa):
  - `movimentarEstoque(id: string, delta: number, motivo?: string)`
  - `criarProduto(input: { produto: string; marca: string; codigo: string; qtd: number; minimo: number; preco?: number | null })`
  - `editarProduto(id: string, input: { produto: string; marca: string; codigo: string; minimo: number; preco: number | null })`
  - `excluirProduto(id: string)`

- [ ] **Step 1: Estender `movimentarEstoque` e `criarProduto`**

```ts
export async function movimentarEstoque(id: string, delta: number, motivo?: string) {
  const admin = await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  const novaQtd = Math.max(0, p.qty + delta);
  const efetivo = novaQtd - p.qty; // delta real (respeita o piso 0)
  await prisma.product.update({ where: { id }, data: { qty: novaQtd } });
  if (efetivo !== 0) {
    await prisma.stockMovement.create({
      data: {
        productId: id,
        delta: efetivo,
        reason: motivo?.trim() || (efetivo > 0 ? "Entrada manual" : "Saída manual"),
        actor: admin.name,
      },
    });
  }
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

export async function criarProduto(input: {
  produto: string;
  marca: string;
  codigo: string;
  qtd: number;
  minimo: number;
  preco?: number | null;
}) {
  const admin = await requireAdmin();
  const created = await prisma.product.create({
    data: {
      name: input.produto,
      brand: input.marca || null,
      code: input.codigo,
      qty: input.qtd,
      min: input.minimo,
      price: input.preco ?? null,
    },
  });
  if (input.qtd > 0) {
    await prisma.stockMovement.create({
      data: { productId: created.id, delta: input.qtd, reason: "Estoque inicial", actor: admin.name },
    });
  }
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}
```

(Atenção: `brand: input.marca || null` muda o comportamento atual que gravava `""` — melhoria consciente.)

- [ ] **Step 2: Novas actions `editarProduto` e `excluirProduto`**

Logo após `criarProduto`:

```ts
// Edita cadastro do produto. Quantidade fica de fora de propósito:
// ela só muda via movimentação, para a trilha de auditoria valer.
export async function editarProduto(
  id: string,
  input: { produto: string; marca: string; codigo: string; minimo: number; preco: number | null }
) {
  await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: {
      name: input.produto,
      brand: input.marca || null,
      code: input.codigo,
      min: input.minimo,
      price: input.preco,
    },
  });
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

// Exclui produto E sua trilha de movimentações (schema é Restrict).
// A UI confirma antes, avisando quantas movimentações vão junto.
export async function excluirProduto(id: string) {
  await requireAdmin();
  await prisma.stockMovement.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}
```

- [ ] **Step 3: Verificar e commitar**

Run: `npm run build 2>&1 | tail -5` — OK (a verificação funcional dessas actions acontece pela UI na Task 7, pois exigem sessão admin).

```bash
git add app/oficina/actions.ts
git commit -m "feat(estoque): actions de motivo, edicao, exclusao e preco"
```

---

### Task 7: `StockManager` — busca, ordenação, movimentar c/ quantidade, editar, excluir, preço

**Files:**
- Modify: `app/oficina/_components/stock-manager.tsx` (reescrita)
- Modify: `app/oficina/estoque/page.tsx` (stat "valor em estoque")

**Interfaces:**
- Consumes: Task 2 (componentes/matches), Task 6 (actions), `Produto` com `preco`/`movs` (Task 1).
- Produces: mesma prop `StockManager({ seed: Produto[] })` — a página não muda a chamada.

- [ ] **Step 1: Reescrever `stock-manager.tsx`**

```tsx
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
  const [mov, setMov] = useState({ tipo: "entrada" as "entrada" | "saida", qtd: 1, motivo: "" });
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
    const payload = { ...novo, preco: novo.preco || null };
    setItens((x) => [{ id: `p${Date.now()}`, ...novo, preco: novo.preco || null, movs: novo.qtd > 0 ? 1 : 0 }, ...x]);
    setNovo(NOVO_VAZIO);
    setShowForm(false);
    startTransition(() => criarProduto(payload));
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
              {lista.map((p) => {
                const baixo = p.qtd < p.minimo;
                return (
                  <FragmentRow
                    key={p.id}
                    p={p}
                    baixo={baixo}
                    movAberto={movId === p.id}
                    editAberto={editId === p.id}
                    delAberto={delId === p.id}
                    mov={mov}
                    setMov={setMov}
                    edit={edit}
                    setEdit={setEdit}
                    onToggleMov={() => { const abre = movId !== p.id; fecharPaineis(); if (abre) { setMovId(p.id); setMov({ tipo: "entrada", qtd: 1, motivo: "" }); } }}
                    onToggleEdit={() => (editId === p.id ? setEditId(null) : abrirEdicao(p))}
                    onToggleDel={() => { const abre = delId !== p.id; fecharPaineis(); if (abre) setDelId(p.id); }}
                    onMais={() => movimentar(p.id, 1)}
                    onMenos={() => movimentar(p.id, -1)}
                    onConfirmarMov={() => { movimentar(p.id, mov.tipo === "saida" ? -mov.qtd : mov.qtd, mov.motivo); setMovId(null); }}
                    onSalvarEdicao={() => salvarEdicao(p.id)}
                    onExcluir={() => excluir(p.id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
```

E, no mesmo arquivo, o componente de linha (linha normal + painel inline):

```tsx
function FragmentRow({
  p, baixo, movAberto, editAberto, delAberto, mov, setMov, edit, setEdit,
  onToggleMov, onToggleEdit, onToggleDel, onMais, onMenos, onConfirmarMov, onSalvarEdicao, onExcluir,
}: {
  p: Produto;
  baixo: boolean;
  movAberto: boolean;
  editAberto: boolean;
  delAberto: boolean;
  mov: { tipo: "entrada" | "saida"; qtd: number; motivo: string };
  setMov: React.Dispatch<React.SetStateAction<{ tipo: "entrada" | "saida"; qtd: number; motivo: string }>>;
  edit: { produto: string; marca: string; codigo: string; minimo: number; preco: number };
  setEdit: React.Dispatch<React.SetStateAction<{ produto: string; marca: string; codigo: string; minimo: number; preco: number }>>;
  onToggleMov: () => void;
  onToggleEdit: () => void;
  onToggleDel: () => void;
  onMais: () => void;
  onMenos: () => void;
  onConfirmarMov: () => void;
  onSalvarEdicao: () => void;
  onExcluir: () => void;
}) {
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
              <select value={mov.tipo} onChange={(e) => setMov((m) => ({ ...m, tipo: e.target.value as "entrada" | "saida" }))} className="rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]" aria-label="Tipo de movimentação">
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </select>
              <input type="number" min={1} value={mov.qtd || ""} onChange={(e) => setMov((m) => ({ ...m, qtd: Math.max(1, Number(e.target.value)) }))} className="w-24 rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]" aria-label="Quantidade da movimentação" />
              <input list="mov-motivos" value={mov.motivo} onChange={(e) => setMov((m) => ({ ...m, motivo: e.target.value }))} placeholder="Motivo (Compra, Uso em OS…)" className="min-w-48 flex-1 rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)] sm:max-w-64" />
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
```

- [ ] **Step 2: Stat "valor em estoque" na página**

`app/oficina/estoque/page.tsx` — adicionar o cálculo e o stat:

```tsx
import { brl } from "../_data/mock";
// ...
const baixo = estoque.filter((p) => p.qtd < p.minimo).length;
const valorEstoque = estoque.reduce((s, p) => s + (p.preco ?? 0) * p.qtd, 0);
// ...
stats={[
  { label: "itens", value: estoque.length.toString() },
  { label: "abaixo do mínimo", value: baixo.toString(), accent: baixo > 0 },
  { label: "valor em estoque", value: brl(valorEstoque) },
]}
```

- [ ] **Step 3: Verificação funcional no browser (banco é PRODUÇÃO — usar produto TESTE)**

Run: `npm run build 2>&1 | tail -5` — OK. Depois `npm run dev`, logar como admin, `/oficina/estoque`:

1. **Criar** produto `TESTE PLANO` (código `TESTE-1`, qtd 10, mín 2, preço 50) → aparece na tabela; stat "valor em estoque" soma R$ 500 após reload.
2. **Movimentar**: abrir painel, Saída, qtd 4, motivo `Uso em OS` → qtd vira 6; em Movimentações (StockHistory, após reload) aparece `-4 · Uso em OS`.
3. **±1**: botões continuam funcionando (motivo default "Entrada/Saída manual").
4. **Editar**: trocar preço para 80 e mínimo para 8 → status vira "Baixo" (6 < 8); reload confirma persistência.
5. **Busca** `teste` acha o produto; chip **Abaixo do mínimo** o inclui; ordenação **Status** o põe no topo.
6. **Excluir**: painel avisa "Apaga também as N movimentações"; confirmar → some; **reload** → continua ausente e o histórico não tem mais as linhas do TESTE.

- [ ] **Step 4: Commit**

```bash
git add app/oficina/_components/stock-manager.tsx app/oficina/estoque/page.tsx
git commit -m "feat(estoque): busca, ordenacao, movimentacao com quantidade, edicao, exclusao e preco"
```

---

### Task 8: Verificação final integrada

**Files:** nenhum novo (correções pontuais se a verificação achar problema).

- [ ] **Step 1: Build + lint limpos**

Run: `npm run build 2>&1 | tail -5 && npm run lint 2>&1 | tail -3`
Expected: ambos sem erro/warning.

- [ ] **Step 2: Passada de browser nas 4 páginas**

Com `npm run dev` e sessão admin (atenção ao gotcha conhecido: esperar compilar/`wait_for` antes de medir):
- `/oficina/clientes`: busca por nome/placa/telefone; chips; limpar.
- `/oficina/veiculos`: busca; select de marca; chip revisão vencida.
- `/oficina/ordens`: abas + busca + select mecânico convivem.
- `/oficina/estoque`: fluxo TESTE completo da Task 7 já validado; conferir que não sobrou produto TESTE.

- [ ] **Step 3: Commit final (se houve ajustes)**

```bash
git add -A && git commit -m "fix(oficina): ajustes da verificacao final de busca e filtros"
```

**NÃO fazer `git push`** — publicar é decisão do usuário (push = deploy).
