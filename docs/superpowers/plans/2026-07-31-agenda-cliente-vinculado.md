# Agenda com cliente vinculado — Implementation Plan (fase 1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permitir que o novo agendamento aponte para um cliente cadastrado (buscando conforme digita) ou para um nome avulso, e tornar a página de agenda utilizável — agrupada por dia, com busca, filtros, edição, cancelamento e atalho para dar entrada.

**Architecture:** O model `Appointment` já tem `clientId`; falta preenchê-lo e acrescentar `vehicleId`. A busca conforme digita sai de um `Combobox` genérico novo (que a fase 2 reaproveita para produtos). Toda a lógica pura — normalização de status e agrupamento por dia — vai para `lib/agendamentos.ts`, coberta por testes; os componentes são verificados com lint, `tsc` e navegador.

**Tech Stack:** Next.js 16.2.9 (App Router, Server Actions), React 19.2.4, Prisma 7 (`prisma-client` gerando em `lib/generated/prisma`), Tailwind v4, lucide-react, vitest (introduzido na Task 1).

**Spec:** `docs/superpowers/specs/2026-07-31-agenda-estoque-design.md` (partes marcadas "Parte 1 — Agenda").

## Global Constraints

- **Next 16 não é o Next que você conhece.** `params` e `searchParams` em páginas são `Promise` e precisam de `await` (ver `app/oficina/ordens/[id]/page.tsx:8`). Consulte `node_modules/next/dist/docs/` antes de usar qualquer API que não esteja neste plano — é o que manda o `AGENTS.md` do repositório.
- **O Prisma Client é gerado em `lib/generated/prisma`**, não em `node_modules`. Depois de mexer no `prisma/schema.prisma`, rode `npx prisma generate`.
- **Toda server action do admin começa com `await requireAdmin()`** (`lib/auth.ts:111`) e termina com `revalidatePath` das rotas afetadas. Sem exceção — é a fronteira de autorização.
- **Datas de agendamento no banco são ISO `"YYYY-MM-DD"`.** Formatação só na renderização. Use os helpers de `lib/datas.ts` (`hojeISO`, `dataBR`, `rotuloDia`); nunca `new Date()` no cliente para decidir que dia é hoje — o servidor da Vercel roda em UTC e `lib/datas.ts` ancora tudo em `America/Sao_Paulo`.
- **Dinheiro no sistema é `Int` em reais inteiros.** Nada nesta fase mexe com dinheiro.
- **Idioma:** identificadores em português quando o domínio é português (é o padrão do repositório: `criarAgendamento`, `movimentarEstoque`). Textos de UI em português do Brasil.
- **Classes CSS do admin** vêm de `app/oficina/admin.css` (`adm-ink`, `adm-muted`, `adm-brand`, `adm-card`, `osb*`). Não introduza cores soltas fora das variáveis `--ad-*`.
- **Commits:** mensagem no formato `tipo(escopo): descrição` em português, sem acentos no título (padrão do histórico do repositório).

---

### Task 1: Vocabulário único de status de agendamento

Hoje existem quatro vocabulários. O form do admin grava `"Confirmado"`/`"Aguardando"`; o portal do cliente grava `"Agendado"`; `getAgendaHoje` achata tudo em dois; e os tipos divergem entre `app/oficina/_data/mock.ts:191` (`"Confirmado" | "Aguardando"`) e `app/app/_data/mock.ts:16` (`"Agendado" | "Confirmado" | "Em andamento" | "Finalizado"`). Pior: `lib/client-data.ts:316` faz `a.status as Agendamento["status"]`, um cast sem verificação — um status desconhecido passa pelo TypeScript e vira `class={undefined}` no portal.

Esta task cria a definição única, com testes, e conserta todos os consumidores para o `tsc` continuar verde.

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/agendamentos.ts`
- Create: `lib/agendamentos.test.ts`
- Modify: `package.json` (script `test` + devDependency `vitest`)
- Modify: `app/app/_data/mock.ts:16-21` (`StatusAgendamento` passa a reexportar)
- Modify: `app/oficina/_data/mock.ts:191` (`status` passa a usar `StatusAgendamento`)
- Modify: `app/app/_components/category.tsx:54-59` (`agendamentoBadge`)
- Modify: `lib/client-data.ts:316` (cast → `normalizarStatus`)
- Modify: `lib/admin-data.ts:348-364` (`getAgendaHoje` para de achatar)
- Modify: `app/oficina/page.tsx:320` (badge do dashboard)
- Modify: `app/oficina/_components/agenda-manager.tsx:106` (badge da lista)
- Modify: `app/oficina/admin.css` (após a linha 165: classe `.osb-cancelada`)

**Interfaces:**
- Consumes: `rotuloDia` de `lib/datas.ts`.
- Produces:
  - `STATUS_AGENDAMENTO: readonly ["Agendado","Confirmado","Compareceu","Faltou","Cancelado"]`
  - `type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number]`
  - `normalizarStatus(bruto: string | null | undefined): StatusAgendamento`
  - `STATUS_INATIVOS: readonly StatusAgendamento[]`
  - `badgeAdmin: Record<StatusAgendamento, string>`
  - `badgePortal: Record<StatusAgendamento, string>`
  - `rotuloDoDia(iso: string, hoje: string): string`
  - `type GrupoDia<T> = { iso: string; rotulo: string; itens: T[] }`
  - `agruparPorDia<T extends { data: string }>(itens: T[], hoje: string): { futuros: GrupoDia<T>[]; passados: GrupoDia<T>[] }`

- [x] **Step 1: Instalar o vitest**

Este projeto não tem infraestrutura de teste. A convenção adotada é a mesma que o usuário já usa em outro projeto: **vitest em ambiente node, cobrindo só lógica pura** — nada de DOM nem `@testing-library`. Componentes são verificados com lint, `tsc` e navegador.

```bash
npm install --save-dev vitest
```

- [x] **Step 2: Configurar o vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";

// Só lógica pura, em ambiente node. Componentes React não são testados aqui —
// a verificação deles é lint + tsc + navegador.
export default defineConfig({
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts"],
  },
});
```

Modify `package.json`, acrescentando aos `scripts` (depois de `"lint": "eslint"`):

```json
    "test": "vitest run",
    "test:watch": "vitest",
```

- [x] **Step 3: Escrever os testes que falham**

Create `lib/agendamentos.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { agruparPorDia, normalizarStatus, rotuloDoDia } from "./agendamentos";

describe("normalizarStatus", () => {
  it("mantem os status canonicos", () => {
    expect(normalizarStatus("Agendado")).toBe("Agendado");
    expect(normalizarStatus("Confirmado")).toBe("Confirmado");
    expect(normalizarStatus("Compareceu")).toBe("Compareceu");
    expect(normalizarStatus("Faltou")).toBe("Faltou");
    expect(normalizarStatus("Cancelado")).toBe("Cancelado");
  });

  it("traduz o legado 'Aguardando' para 'Agendado'", () => {
    expect(normalizarStatus("Aguardando")).toBe("Agendado");
  });

  it("cai em 'Agendado' para valor desconhecido, nulo ou vazio", () => {
    expect(normalizarStatus("Em andamento")).toBe("Agendado");
    expect(normalizarStatus("qualquer coisa")).toBe("Agendado");
    expect(normalizarStatus("")).toBe("Agendado");
    expect(normalizarStatus(null)).toBe("Agendado");
    expect(normalizarStatus(undefined)).toBe("Agendado");
  });
});

describe("rotuloDoDia", () => {
  it("chama de Hoje a propria data", () => {
    expect(rotuloDoDia("2026-07-31", "2026-07-31")).toBe("Hoje");
  });

  it("chama de Amanha o dia seguinte", () => {
    expect(rotuloDoDia("2026-08-01", "2026-07-31")).toBe("Amanhã");
  });

  it("atravessa a virada do ano", () => {
    expect(rotuloDoDia("2027-01-01", "2026-12-31")).toBe("Amanhã");
  });

  it("usa dia da semana e data nas demais", () => {
    // 2026-08-03 é uma segunda-feira.
    expect(rotuloDoDia("2026-08-03", "2026-07-31")).toBe("Seg · 03/08");
  });
});

describe("agruparPorDia", () => {
  const itens = [
    { id: "a", data: "2026-07-29" },
    { id: "b", data: "2026-08-02" },
    { id: "c", data: "2026-07-31" },
    { id: "d", data: "2026-07-31" },
    { id: "e", data: "2026-07-20" },
  ];

  it("separa futuros de passados usando o hoje recebido", () => {
    const { futuros, passados } = agruparPorDia(itens, "2026-07-31");
    expect(futuros.map((g) => g.iso)).toEqual(["2026-07-31", "2026-08-02"]);
    expect(passados.map((g) => g.iso)).toEqual(["2026-07-29", "2026-07-20"]);
  });

  it("trata o proprio dia de hoje como futuro", () => {
    const { futuros } = agruparPorDia([{ id: "x", data: "2026-07-31" }], "2026-07-31");
    expect(futuros[0].rotulo).toBe("Hoje");
  });

  it("junta itens do mesmo dia num grupo so", () => {
    const { futuros } = agruparPorDia(itens, "2026-07-31");
    expect(futuros[0].itens.map((i) => i.id)).toEqual(["c", "d"]);
  });

  it("ordena passados do mais recente para o mais antigo", () => {
    const { passados } = agruparPorDia(itens, "2026-07-31");
    expect(passados[0].iso).toBe("2026-07-29");
  });

  it("devolve listas vazias sem itens", () => {
    expect(agruparPorDia([], "2026-07-31")).toEqual({ futuros: [], passados: [] });
  });
});
```

- [x] **Step 4: Rodar os testes e confirmar que falham**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./agendamentos"`.

- [x] **Step 5: Implementar `lib/agendamentos.ts`**

Create `lib/agendamentos.ts`:

```ts
// Vocabulário único de status de agendamento. Antes existiam quatro: o form do
// admin gravava "Confirmado"/"Aguardando", o portal do cliente grava "Agendado",
// e cada lado tinha seu próprio tipo — com um cast sem verificação no meio.
import { rotuloDia } from "./datas";

export const STATUS_AGENDAMENTO = [
  "Agendado",
  "Confirmado",
  "Compareceu",
  "Faltou",
  "Cancelado",
] as const;

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

/** Status que não contam como compromisso ativo — aparecem esmaecidos. */
export const STATUS_INATIVOS: readonly StatusAgendamento[] = ["Faltou", "Cancelado"];

/**
 * Converte o que veio do banco (String livre) num status conhecido.
 * "Aguardando" é o valor legado do form antigo do admin. Qualquer valor
 * desconhecido cai em "Agendado" — nunca devolve undefined, que viraria
 * `class={undefined}` no mapa de badge.
 */
export function normalizarStatus(bruto: string | null | undefined): StatusAgendamento {
  if (bruto === "Aguardando") return "Agendado";
  return (STATUS_AGENDAMENTO as readonly string[]).includes(bruto ?? "")
    ? (bruto as StatusAgendamento)
    : "Agendado";
}

export const badgeAdmin: Record<StatusAgendamento, string> = {
  Agendado: "osb osb-aberta",
  Confirmado: "osb osb-finalizada",
  Compareceu: "osb osb-execucao",
  Faltou: "osb osb-cancelada",
  Cancelado: "osb osb-entregue",
};

export const badgePortal: Record<StatusAgendamento, string> = {
  Agendado: "badge badge-agendado",
  Confirmado: "badge badge-confirmado",
  Compareceu: "badge badge-finalizado",
  Faltou: "badge badge-rejeitado",
  Cancelado: "badge badge-rejeitado",
};

// Meio-dia UTC para somar dias sem que fuso ou horário de verão mudem a data —
// mesmo truque que `rotuloDia` já usa em lib/datas.ts.
function diaSeguinte(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** "Hoje", "Amanhã" ou "Seg · 03/08". `hoje` vem do servidor via hojeISO(). */
export function rotuloDoDia(iso: string, hoje: string): string {
  if (iso === hoje) return "Hoje";
  if (iso === diaSeguinte(hoje)) return "Amanhã";
  return rotuloDia(iso);
}

export type GrupoDia<T> = { iso: string; rotulo: string; itens: T[] };

/**
 * Agrupa por data ISO em blocos de dia. Futuros (inclusive hoje) em ordem
 * crescente; passados em ordem decrescente, o mais recente primeiro.
 * Datas ISO "YYYY-MM-DD" comparam corretamente como string.
 */
export function agruparPorDia<T extends { data: string }>(
  itens: T[],
  hoje: string
): { futuros: GrupoDia<T>[]; passados: GrupoDia<T>[] } {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const lista = mapa.get(item.data);
    if (lista) lista.push(item);
    else mapa.set(item.data, [item]);
  }
  const grupos = [...mapa.entries()].map(([iso, lista]) => ({
    iso,
    rotulo: rotuloDoDia(iso, hoje),
    itens: lista,
  }));
  return {
    futuros: grupos.filter((g) => g.iso >= hoje).sort((a, b) => a.iso.localeCompare(b.iso)),
    passados: grupos.filter((g) => g.iso < hoje).sort((a, b) => b.iso.localeCompare(a.iso)),
  };
}
```

- [x] **Step 6: Rodar os testes e confirmar que passam**

Run: `npm test`
Expected: PASS — 12 testes.

- [x] **Step 7: Acrescentar a classe CSS que falta**

`badgeAdmin` usa `osb-cancelada`, que não existe. Modify `app/oficina/admin.css`, logo após a linha `.osb-entregue` (linha 165):

```css
.osb-cancelada  { color: #fca5a5; background: rgba(220, 38, 38, 0.16); }
```

- [x] **Step 8: Apontar os tipos existentes para a definição única**

Modify `app/app/_data/mock.ts` — substituir o bloco das linhas 16-21:

```ts
export type StatusAgendamento =
  | "Agendado"
  | "Confirmado"
  | "Em andamento"
  | "Finalizado";
```

por:

```ts
// Definição única em lib/agendamentos.ts; reexportada aqui porque as telas do
// portal já importam daqui.
export type { StatusAgendamento } from "@/lib/agendamentos";
```

Modify `app/oficina/_data/mock.ts` — trocar a linha 191:

```ts
  status: "Confirmado" | "Aguardando";
```

por:

```ts
  status: StatusAgendamento;
```

e acrescentar no topo do arquivo (após a linha 2):

```ts
import type { StatusAgendamento } from "@/lib/agendamentos";
```

- [x] **Step 9: Trocar o mapa de badge do portal**

Modify `app/app/_components/category.tsx` — substituir o bloco `agendamentoBadge` (linhas 54-59) por:

```ts
export { badgePortal as agendamentoBadge } from "@/lib/agendamentos";
```

Se algum consumidor indexar `agendamentoBadge` com uma `string` solta em vez de `StatusAgendamento`, o `tsc` vai apontar — corrija passando o valor por `normalizarStatus` na origem, nunca com `as`.

- [x] **Step 10: Eliminar o cast sem verificação**

Modify `lib/client-data.ts` linha 316:

```ts
    status: a.status as Agendamento["status"],
```

por:

```ts
    status: normalizarStatus(a.status),
```

e acrescentar o import no topo do arquivo:

```ts
import { normalizarStatus } from "./agendamentos";
```

- [x] **Step 11: Parar de achatar o status no `getAgendaHoje`**

Modify `lib/admin-data.ts` — na função `getAgendaHoje` (linha 348), trocar:

```ts
    status: a.status === "Confirmado" ? "Confirmado" : "Aguardando",
```

por:

```ts
    status: normalizarStatus(a.status),
```

e acrescentar `normalizarStatus` aos imports de `@/lib/agendamentos` no topo do arquivo. Remova também o comentário das linhas 350-351, que descrevia o achatamento antigo.

- [x] **Step 12: Usar o mapa de badge nas duas telas do admin**

Modify `app/oficina/page.tsx` linha 320 — trocar:

```tsx
                    a.status === "Confirmado" ? "osb osb-finalizada" : "osb osb-aguardando"
```

por `badgeAdmin[a.status]`, importando `badgeAdmin` de `@/lib/agendamentos`.

Modify `app/oficina/_components/agenda-manager.tsx` linha 106 — trocar:

```tsx
            <span className={a.status === "Confirmado" ? "osb osb-finalizada" : "osb osb-aguardando"}>{a.status}</span>
```

por:

```tsx
            <span className={badgeAdmin[normalizarStatus(a.status)]}>{a.status}</span>
```

importando `badgeAdmin` **e** `normalizarStatus` de `@/lib/agendamentos`.

> `normalizarStatus` é necessário aqui: `AgendaItem.status` ainda é `string` neste ponto (só vira `StatusAgendamento` na Task 5), e indexar `Record<StatusAgendamento, string>` com `string` é erro de tipo. A Task 8 reescreve este arquivo e passa a indexar direto.

Em `app/oficina/page.tsx` o `normalizarStatus` **não** é preciso: o `a` ali vem de `getAgendaHoje()`, cujo status já é `StatusAgendamento` depois dos Steps 8 e 11.

- [x] **Step 13: Verificar tudo**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: 12 testes PASS, zero erro de tipo, zero erro de lint.

Se o `tsc` reclamar de `AgendaItem.status` em `lib/admin-data.ts:426` (ainda tipado como `string`), deixe como está — a Task 5 troca esse tipo. `string` aceita `StatusAgendamento` sem erro.

- [x] **Step 14: Commit**

```bash
git add vitest.config.ts package.json package-lock.json lib/agendamentos.ts lib/agendamentos.test.ts \
        lib/client-data.ts lib/admin-data.ts app/app/_data/mock.ts app/oficina/_data/mock.ts \
        app/app/_components/category.tsx app/oficina/page.tsx \
        app/oficina/_components/agenda-manager.tsx app/oficina/admin.css
git commit -m "refactor(agenda): vocabulario unico de status + vitest para logica pura"
```

---

### Task 2: `Appointment.vehicleId` no schema

O `clientId` já existe no model. Falta o vínculo com o veículo e um índice para a listagem, que ordena e agrupa por data.

**Files:**
- Modify: `prisma/schema.prisma:147-160` (model `Appointment`)
- Modify: `prisma/schema.prisma:37-62` (model `Vehicle` — lado inverso)

**Interfaces:**
- Produces: campo `vehicleId String?` e relação `vehicle` em `Appointment`; relação `appointments` em `Vehicle`.

- [x] **Step 1: Editar o schema**

Modify `prisma/schema.prisma`, no model `Appointment`, acrescentando após a linha `client       Client? @relation(...)`:

```prisma
  vehicleId   String?
  vehicle     Vehicle? @relation(fields: [vehicleId], references: [id])
```

e acrescentando um segundo índice junto do `@@index([clientId])`:

```prisma
  @@index([vehicleId])
  @@index([date])
```

No model `Vehicle`, acrescentar o lado inverso junto das outras relações (perto de `reminders` e `serviceOrders`):

```prisma
  appointments     Appointment[]
```

- [x] **Step 2: Validar o schema sem tocar no banco**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [x] **Step 3: PARAR e pedir confirmação ao usuário**

> ⚠️ **`db push` acerta o banco de PRODUÇÃO.** O `.env` local aponta para o mesmo Postgres da Vercel — é o risco 3 de `docs/DEPLOY.md`. São dados reais de 124 clientes.
>
> A mudança em si é **aditiva e não destrutiva**: uma coluna nula nova e dois índices. Nada é apagado nem reescrito. Ainda assim, **não rode sem confirmação explícita do usuário.**

Pergunte ao usuário e aguarde a resposta antes do Step 4.

- [x] **Step 4: Aplicar no banco e regerar o client**

Run: `npm run db:push && npx prisma generate`
Expected: `Your database is now in sync with your Prisma schema.` seguido de `Generated Prisma Client`.

- [x] **Step 5: Verificar que o client tem o campo novo**

Run: `npx tsc --noEmit`
Expected: zero erro. O tipo gerado em `lib/generated/prisma/models/Appointment.ts` passa a ter `vehicleId`.

- [x] **Step 6: Commit**

```bash
git add prisma/schema.prisma lib/generated/prisma
git commit -m "feat(agenda): vehicleId e indice de data no Appointment"
```

---

### Task 3: Combobox genérico

Componente de busca conforme digita, sem saber nada de agenda nem de estoque. A fase 2 reaproveita para escolher produto na entrada por nota fiscal — são dois consumidores concretos, não especulação.

**Files:**
- Create: `app/oficina/_components/combobox.tsx`

**Interfaces:**
- Consumes: `matches` de `./filter-utils`.
- Produces:
  - `type ComboOption = { id: string; label: string; hint?: string }`
  - `type ComboValue = { id: string | null; texto: string }`
  - `Combobox` com as props: `value: ComboValue`, `onChange: (v: ComboValue) => void`, `options: ComboOption[]`, `ariaLabel: string`, `placeholder?: string`, `criarLabel?: (texto: string) => string`, `onCriar?: (texto: string) => void`, `className?: string`

- [x] **Step 1: Escrever o componente**

Create `app/oficina/_components/combobox.tsx`:

```tsx
"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { matches } from "./filter-utils";

export type ComboOption = { id: string; label: string; hint?: string };
/** `id` nulo = texto livre, sem vínculo com registro do banco. */
export type ComboValue = { id: string | null; texto: string };

const MAX_VISIVEIS = 50;

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";

export function Combobox({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder,
  criarLabel,
  onCriar,
  className = "",
}: {
  value: ComboValue;
  onChange: (v: ComboValue) => void;
  options: ComboOption[];
  ariaLabel: string;
  placeholder?: string;
  criarLabel?: (texto: string) => string;
  onCriar?: (texto: string) => void;
  className?: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [realce, setRealce] = useState(0);
  const raizRef = useRef<HTMLDivElement>(null);
  const listaId = useId();

  // matches() ignora acento e pontuação: "jose" acha "José Antônio".
  const achadas = useMemo(
    () => options.filter((o) => matches([o.label, o.hint], value.texto)),
    [options, value.texto]
  );
  const visiveis = achadas.slice(0, MAX_VISIVEIS);

  const podeCriar =
    !!criarLabel &&
    !!onCriar &&
    value.texto.trim() !== "" &&
    !achadas.some((o) => o.label.toLowerCase() === value.texto.trim().toLowerCase());

  const total = visiveis.length + (podeCriar ? 1 : 0);

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!aberto) return;
    function fora(e: PointerEvent) {
      if (!raizRef.current?.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("pointerdown", fora);
    return () => document.removeEventListener("pointerdown", fora);
  }, [aberto]);

  function escolher(i: number) {
    if (podeCriar && i === visiveis.length) {
      onCriar?.(value.texto.trim());
    } else {
      const o = visiveis[i];
      if (o) onChange({ id: o.id, texto: o.label });
    }
    setAberto(false);
  }

  function aoTeclar(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!aberto) {
        setAberto(true);
        setRealce(0);
        return;
      }
      if (total === 0) return;
      setRealce((r) => (e.key === "ArrowDown" ? (r + 1) % total : (r - 1 + total) % total));
    } else if (e.key === "Enter") {
      if (aberto && total > 0) {
        e.preventDefault();
        escolher(realce);
      }
    } else if (e.key === "Escape") {
      setAberto(false);
    }
  }

  return (
    <div ref={raizRef} className={`relative ${className}`}>
      <input
        type="text"
        role="combobox"
        aria-expanded={aberto}
        aria-controls={listaId}
        aria-autocomplete="list"
        aria-activedescendant={aberto && total > 0 ? `${listaId}-${realce}` : undefined}
        aria-label={ariaLabel}
        placeholder={placeholder}
        autoComplete="off"
        value={value.texto}
        onChange={(e) => {
          // Editar o texto desfaz o vínculo: o que está escrito deixa de ser
          // garantidamente o registro escolhido antes.
          onChange({ id: null, texto: e.target.value });
          setAberto(true);
          setRealce(0);
        }}
        onFocus={() => setAberto(true)}
        onKeyDown={aoTeclar}
        className={inputCls}
      />

      {aberto && total > 0 && (
        <ul
          id={listaId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface)] py-1 shadow-xl"
        >
          {visiveis.map((o, i) => (
            <li
              key={o.id}
              id={`${listaId}-${i}`}
              role="option"
              aria-selected={i === realce}
              onPointerDown={(e) => {
                e.preventDefault(); // não tira o foco do input antes do clique
                escolher(i);
              }}
              onPointerEnter={() => setRealce(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === realce ? "bg-[var(--ad-surface-2)] adm-ink" : "adm-muted"
              }`}
            >
              {o.label}
              {o.hint && <span className="ml-2 font-mono text-xs adm-muted">{o.hint}</span>}
            </li>
          ))}

          {podeCriar && (
            <li
              id={`${listaId}-${visiveis.length}`}
              role="option"
              aria-selected={realce === visiveis.length}
              onPointerDown={(e) => {
                e.preventDefault();
                escolher(visiveis.length);
              }}
              onPointerEnter={() => setRealce(visiveis.length)}
              className={`cursor-pointer border-t border-[var(--ad-line)] px-3 py-2 text-sm font-semibold adm-brand ${
                realce === visiveis.length ? "bg-[var(--ad-surface-2)]" : ""
              }`}
            >
              {criarLabel?.(value.texto.trim())}
            </li>
          )}
        </ul>
      )}

      {aberto && achadas.length > MAX_VISIVEIS && (
        <p className="absolute z-20 mt-1 w-full rounded-b-lg bg-[var(--ad-surface-2)] px-3 py-1 text-xs adm-muted">
          Mostrando {MAX_VISIVEIS} de {achadas.length} — refine a busca.
        </p>
      )}
    </div>
  );
}
```

- [x] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: zero erro em ambos. O componente ainda não é usado por ninguém — é esperado.

- [x] **Step 3: Commit**

```bash
git add app/oficina/_components/combobox.tsx
git commit -m "feat(admin): combobox generico de busca conforme digita"
```

---

### Task 4: Seletor de cliente + veículos por id

O `client-picker` é uma casca fina sobre o `Combobox`. Junto, conserta-se a fonte de dados: `getClientesVeiculosParaOS` devolve `proprietario` como **nome**, e `new-order-form.tsx:50` filtra veículos comparando strings de nome — dois clientes homônimos misturam os carros.

**Files:**
- Create: `app/oficina/_components/client-picker.tsx`
- Modify: `lib/admin-data.ts:513-523` (`getClientesVeiculosParaOS`)
- Modify: `app/oficina/_components/new-order-form.tsx:9-14,48-52` (filtro por id)

**Interfaces:**
- Consumes: `Combobox`, `ComboValue` da Task 3.
- Produces:
  - `type ClienteOpt = { id: string; nome: string }`
  - `type VeiculoOpt = { id: string; clienteId: string | null; proprietario: string; modelo: string; placa: string }`
  - `ClientPicker` com props `value: ComboValue`, `onChange: (v: ComboValue) => void`, `clientes: ClienteOpt[]`, `veiculos: VeiculoOpt[]`
  - `getClientesVeiculosParaOS()` passa a devolver `clienteId` em cada veículo.

- [x] **Step 1: Acrescentar `clienteId` na fonte de dados**

Modify `lib/admin-data.ts`, na função `getClientesVeiculosParaOS` (linha 513), trocar o `map` de veículos:

```ts
    veiculos: veiculos.map((v) => ({ id: v.id, proprietario: v.client?.name ?? "—", modelo: `${v.brand} ${v.model}`, placa: v.plate })),
```

por:

```ts
    veiculos: veiculos.map((v) => ({
      id: v.id,
      clienteId: v.clientId,
      proprietario: v.client?.name ?? "—",
      modelo: `${v.brand} ${v.model}`,
      placa: v.plate,
    })),
```

- [x] **Step 2: Filtrar por id no formulário de nova OS**

Modify `app/oficina/_components/new-order-form.tsx`, acrescentando `clienteId` à interface `VeiculoOpt` (por volta da linha 14):

```ts
interface VeiculoOpt {
  id: string;
  clienteId: string | null;
  proprietario: string;
  modelo: string;
  placa: string;
}
```

e trocando o filtro das linhas 48-52:

```ts
  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome ?? "";
  const veiculosDoCliente = clienteId
    ? veiculos.filter((v) => v.proprietario === clienteNome)
    : veiculos;
```

por:

```ts
  const clienteNome = clientes.find((c) => c.id === clienteId)?.nome ?? "";
  // Filtra por id, não por nome: dois clientes homônimos misturariam os carros.
  const veiculosDoCliente = clienteId ? veiculos.filter((v) => v.clienteId === clienteId) : veiculos;
```

- [x] **Step 3: Escrever o seletor de cliente**

Create `app/oficina/_components/client-picker.tsx`:

```tsx
"use client";

import { Combobox, type ComboValue } from "./combobox";

export type ClienteOpt = { id: string; nome: string };
export type VeiculoOpt = {
  id: string;
  clienteId: string | null;
  proprietario: string;
  modelo: string;
  placa: string;
};

/**
 * Escolhe um cliente cadastrado OU aceita um nome avulso, no mesmo campo.
 * `value.id` preenchido = cadastrado; nulo com texto = avulso.
 */
export function ClientPicker({
  value,
  onChange,
  clientes,
  veiculos,
}: {
  value: ComboValue;
  onChange: (v: ComboValue) => void;
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
}) {
  const options = clientes.map((c) => ({ id: c.id, label: c.nome }));
  const nVeiculos = value.id ? veiculos.filter((v) => v.clienteId === value.id).length : 0;

  return (
    <div>
      <Combobox
        value={value}
        onChange={onChange}
        options={options}
        ariaLabel="Cliente"
        placeholder="Buscar cliente ou digitar nome avulso…"
      />
      <p className="mt-1 text-xs">
        {value.id ? (
          <span className="text-emerald-400">
            ● cliente cadastrado · {nVeiculos} veículo(s)
          </span>
        ) : value.texto.trim() ? (
          <span className="adm-muted">○ avulso — não vai aparecer no app dele</span>
        ) : (
          <span className="adm-muted">Busque um cliente cadastrado ou digite um nome avulso.</span>
        )}
      </p>
    </div>
  );
}
```

- [x] **Step 4: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: zero erro em ambos.

- [ ] **Step 5: Verificar no navegador que a OS não quebrou**

Run: `npm run dev` (se ainda não estiver rodando)

Abra `http://localhost:3000/oficina/ordens/nova`, faça login como admin se preciso, escolha um cliente e confirme que a lista de veículos mostra só os carros dele. Este é o caminho que a mudança de filtro tocou.

- [x] **Step 6: Commit**

```bash
git add lib/admin-data.ts app/oficina/_components/new-order-form.tsx app/oficina/_components/client-picker.tsx
git commit -m "feat(admin): seletor de cliente e filtro de veiculos por id"
```

---

### Task 5: Leitura da agenda com os vínculos

`AgendaItem` hoje só carrega textos. Precisa dos ids para o formulário de edição e para o botão "cliente chegou".

**Files:**
- Modify: `lib/admin-data.ts:419-444` (`AgendaItem` e `getAgendaAdmin`)
- Modify: `app/oficina/agenda/page.tsx`

**Interfaces:**
- Consumes: `normalizarStatus`, `StatusAgendamento` (Task 1); `getClientesVeiculosParaOS` com `clienteId` (Task 4); `vehicleId` no schema (Task 2).
- Produces:
  ```ts
  export type AgendaItem = {
    id: string;
    data: string;
    hora: string;
    clienteId: string | null;
    cliente: string;
    veiculoId: string | null;
    veiculo: string;
    placa: string | null;
    servico: string;
    status: StatusAgendamento;
  };
  ```

- [x] **Step 1: Enriquecer o tipo e a query**

Modify `lib/admin-data.ts`, substituindo o bloco das linhas 419-444:

```ts
export type AgendaItem = {
  id: string;
  data: string;
  hora: string;
  clienteId: string | null;
  cliente: string;
  veiculoId: string | null;
  veiculo: string;
  placa: string | null;
  servico: string;
  status: StatusAgendamento;
};

export async function getAgendaAdmin(): Promise<AgendaItem[]> {
  await requireAdmin();
  const rows = await prisma.appointment.findMany({
    include: { client: true, vehicle: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    data: a.date,
    hora: a.time,
    clienteId: a.clientId,
    // clientName só é preenchido para cliente avulso; com vínculo, o nome vem
    // da relação e acompanha renomeações.
    cliente: a.clientName ?? a.client?.name ?? "—",
    veiculoId: a.vehicleId,
    veiculo: a.vehicle ? `${a.vehicle.brand} ${a.vehicle.model}` : a.vehicleName,
    placa: a.vehicle?.plate ?? null,
    servico: a.service,
    status: normalizarStatus(a.status),
  }));
}
```

Confirme que `StatusAgendamento` está nos imports de `@/lib/agendamentos` no topo do arquivo (o `normalizarStatus` já entrou na Task 1).

- [x] **Step 2: Carregar clientes, veículos e o "hoje" do servidor na página**

Modify `app/oficina/agenda/page.tsx` inteiro:

```tsx
import { getAgendaAdmin, getClientesVeiculosParaOS } from "@/lib/admin-data";
import { hojeISO } from "@/lib/datas";
import { AgendaManager } from "../_components/agenda-manager";
import { PageHeader } from "../_components/ui";

export default async function AgendaPage() {
  const [agenda, { clientes, veiculos }] = await Promise.all([
    getAgendaAdmin(),
    getClientesVeiculosParaOS(),
  ]);
  // "Hoje" é calculado no servidor: lib/datas.ts ancora em America/Sao_Paulo e
  // a Vercel roda em UTC. Calcular no cliente divergiria depois das 21h e
  // quebraria a hidratação.
  const hoje = hojeISO();
  const futuros = agenda.filter((a) => a.data >= hoje).length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Compromissos"
        title="Agenda"
        description="Agendamentos da oficina por dia e horário, com status de confirmação."
        stats={[
          { label: "agendamentos", value: agenda.length.toString() },
          { label: "a partir de hoje", value: futuros.toString() },
        ]}
      />
      <AgendaManager seed={agenda} clientes={clientes} veiculos={veiculos} hoje={hoje} />
    </div>
  );
}
```

- [x] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: erros **apenas** em `agenda-manager.tsx`, que ainda não recebe as props novas. As Tasks 7 e 8 resolvem. Se aparecer erro em qualquer outro arquivo, corrija antes de seguir.

- [x] **Step 4: Commit**

```bash
git add lib/admin-data.ts app/oficina/agenda/page.tsx
git commit -m "feat(agenda): leitura com clienteId, veiculoId e placa"
```

---

### Task 6: Server actions da agenda

`criarAgendamento` (`app/oficina/actions.ts:137`) grava só `clientName` — é por isso que agendamento criado pelo admin nunca aparece no portal do cliente. Aqui ela passa a ligar o cliente, e entram editar, mudar status e excluir.

**Files:**
- Modify: `app/oficina/actions.ts:137-158` (`criarAgendamento`) e adiante (3 actions novas)

**Interfaces:**
- Consumes: `normalizarStatus`, `STATUS_AGENDAMENTO`, `StatusAgendamento` (Task 1); `vehicleId` no schema (Task 2).
- Produces:
  ```ts
  type AgendamentoInput = {
    clienteId?: string | null;
    cliente: string;
    veiculoId?: string | null;
    veiculo: string;
    servico: string;
    data: string;
    hora: string;
    status: string;
  };
  criarAgendamento(input: AgendamentoInput): Promise<void>
  atualizarAgendamento(id: string, input: AgendamentoInput): Promise<void>
  mudarStatusAgendamento(id: string, status: string): Promise<void>
  excluirAgendamento(id: string): Promise<void>
  ```

- [x] **Step 1: Substituir `criarAgendamento` e acrescentar as três actions**

Modify `app/oficina/actions.ts`, trocando todo o bloco de `criarAgendamento` (linhas 137-158) por:

```ts
export type AgendamentoInput = {
  /** Preenchido = cliente cadastrado. Nulo/vazio = avulso. */
  clienteId?: string | null;
  /** Nome digitado — usado só quando não há clienteId. */
  cliente: string;
  veiculoId?: string | null;
  veiculo: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
};

// Com cliente vinculado, clientName fica NULO de propósito: a leitura faz
// `clientName ?? client?.name`, então o nome passa a acompanhar renomeações.
// O campo significa exatamente uma coisa: "este agendamento é de um avulso".
function dadosAgendamento(input: AgendamentoInput) {
  const clientId = input.clienteId || null;
  return {
    clientId,
    clientName: clientId ? null : input.cliente.trim() || null,
    vehicleId: input.veiculoId || null,
    vehicleName: input.veiculo.trim() || "—",
    service: input.servico.trim() || "—",
    date: input.data || hojeISO(),
    time: input.hora || "—",
    status: normalizarStatus(input.status),
  };
}

function revalidarAgenda() {
  revalidatePath("/oficina/agenda");
  revalidatePath("/oficina");
  revalidatePath("/app");
}

export async function criarAgendamento(input: AgendamentoInput) {
  await requireAdmin();
  await prisma.appointment.create({ data: dadosAgendamento(input) });
  revalidarAgenda();
}

export async function atualizarAgendamento(id: string, input: AgendamentoInput) {
  await requireAdmin();
  await prisma.appointment.update({ where: { id }, data: dadosAgendamento(input) });
  revalidarAgenda();
}

export async function mudarStatusAgendamento(id: string, status: string) {
  await requireAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: normalizarStatus(status) },
  });
  revalidarAgenda();
}

export async function excluirAgendamento(id: string) {
  await requireAdmin();
  await prisma.appointment.delete({ where: { id } });
  revalidarAgenda();
}
```

Acrescente ao topo do arquivo:

```ts
import { normalizarStatus } from "@/lib/agendamentos";
```

`hojeISO` já está importado de `@/lib/datas` na linha 8.

> `revalidatePath("/app")` é novo: o agendamento agora aparece no portal do cliente, então a home dele precisa recarregar.

- [x] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: erros só em `agenda-manager.tsx` (Task 8) — ele ainda chama `criarAgendamento` com a forma antiga.

- [x] **Step 3: Commit**

```bash
git add app/oficina/actions.ts
git commit -m "feat(agenda): actions ligam o cliente e permitem editar, status e excluir"
```

---

### Task 7: Formulário de agendamento

Um formulário só, usado para criar e para editar.

**Files:**
- Create: `app/oficina/_components/agenda-form.tsx`

**Interfaces:**
- Consumes: `ClientPicker`, `ClienteOpt`, `VeiculoOpt` (Task 4); `ComboValue` (Task 3); `AgendaItem` (Task 5); `STATUS_AGENDAMENTO` (Task 1).
- Produces:
  ```ts
  type AgendaFormValor = {
    clienteId: string | null;
    cliente: string;
    veiculoId: string | null;
    veiculo: string;
    servico: string;
    data: string;
    hora: string;
    status: string;
  };
  AgendaForm({ inicial, clientes, veiculos, onSalvar, onCancelar, titulo })
  ```

- [x] **Step 1: Escrever o formulário**

Create `app/oficina/_components/agenda-form.tsx`:

```tsx
"use client";

import { useState } from "react";
import { CalendarPlus, Check, X } from "lucide-react";
import { STATUS_AGENDAMENTO } from "@/lib/agendamentos";
import type { AgendaItem } from "@/lib/admin-data";
import { ClientPicker, type ClienteOpt, type VeiculoOpt } from "./client-picker";

const inputCls =
  "w-full rounded-lg border border-[var(--ad-line)] bg-[var(--ad-surface-2)] px-3 py-2 text-sm adm-ink outline-none focus:border-[var(--ad-brand)]";
const labelCls = "mb-1 block text-xs font-medium adm-muted";

export type AgendaFormValor = {
  clienteId: string | null;
  cliente: string;
  veiculoId: string | null;
  veiculo: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
};

const VAZIO: AgendaFormValor = {
  clienteId: null,
  cliente: "",
  veiculoId: null,
  veiculo: "",
  servico: "",
  data: "",
  hora: "",
  status: "Agendado",
};

export function deItem(a: AgendaItem): AgendaFormValor {
  return {
    clienteId: a.clienteId,
    cliente: a.cliente === "—" ? "" : a.cliente,
    veiculoId: a.veiculoId,
    veiculo: a.veiculo === "—" ? "" : a.veiculo,
    servico: a.servico,
    data: a.data,
    hora: a.hora === "—" ? "" : a.hora,
    status: a.status,
  };
}

export function AgendaForm({
  inicial,
  clientes,
  veiculos,
  onSalvar,
  onCancelar,
  titulo,
}: {
  inicial?: AgendaFormValor;
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
  onSalvar: (v: AgendaFormValor) => void;
  onCancelar: () => void;
  titulo: string;
}) {
  const [v, setV] = useState<AgendaFormValor>(inicial ?? VAZIO);
  // "digitar outro" desliga a lista mesmo com cliente cadastrado escolhido.
  const [veiculoLivre, setVeiculoLivre] = useState(!!inicial && !inicial.veiculoId);

  const doCliente = v.clienteId ? veiculos.filter((x) => x.clienteId === v.clienteId) : [];
  const usaLista = doCliente.length > 0 && !veiculoLivre;
  const podeSalvar = v.servico.trim() !== "" && v.data !== "" && v.hora !== "";

  return (
    <div className="adm-card p-4">
      <h3 className="adm-display mb-3 flex items-center gap-2 text-sm font-bold adm-ink">
        <CalendarPlus className="size-4 adm-brand" />
        {titulo}
      </h3>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className={labelCls}>Data</label>
          <input
            type="date"
            className={inputCls}
            value={v.data}
            onChange={(e) => setV((x) => ({ ...x, data: e.target.value }))}
            aria-label="Data"
          />
        </div>
        <div>
          <label className={labelCls}>Hora</label>
          <input
            type="time"
            className={inputCls}
            value={v.hora}
            onChange={(e) => setV((x) => ({ ...x, hora: e.target.value }))}
            aria-label="Hora"
          />
        </div>
        <div>
          <label className={labelCls}>Status</label>
          <select
            className={inputCls}
            value={v.status}
            onChange={(e) => setV((x) => ({ ...x, status: e.target.value }))}
            aria-label="Status"
          >
            {STATUS_AGENDAMENTO.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Cliente</label>
          <ClientPicker
            value={{ id: v.clienteId, texto: v.cliente }}
            onChange={(nv) =>
              setV((x) => ({
                ...x,
                clienteId: nv.id,
                cliente: nv.texto,
                // trocar de cliente invalida o veículo escolhido antes
                veiculoId: null,
                veiculo: "",
              }))
            }
            clientes={clientes}
            veiculos={veiculos}
          />
        </div>

        <div>
          <label className={labelCls}>Veículo</label>
          {usaLista ? (
            <select
              className={inputCls}
              value={v.veiculoId ?? ""}
              onChange={(e) => {
                if (e.target.value === "__livre") {
                  setVeiculoLivre(true);
                  setV((x) => ({ ...x, veiculoId: null, veiculo: "" }));
                  return;
                }
                const veic = doCliente.find((c) => c.id === e.target.value);
                setV((x) => ({
                  ...x,
                  veiculoId: veic?.id ?? null,
                  veiculo: veic ? `${veic.modelo} · ${veic.placa}` : "",
                }));
              }}
              aria-label="Veículo"
            >
              <option value="">Selecione…</option>
              {doCliente.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.modelo} · {c.placa}
                </option>
              ))}
              <option value="__livre">✎ digitar outro</option>
            </select>
          ) : (
            <input
              className={inputCls}
              placeholder="Veículo / placa"
              value={v.veiculo}
              onChange={(e) => setV((x) => ({ ...x, veiculoId: null, veiculo: e.target.value }))}
              aria-label="Veículo"
            />
          )}
        </div>

        <div className="sm:col-span-3">
          <label className={labelCls}>Serviço</label>
          <input
            className={inputCls}
            placeholder="Revisão, troca de óleo, diagnóstico…"
            value={v.servico}
            onChange={(e) => setV((x) => ({ ...x, servico: e.target.value }))}
            aria-label="Serviço"
          />
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onSalvar(v)}
          disabled={!podeSalvar}
          className="flex items-center gap-1.5 rounded-lg bg-[var(--ad-brand)] px-4 py-2 text-sm font-semibold text-white enabled:hover:bg-[#1b5fe0] disabled:opacity-40"
        >
          <Check className="size-4" />
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="flex items-center gap-1.5 rounded-lg border border-[var(--ad-line)] px-4 py-2 text-sm font-semibold adm-muted"
        >
          <X className="size-4" />
          Cancelar
        </button>
        {!podeSalvar && (
          <span className="text-xs adm-muted">Serviço, data e hora são obrigatórios.</span>
        )}
      </div>
    </div>
  );
}
```

- [x] **Step 2: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: erros só em `agenda-manager.tsx` (Task 8).

- [x] **Step 3: Commit**

```bash
git add app/oficina/_components/agenda-form.tsx
git commit -m "feat(agenda): formulario de criar e editar agendamento"
```

---

### Task 8: Lista agrupada, filtrada e com ações

Reescreve o `agenda-manager.tsx`, que hoje é uma lista corrida sem busca, sem filtro e só com criar.

**Files:**
- Modify: `app/oficina/_components/agenda-manager.tsx` (reescrita completa)

**Interfaces:**
- Consumes: `agruparPorDia`, `badgeAdmin`, `STATUS_AGENDAMENTO`, `STATUS_INATIVOS` (Task 1); `AgendaItem` (Task 5); as 4 actions (Task 6); `AgendaForm`, `deItem`, `AgendaFormValor` (Task 7); `SearchInput`, `FilterChip`, `FilterSelect`, `ResultBar` de `./table-filters`; `matches` de `./filter-utils`.

- [x] **Step 1: Reescrever o componente**

Modify `app/oficina/_components/agenda-manager.tsx` — substituir o arquivo inteiro:

```tsx
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
    setItens((x) =>
      x.map((a) => (a.id === id ? { ...a, status: novo as StatusAgendamento } : a))
    );
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
        <SearchInput value={busca} onChange={setBusca} placeholder="Buscar cliente, veículo, serviço…" />
        <FilterSelect value={status} onChange={setStatus} options={STATUS_FILTRO} ariaLabel="Filtrar por status" />
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
```

- [x] **Step 2: Verificar tipos, lint e testes**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: 12 testes PASS, zero erro de tipo, zero erro de lint. Todos os erros pendentes das tasks anteriores devem ter sumido.

- [ ] **Step 3: Testar no navegador**

Run: `npm run dev`

Em `http://localhost:3000/oficina/agenda`, confirme:
1. Criar agendamento com **nome avulso** → aparece com "· avulso" na linha.
2. Criar escolhendo **cliente cadastrado** pela busca → o campo veículo vira lista com os carros dele.
3. Buscar sem acento (`jose`) acha cliente com acento (`José`).
4. Teclado no campo de cliente: `↓`/`↑` navegam, `Enter` escolhe, `Esc` fecha.
5. Agrupamento: `Hoje`, `Amanhã`, datas futuras, e o bloco `Anteriores (N)` recolhido.
6. Mudar status pelo select da linha; `Faltou`/`Cancelado` deixam a linha esmaecida.
7. Editar e excluir.
8. Logo após criar, o item aparece com "salvando…" e os botões de editar/excluir apagados; um instante depois (`router.refresh()`) ele vira um item normal, com as ações liberadas. **Edite esse item recém-criado** e confirme que salva — é o caminho que quebraria se o id provisório chegasse ao Prisma.
9. Recarregar a página e confirmar que tudo persistiu.

- [ ] **Step 4: Confirmar que o vínculo chega no portal do cliente**

Ainda no navegador: crie um agendamento vinculado a um cliente cadastrado, saia do admin, entre como esse cliente e confirme que o agendamento aparece em `/app`. **Este é o bug principal que a fase 1 conserta** — antes, agendamento criado pelo admin nunca aparecia para o cliente.

- [x] **Step 5: Commit**

```bash
git add app/oficina/_components/agenda-manager.tsx
git commit -m "feat(agenda): agrupamento por dia, busca, filtros, editar, status e excluir"
```

---

### Task 9: Entrada pré-preenchida pelo agendamento

O botão "Cliente chegou" da Task 8 aponta para `/oficina/entrada?cliente=…&veiculo=…`. Falta a tela ler esses parâmetros.

**Files:**
- Modify: `app/oficina/entrada/page.tsx`
- Modify: `app/oficina/_components/entrada-form.tsx:45-56` (props e estado inicial)

**Interfaces:**
- Consumes: `getClientesVeiculosParaOS` com `clienteId` (Task 4).
- Produces: `EntradaForm` aceita `clienteInicial?: string` e `veiculoInicial?: string`.

- [x] **Step 1: Ler `searchParams` na página**

Modify `app/oficina/entrada/page.tsx` inteiro:

```tsx
import { getClientesVeiculosParaOS } from "@/lib/admin-data";
import { EntradaForm } from "../_components/entrada-form";

// searchParams é Promise no Next 16 — mesmo padrão de params em
// app/oficina/ordens/[id]/page.tsx.
export default async function EntradaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; veiculo?: string }>;
}) {
  const [{ cliente, veiculo }, { clientes, veiculos }] = await Promise.all([
    searchParams,
    getClientesVeiculosParaOS(),
  ]);
  return (
    <EntradaForm
      clientes={clientes}
      veiculos={veiculos}
      clienteInicial={cliente}
      veiculoInicial={veiculo}
    />
  );
}
```

- [x] **Step 2: Aceitar os valores iniciais no formulário**

Modify `app/oficina/_components/entrada-form.tsx`, na interface `VeiculoOpt` (linha 11), acrescentar `clienteId`:

```ts
interface VeiculoOpt {
  id: string;
  clienteId: string | null;
  proprietario: string;
  modelo: string;
  placa: string;
}
```

e trocar a assinatura e as duas primeiras linhas de estado (linhas 45-56):

```tsx
export function EntradaForm({
  clientes,
  veiculos,
  clienteInicial,
  veiculoInicial,
}: {
  clientes: ClienteOpt[];
  veiculos: VeiculoOpt[];
  clienteInicial?: string;
  veiculoInicial?: string;
}) {
  // Id vindo da URL só vale se existir de verdade na lista — URL adulterada
  // ou registro apagado cai no comportamento normal (campo vazio).
  const [clienteId, setClienteId] = useState(
    clientes.some((c) => c.id === clienteInicial) ? clienteInicial! : ""
  );
  const [veiculoId, setVeiculoId] = useState(
    veiculos.some((v) => v.id === veiculoInicial && v.clienteId === clienteInicial)
      ? veiculoInicial!
      : ""
  );
```

> A validação do veículo checa **também** se ele pertence ao cliente da URL — senão daria para dar entrada num carro de outra pessoa montando a URL à mão.

- [x] **Step 3: Verificar tipos, lint e testes**

Run: `npm test && npx tsc --noEmit && npm run lint`
Expected: tudo verde.

- [ ] **Step 4: Testar no navegador**

1. Em `/oficina/agenda`, clique em **Cliente chegou** num agendamento vinculado → `/oficina/entrada` abre com cliente e veículo já escolhidos.
2. Abra `/oficina/entrada?cliente=inexistente&veiculo=inexistente` → a tela carrega normal, com os campos vazios, sem erro.
3. Abra `/oficina/entrada?cliente=<idA>&veiculo=<idDeOutroCliente>` → o veículo **não** é pré-selecionado.

- [x] **Step 5: Rodar o build completo**

Run: `npm run build`
Expected: build conclui sem erro. É o que a Vercel roda no deploy.

- [x] **Step 6: Commit**

```bash
git add app/oficina/entrada/page.tsx app/oficina/_components/entrada-form.tsx
git commit -m "feat(agenda): cliente chegou pre-preenche a entrada do veiculo"
```

---

## Cobertura do spec (fase 1)

| Requisito do spec | Task |
|---|---|
| `Appointment.vehicleId` + índices + relação inversa | 2 |
| Regra `clientId` / `clientName` nulo | 6 |
| `combobox.tsx` genérico (filtro, teclado, a11y) | 3 |
| `client-picker.tsx` com selo cadastrado/avulso | 4 |
| Campo de veículo derivado do cliente + "digitar outro" | 7 |
| `getClientesVeiculosParaOS` com `clienteId`; nova OS filtra por id | 4 |
| Status unificado em cinco + `.osb-cancelada` + tabela de badges | 1 |
| `normalizarStatus` no lugar do cast de `client-data.ts` | 1 |
| `getAgendaHoje` para de achatar | 1 |
| Agrupamento por dia com "hoje" do servidor | 1 (lógica) + 5 (prop) + 8 (render) |
| Busca e filtros com `table-filters` | 8 |
| Editar, mudar status, excluir | 6 (actions) + 8 (UI) |
| "Cliente chegou → dar entrada" | 8 (link) + 9 (leitura) |
| `searchParams` como Promise + id inválido não quebra | 9 |

**Fora desta fase (é a fase 2, spec parte 2):** tudo de estoque — `PurchaseNote`, custo em centavos, preço de venda, markup, margem e o preenchimento automático na OS.

## Verificação final da fase

Depois da Task 9, com a app rodando:

- [x] `npm test` — 12 testes passando
- [x] `npx tsc --noEmit` — zero erro
- [x] `npm run lint` — zero erro
- [x] `npm run build` — build completo sem erro
- [ ] Roteiro de navegador das Tasks 8 (steps 3 e 4) e 9 (step 4) refeito do começo
