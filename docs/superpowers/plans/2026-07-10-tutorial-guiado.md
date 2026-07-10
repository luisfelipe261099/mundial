# Tutorial Guiado (Admin / Mecânico / Cliente) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uma página pública `/tutorial` com o manual completo dos 3 papéis (screenshots reais) + um tour de boas-vindas leve no primeiro login de cada painel.

**Architecture:** Rota pública nova (`app/tutorial/`) fora do padrão de `layout.tsx` com guard de sessão dos outros três grupos de rota; conteúdo (texto + caminho de imagem) num arquivo de dados separado da apresentação; screenshots estáticos em `public/tutorial/`; um componente `WelcomeTour` reutilizável montado dentro dos três shells existentes (`AdminShell`, `MecShell`, `AppShell`), guardando "já visto" em `localStorage` (sem mudança de banco).

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind (classes utilitárias + CSS próprio em `tutorial.css`), `next/image` (local, sem otimização remota), `lucide-react` para ícones. Nenhuma dependência nova.

## Global Constraints

- Sem dependência nova no `package.json` (spec §3: "sem backend novo"; nenhuma lib de tour foi aprovada).
- `/tutorial` é pública — `robots: { index: false, follow: false }` (mesmo padrão de `/app`, `/oficina`, `/mecanico`, spec §3).
- Idioma único: português (spec §2, fora de escopo tradução).
- Tour de boas-vindas: sem gravar nada no banco — só `localStorage` (spec §8).
- Credenciais de teste para captura de screenshot: admin `admin@mundial.com.br` / `admin123` (seed), cliente `luis.felipe@email.com` / `cliente123` (seed) — confirmadas em `prisma/seed.ts:284-291` e `prisma/seed.ts:81-89`. Conta de mecânico não existe — criada na Task 3.
- **Desvio consciente do spec §8:** o tour de boas-vindas NÃO faz spotlight recortado em cima do item de menu real. Motivo: `AdminShell`/`AppShell` renderizam a navegação duas vezes (sidebar desktop + drawer mobile, um dos dois sempre fora de tela via `transform`, não via `display:none`), então "achar o elemento visível" via `getComputedStyle` não é confiável pro drawer fechado — isso quebraria facilmente num app que vai ao ar hoje. Em vez disso, o tour é uma sequência de cards centralizados sobre um fundo escurecido (mesma sensação de "guiado na tela", sem depender da posição de um elemento real). Ver Task 5.

---

## File Structure

**Criar:**
- `app/tutorial/_data/conteudo.ts` — tipos + conteúdo (texto e caminho de imagem) dos 3 papéis para a página `/tutorial`.
- `app/tutorial/layout.tsx` — layout público, metadata, sem guard de sessão.
- `app/tutorial/page.tsx` — Server Component, lê `?papel=`, renderiza `TutorialView`.
- `app/tutorial/tutorial-view.tsx` — Client Component: abas de papel + navegação de passo.
- `public/tutorial/admin/*.png`, `public/tutorial/mecanico/*.png`, `public/tutorial/cliente/*.png` — screenshots.
- `app/_components/welcome-tour.tsx` — componente compartilhado do tour de boas-vindas (usado pelos 3 shells).
- `app/oficina/_components/admin-tour-steps.ts`, `app/mecanico/_components/mec-tour-steps.ts`, `app/app/_components/app-tour-steps.ts` — conteúdo do tour, um arquivo por papel (perto do shell que o usa).

**Modificar:**
- `app/oficina/_components/admin-shell.tsx` — link "Como usar" + montar `WelcomeTour`.
- `app/mecanico/_components/mec-shell.tsx` — link "Como usar" + montar `WelcomeTour`.
- `app/app/_components/app-shell.tsx` — montar `WelcomeTour`.
- `app/app/_components/app-sidebar.tsx` — link "Como usar".
- `app/login/page.tsx` — link "Primeira vez? Veja o tutorial".

(`app/tutorial/tutorial.css` já existe e é só consumido, sem edição.)

---

### Task 1: Conteúdo da página `/tutorial`

**Files:**
- Create: `app/tutorial/_data/conteudo.ts`

**Interfaces:**
- Produces: `type Papel = "admin" | "mecanico" | "cliente"`; `interface PassoTutorial { titulo: string; texto: string; imagem: string }`; `const conteudoPorPapel: Record<Papel, PassoTutorial[]>`; `const papelLabel: Record<Papel, string>`.

- [ ] **Step 1: Criar o arquivo de conteúdo**

```typescript
// app/tutorial/_data/conteudo.ts
export type Papel = "admin" | "mecanico" | "cliente";

export interface PassoTutorial {
  titulo: string;
  texto: string;
  imagem: string; // caminho em /public, ex.: "/tutorial/admin/dashboard.png"
}

export const papelLabel: Record<Papel, string> = {
  admin: "Administrador",
  mecanico: "Mecânico",
  cliente: "Cliente",
};

export const conteudoPorPapel: Record<Papel, PassoTutorial[]> = {
  admin: [
    {
      titulo: "Dashboard",
      texto:
        "Assim que você entra, o Dashboard mostra o resumo do dia: ordens em andamento, agenda do dia e os números principais da oficina. É o ponto de partida — os cartões de KPI no topo dão uma visão rápida antes de entrar em qualquer tela específica.",
      imagem: "/tutorial/admin/dashboard.png",
    },
    {
      titulo: "Clientes",
      texto:
        "Em Clientes você vê todos os clientes cadastrados, pode abrir a ficha de qualquer um (veículos, histórico de OS, contato) ou cadastrar um novo pelo botão \"Novo cliente\". A ficha do cliente é o mesmo lugar onde você confere veículos vinculados a ele.",
      imagem: "/tutorial/admin/clientes.png",
    },
    {
      titulo: "Veículos",
      texto:
        "Lista todos os veículos já atendidos, com placa, modelo e o cliente dono. Clique em um veículo para ver o histórico completo de serviços e o estado de manutenção (óleo, revisão, IPVA).",
      imagem: "/tutorial/admin/veiculos.png",
    },
    {
      titulo: "Ordens de Serviço",
      texto:
        "O coração do sistema. Uma OS nasce na Entrada — a vistoria de entrada registra o que o cliente autorizou, o nível de combustível, avarias e o km. Dali ela avança: mecânico executa, você lança peças/serviços, marca como finalizada e gera o PDF da ordem para o cliente. O status de cada OS (Agendado → Em andamento → Finalizado → Entregue) aparece sempre visível na lista.",
      imagem: "/tutorial/admin/ordens.png",
    },
    {
      titulo: "Agenda",
      texto:
        "Mostra os agendamentos do dia e dos próximos dias — tanto os que o cliente marcou pelo app quanto os que você cadastrar manualmente. Use para organizar quem chega e quando.",
      imagem: "/tutorial/admin/agenda.png",
    },
    {
      titulo: "Estoque",
      texto:
        "Controle de peças: quantidade atual, mínimo desejado e o histórico de movimentações (entradas manuais, saídas manuais e baixas automáticas quando uma OS é finalizada com peças). Produtos abaixo do mínimo aparecem sinalizados.",
      imagem: "/tutorial/admin/estoque.png",
    },
    {
      titulo: "Financeiro",
      texto:
        "Receitas e despesas da oficina. Toda OS finalizada e paga gera uma receita automaticamente aqui — você também pode lançar despesas manuais (aluguel, fornecedor, etc.).",
      imagem: "/tutorial/admin/financeiro.png",
    },
    {
      titulo: "Relatórios",
      texto:
        "Visão consolidada do desempenho da oficina — volume de ordens, faturamento e outros indicadores para acompanhar a operação ao longo do tempo.",
      imagem: "/tutorial/admin/relatorios.png",
    },
    {
      titulo: "Acessos",
      texto:
        "Só o administrador vê esta tela. Aqui você cria os logins da equipe (mecânicos e outros administradores), reseta senha de quem esqueceu, e remove acesso de quem não trabalha mais na oficina. Sempre precisa existir ao menos um administrador ativo.",
      imagem: "/tutorial/admin/acessos.png",
    },
    {
      titulo: "Configurações",
      texto:
        "Dados da oficina (nome, telefone, WhatsApp, endereço) e quais tipos de lembrete automático ficam ativos para os clientes (troca de óleo, revisão, IPVA, promoções).",
      imagem: "/tutorial/admin/configuracoes.png",
    },
  ],
  mecanico: [
    {
      titulo: "Suas ordens atribuídas",
      texto:
        "Ao entrar, você já vê a lista das ordens de serviço atribuídas a você, com placa, veículo, cliente e o defeito relatado. Toque em qualquer uma para abrir.",
      imagem: "/tutorial/mecanico/lista.png",
    },
    {
      titulo: "Abrir uma OS",
      texto:
        "Dentro da ordem você vê todos os dados do veículo e do problema relatado, e preenche a vistoria técnica/checklist conforme vai inspecionando o carro.",
      imagem: "/tutorial/mecanico/ordem.png",
    },
    {
      titulo: "Fotos do serviço",
      texto:
        "Anexe fotos em cada etapa do serviço (antes, durante, depois) direto pelo celular — elas ficam disponíveis depois para o cliente ver no histórico dele.",
      imagem: "/tutorial/mecanico/fotos.png",
    },
    {
      titulo: "Finalizar o serviço",
      texto:
        "Quando o serviço termina, marque a ordem como finalizada. Isso libera a baixa de estoque das peças usadas e o lançamento financeiro para o administrador — não precisa fazer nada além de finalizar.",
      imagem: "/tutorial/mecanico/finalizar.png",
    },
  ],
  cliente: [
    {
      titulo: "Início",
      texto:
        "A tela inicial resume o essencial: o estado do seu veículo, o serviço em andamento (se houver) e os próximos lembretes de manutenção.",
      imagem: "/tutorial/cliente/inicio.png",
    },
    {
      titulo: "Acompanhar",
      texto:
        "Quando seu carro está na oficina, aqui você acompanha em tempo real cada etapa do serviço, sem precisar ligar para perguntar.",
      imagem: "/tutorial/cliente/acompanhar.png",
    },
    {
      titulo: "Meus veículos",
      texto:
        "Lista dos seus veículos cadastrados, com quilometragem e o estado de cada manutenção (em dia, próxima ou vencida).",
      imagem: "/tutorial/cliente/veiculos.png",
    },
    {
      titulo: "Agendamentos",
      texto:
        "Marque um horário para levar o carro na oficina, escolhendo o serviço e a data que preferir.",
      imagem: "/tutorial/cliente/agendar.png",
    },
    {
      titulo: "Solicitar orçamento",
      texto:
        "Descreva o problema ou o serviço que precisa e peça um orçamento antes mesmo de agendar.",
      imagem: "/tutorial/cliente/solicitar.png",
    },
    {
      titulo: "Orçamentos",
      texto:
        "Veja os orçamentos recebidos, com o detalhamento de peças e serviços, e aprove ou recuse direto pelo app.",
      imagem: "/tutorial/cliente/orcamentos.png",
    },
    {
      titulo: "Histórico",
      texto:
        "Todo serviço já feito no seu carro fica registrado aqui, incluindo as fotos que o mecânico tirou durante o atendimento.",
      imagem: "/tutorial/cliente/historico.png",
    },
    {
      titulo: "Documentos",
      texto:
        "Notas fiscais e outros documentos relacionados aos seus serviços, sempre à mão.",
      imagem: "/tutorial/cliente/documentos.png",
    },
    {
      titulo: "Notificações",
      texto:
        "Avisos sobre o andamento do seu serviço e lembretes de manutenção chegam aqui — e, se você ativar em Perfil, também no seu celular.",
      imagem: "/tutorial/cliente/notificacoes.png",
    },
    {
      titulo: "Perfil",
      texto:
        "Seus dados de contato e a opção de ativar avisos no celular (troca de óleo, revisão, IPVA) direto pelo navegador, sem precisar instalar nada.",
      imagem: "/tutorial/cliente/perfil.png",
    },
  ],
};
```

- [ ] **Step 2: Checar tipos**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `app/tutorial/_data/conteudo.ts`.

- [ ] **Step 3: Commit**

```bash
git add app/tutorial/_data/conteudo.ts
git commit -m "feat(tutorial): conteúdo do manual guiado (admin/mecânico/cliente)"
```

---

### Task 2: Rota `/tutorial` (layout, página, view)

**Files:**
- Create: `app/tutorial/layout.tsx`
- Create: `app/tutorial/page.tsx`
- Create: `app/tutorial/tutorial-view.tsx`
- (consome `app/tutorial/tutorial.css`, já existente — nenhuma edição necessária nele)

**Interfaces:**
- Consumes: `Papel`, `PassoTutorial`, `papelLabel`, `conteudoPorPapel` de `app/tutorial/_data/conteudo.ts` (Task 1).
- Produces: rota `/tutorial` e `/tutorial?papel=admin|mecanico|cliente` navegável.

- [ ] **Step 1: Criar o layout público**

```tsx
// app/tutorial/layout.tsx
import type { Metadata } from "next";
import "./tutorial.css";

export const metadata: Metadata = {
  title: "Tutorial — Oficina Noturna",
  description: "Guia de uso da plataforma para administrador, mecânico e cliente.",
  robots: { index: false, follow: false },
};

export default function TutorialLayout({ children }: { children: React.ReactNode }) {
  return <div className="tut-root">{children}</div>;
}
```

- [ ] **Step 2: Criar a página (Server Component, lê `?papel=`)**

```tsx
// app/tutorial/page.tsx
import type { Papel } from "./_data/conteudo";
import { TutorialView } from "./tutorial-view";

const PAPEIS: Papel[] = ["admin", "mecanico", "cliente"];

export default async function TutorialPage({
  searchParams,
}: {
  searchParams: Promise<{ papel?: string }>;
}) {
  const { papel } = await searchParams;
  const inicial: Papel = PAPEIS.includes(papel as Papel) ? (papel as Papel) : "admin";
  return <TutorialView papelInicial={inicial} />;
}
```

- [ ] **Step 3: Criar o Client Component de visualização (abas + passos)**

```tsx
// app/tutorial/tutorial-view.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronLeft } from "lucide-react";
import { conteudoPorPapel, papelLabel, type Papel } from "./_data/conteudo";

const PAPEIS: Papel[] = ["admin", "mecanico", "cliente"];

export function TutorialView({ papelInicial }: { papelInicial: Papel }) {
  const [papel, setPapel] = useState<Papel>(papelInicial);
  const [passo, setPasso] = useState(0);
  const passos = conteudoPorPapel[papel];
  const atual = passos[passo];

  function trocarPapel(novo: Papel) {
    setPapel(novo);
    setPasso(0);
  }

  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <Link href="/login" className="tut-mono mb-6 inline-flex items-center gap-1 text-xs text-[var(--tut-muted)]">
        <ChevronLeft className="size-3.5" /> Voltar ao login
      </Link>

      <h1 className="tut-display mb-1 text-2xl text-[var(--tut-ink)]">Como usar a Oficina Noturna</h1>
      <p className="mb-6 text-sm text-[var(--tut-ink-2)]">Escolha seu papel para ver o passo a passo.</p>

      <div className="mb-6 flex gap-2">
        {PAPEIS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => trocarPapel(p)}
            className={`tut-card flex-1 px-3 py-2 text-sm font-semibold transition-colors ${
              p === papel
                ? "border-[var(--tut-brand)] bg-[var(--tut-signal-soft)] text-[var(--tut-ink)]"
                : "text-[var(--tut-muted)]"
            }`}
          >
            {papelLabel[p]}
          </button>
        ))}
      </div>

      <div key={`${papel}-${passo}`} className="tut-card tut-rise p-5">
        <p className="tut-mono mb-2 text-[0.65rem] text-[var(--tut-muted)]">
          Passo {passo + 1} de {passos.length}
        </p>
        <h2 className="tut-display mb-3 text-lg text-[var(--tut-ink)]">{atual.titulo}</h2>
        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl border border-[var(--tut-line)]">
          <Image src={atual.imagem} alt={atual.titulo} fill sizes="(max-width: 640px) 100vw, 640px" className="object-cover object-top" />
        </div>
        <p className="text-sm leading-relaxed text-[var(--tut-ink-2)]">{atual.texto}</p>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setPasso((p) => Math.max(0, p - 1))}
          disabled={passo === 0}
          className="tut-card flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-[var(--tut-ink)] disabled:opacity-40"
        >
          <ArrowLeft className="size-4" /> Anterior
        </button>
        <button
          type="button"
          onClick={() => setPasso((p) => Math.min(passos.length - 1, p + 1))}
          disabled={passo === passos.length - 1}
          className="tut-card flex items-center gap-1.5 border-[var(--tut-brand)] px-3.5 py-2 text-sm font-semibold text-[var(--tut-ink)] disabled:opacity-40"
        >
          Próximo <ArrowRight className="size-4" />
        </button>
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Rodar o dev server e conferir manualmente**

Run: `npm run dev` (deixar rodando) e abrir `http://localhost:3000/tutorial` e `http://localhost:3000/tutorial?papel=cliente` no navegador.
Expected: as 3 abas trocam de conteúdo, os botões Anterior/Próximo navegam os passos, nenhum erro no console. As imagens ainda vão dar 404 (capturadas na Task 3) — esperado nesta etapa.

- [ ] **Step 5: Checar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add app/tutorial/layout.tsx app/tutorial/page.tsx app/tutorial/tutorial-view.tsx app/tutorial/tutorial.css
git commit -m "feat(tutorial): página pública /tutorial com abas por papel"
```

---

### Task 3: Capturar os screenshots reais

**Files:**
- Create: `public/tutorial/admin/*.png` (10 arquivos, nomes conforme `imagem` da Task 1)
- Create: `public/tutorial/mecanico/*.png` (4 arquivos)
- Create: `public/tutorial/cliente/*.png` (10 arquivos)

**Interfaces:**
- Consumes: os caminhos exatos de `imagem` definidos em `app/tutorial/_data/conteudo.ts` (Task 1) — cada screenshot precisa ser salvo exatamente naquele caminho dentro de `public/`.

- [ ] **Step 1: Criar a conta de mecânico de teste**

Com o dev server rodando, logar como admin (`admin@mundial.com.br` / `admin123`) em `/login`, ir em `/oficina/acessos`, criar um acesso: nome "Mecânico Teste", e-mail `mecanico.teste@mundial.com.br`, papel Mecânico, senha `mecanico123`.

- [ ] **Step 2: Capturar as 10 telas do Admin**

Logado como admin, navegar cada rota do `adminNav` (`app/oficina/_components/nav-items.ts`) e capturar a tela (via devtools do navegador), salvando em `public/tutorial/admin/<slug>.png` exatamente como listado em `conteudoPorPapel.admin` da Task 1: `/oficina` → `dashboard.png`, `/oficina/clientes` → `clientes.png`, `/oficina/veiculos` → `veiculos.png`, `/oficina/ordens` (abrir uma OS existente) → `ordens.png`, `/oficina/agenda` → `agenda.png`, `/oficina/estoque` → `estoque.png`, `/oficina/financeiro` → `financeiro.png`, `/oficina/relatorios` → `relatorios.png`, `/oficina/acessos` → `acessos.png`, `/oficina/configuracoes` → `configuracoes.png`.

Expected: 10 arquivos `.png` em `public/tutorial/admin/`.

- [ ] **Step 3: Capturar as 4 telas do Mecânico**

Sair (logout) e entrar como `mecanico.teste@mundial.com.br` / `mecanico123`. Capturar: lista de ordens (`mecanico/lista.png`), uma ordem aberta (`mecanico/ordem.png`), a seção de fotos dentro da ordem (`mecanico/fotos.png`), o botão/estado de finalizar (`mecanico/finalizar.png`).

Expected: 4 arquivos `.png` em `public/tutorial/mecanico/`.

- [ ] **Step 4: Capturar as 10 telas do Cliente**

Sair e entrar como `luis.felipe@email.com` / `cliente123`. Navegar cada rota de `drawerNav` (`app/app/_components/nav-items.ts`) e capturar: `/app` → `inicio.png`, `/app/acompanhar` → `acompanhar.png`, `/app/veiculos` → `veiculos.png`, `/app/agendar` → `agendar.png`, `/app/solicitar` → `solicitar.png`, `/app/orcamentos` → `orcamentos.png`, `/app/historico` → `historico.png`, `/app/documentos` → `documentos.png`, `/app/notificacoes` → `notificacoes.png`, `/app/perfil` → `perfil.png`.

Expected: 10 arquivos `.png` em `public/tutorial/cliente/`.

- [ ] **Step 5: Conferir a página /tutorial com as imagens reais**

Abrir `/tutorial` e passar por todos os 24 passos das 3 abas.
Expected: nenhuma imagem quebrada (404), todas nítidas o bastante para ler o conteúdo da tela.

- [ ] **Step 6: Avisar o cliente sobre a conta de mecânico de teste**

Não é um passo de código — é um lembrete para a Task 6 (verificação final): a conta `mecanico.teste@mundial.com.br` criada no Step 1 deve ser excluída ou ter a senha trocada antes do lançamento, se não for uma conta real da equipe.

- [ ] **Step 7: Commit**

```bash
git add public/tutorial/
git commit -m "feat(tutorial): screenshots reais dos 3 papéis"
```

---

### Task 4: Pontos de entrada ("Como usar")

**Files:**
- Modify: `app/oficina/_components/admin-shell.tsx`
- Modify: `app/mecanico/_components/mec-shell.tsx`
- Modify: `app/app/_components/app-shell.tsx`
- Modify: `app/login/page.tsx`

**Interfaces:**
- Consumes: nenhuma nova — só link estático para `/tutorial?papel=<x>`.

- [ ] **Step 1: Link no header do Admin**

Em `app/oficina/_components/admin-shell.tsx`, importar `HelpCircle` de `lucide-react` e `Link` de `next/link`, e acrescentar um botão-link no `<header>`, antes do avatar "MM" (linha 64 atual):

```tsx
<Link
  href="/tutorial?papel=admin"
  aria-label="Como usar"
  className="grid size-9 shrink-0 place-items-center rounded-lg adm-ink hover:bg-[var(--ad-surface-2)]"
>
  <HelpCircle className="size-5" />
</Link>
```

- [ ] **Step 2: Link no header do Mecânico**

Em `app/mecanico/_components/mec-shell.tsx`, importar `HelpCircle` e `Link` (já importado), acrescentar antes do `<form action={logout}>` (linha 42 atual):

```tsx
<Link
  href="/tutorial?papel=mecanico"
  aria-label="Como usar"
  className="grid size-10 place-items-center rounded-full mec-ink transition-colors hover:bg-[var(--mec-surface-2)]"
>
  <HelpCircle className="size-5" />
</Link>
```

- [ ] **Step 3: Link no drawer/sidebar do Cliente**

Em `app/app/_components/app-sidebar.tsx`, acrescentar um link "Como usar" no bloco final (perto do WhatsApp, antes do `<form action={logout}>`, linha 67 atual):

```tsx
<Link
  href="/tutorial?papel=cliente"
  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium t-ink transition-colors hover:bg-[var(--app-surface-2)]"
>
  <HelpCircle className="size-5 t-brand" />
  Como usar
</Link>
```

(Import `HelpCircle` de `lucide-react` no topo do arquivo.)

- [ ] **Step 4: Link na tela de login**

Em `app/login/page.tsx`, depois do parágrafo "Novo por aqui?" (linha 50 atual), acrescentar:

```tsx
<p className="mt-2 text-center text-sm text-slate-400">
  Primeira vez?{" "}
  <Link href="/tutorial" className="font-semibold text-blue-400">
    Veja o tutorial
  </Link>
</p>
```

- [ ] **Step 5: Checar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add app/oficina/_components/admin-shell.tsx app/mecanico/_components/mec-shell.tsx app/app/_components/app-sidebar.tsx app/login/page.tsx
git commit -m "feat(tutorial): links \"Como usar\" nos 3 painéis e no login"
```

---

### Task 5: Tour de boas-vindas (`WelcomeTour`)

**Files:**
- Create: `app/_components/welcome-tour.tsx`
- Create: `app/oficina/_components/admin-tour-steps.ts`
- Create: `app/mecanico/_components/mec-tour-steps.ts`
- Create: `app/app/_components/app-tour-steps.ts`
- Modify: `app/oficina/_components/admin-shell.tsx`
- Modify: `app/mecanico/_components/mec-shell.tsx`
- Modify: `app/app/_components/app-shell.tsx`

**Interfaces:**
- Produces: `interface TourStep { titulo: string; texto: string }`; `function WelcomeTour({ storageKey, papel, steps }: { storageKey: string; papel: Papel; steps: TourStep[] })` — componente client, sem export de mais nada.
- Consumes (em cada shell): `import { WelcomeTour } from "@/app/_components/welcome-tour"`.

- [ ] **Step 1: Escrever o componente compartilhado**

```tsx
// app/_components/welcome-tour.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import type { Papel } from "@/app/tutorial/_data/conteudo";

export interface TourStep {
  titulo: string;
  texto: string;
}

export function WelcomeTour({
  storageKey,
  papel,
  steps,
}: {
  storageKey: string;
  papel: Papel;
  steps: TourStep[];
}) {
  const [aberto, setAberto] = useState(false);
  const [passo, setPasso] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) setAberto(true);
  }, [storageKey]);

  function fechar() {
    localStorage.setItem(storageKey, "1");
    setAberto(false);
  }

  if (!aberto) return null;
  const atual = steps[passo];
  const ultimo = passo === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="tut-root w-full max-w-sm">
        <div className="tut-card tut-rise relative p-5">
          <button
            type="button"
            onClick={fechar}
            aria-label="Fechar"
            className="absolute right-3 top-3 grid size-8 place-items-center rounded-lg text-[var(--tut-muted)] hover:bg-[var(--tut-surface-2)]"
          >
            <X className="size-4" />
          </button>
          <p className="tut-mono mb-2 text-[0.65rem] text-[var(--tut-muted)]">
            Bem-vindo · {passo + 1}/{steps.length}
          </p>
          <h2 className="tut-display mb-2 text-lg text-[var(--tut-ink)]">{atual.titulo}</h2>
          <p className="mb-5 text-sm leading-relaxed text-[var(--tut-ink-2)]">{atual.texto}</p>
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={fechar}
              className="text-sm font-semibold text-[var(--tut-muted)]"
            >
              Pular
            </button>
            {ultimo ? (
              <Link
                href={`/tutorial?papel=${papel}`}
                onClick={fechar}
                className="tut-card border-[var(--tut-brand)] px-4 py-2 text-sm font-semibold text-[var(--tut-ink)]"
              >
                Ver manual completo
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setPasso((p) => p + 1)}
                className="tut-card border-[var(--tut-brand)] px-4 py-2 text-sm font-semibold text-[var(--tut-ink)]"
              >
                Próximo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

Nota: como este componente usa classes `.tut-*`, ele precisa do CSS de `app/tutorial/tutorial.css` carregado — como os 3 shells não importam esse CSS, importar `"@/app/tutorial/tutorial.css"` no topo de `welcome-tour.tsx` (Next.js permite import de CSS Module-like global a partir de qualquer Client Component; como já é feito o import do mesmo arquivo em `app/tutorial/layout.tsx`, o CSS é global e idempotente).

- [ ] **Step 2: Conteúdo do tour — Admin (5 passos)**

```typescript
// app/oficina/_components/admin-tour-steps.ts
import type { TourStep } from "@/app/_components/welcome-tour";

export const adminTourSteps: TourStep[] = [
  { titulo: "Bem-vindo à Oficina Noturna", texto: "Este é o painel administrativo. Vamos mostrar rapidinho os 5 lugares que você mais vai usar no dia a dia." },
  { titulo: "Dashboard", texto: "É a tela inicial — resumo do dia, ordens em andamento e a agenda." },
  { titulo: "Ordens de Serviço", texto: "Onde toda a operação acontece: da entrada do veículo até a OS finalizada e o PDF pro cliente." },
  { titulo: "Agenda", texto: "Os agendamentos do dia, feitos por você ou pelo cliente no app." },
  { titulo: "Acessos", texto: "Só o administrador vê essa tela — é onde você cria e gerencia os logins da equipe." },
];
```

- [ ] **Step 3: Conteúdo do tour — Mecânico (3 passos)**

```typescript
// app/mecanico/_components/mec-tour-steps.ts
import type { TourStep } from "@/app/_components/welcome-tour";

export const mecTourSteps: TourStep[] = [
  { titulo: "Bem-vindo", texto: "Aqui você vê só as ordens de serviço atribuídas a você." },
  { titulo: "Abra uma ordem", texto: "Toque numa ordem pra registrar a vistoria técnica e anexar fotos do serviço." },
  { titulo: "Finalize quando terminar", texto: "Ao marcar como finalizada, a baixa de estoque e o lançamento financeiro acontecem sozinhos." },
];
```

- [ ] **Step 4: Conteúdo do tour — Cliente (5 passos)**

```typescript
// app/app/_components/app-tour-steps.ts
import type { TourStep } from "@/app/_components/welcome-tour";

export const appTourSteps: TourStep[] = [
  { titulo: "Bem-vindo ao app da Oficina Noturna", texto: "Vamos te mostrar rapidinho as 5 telas mais importantes." },
  { titulo: "Início", texto: "Resumo do seu veículo e do serviço em andamento, se houver." },
  { titulo: "Solicitar orçamento", texto: "Descreva o que precisa e peça um orçamento antes de agendar." },
  { titulo: "Acompanhar", texto: "Enquanto seu carro está na oficina, acompanhe cada etapa por aqui." },
  { titulo: "Perfil", texto: "Seus dados e a opção de ativar avisos de manutenção no celular." },
];
```

- [ ] **Step 5: Montar no AdminShell**

Em `app/oficina/_components/admin-shell.tsx`, importar `WelcomeTour` e `adminTourSteps`, e renderizar logo no início do `<div className="min-h-dvh">` (linha 23 atual):

```tsx
<WelcomeTour storageKey="tutorial-tour-visto-admin" papel="admin" steps={adminTourSteps} />
```

- [ ] **Step 6: Montar no MecShell**

Em `app/mecanico/_components/mec-shell.tsx`, mesma ideia, dentro do `<div className="flex h-dvh flex-col ...">` (linha 17 atual):

```tsx
<WelcomeTour storageKey="tutorial-tour-visto-mecanico" papel="mecanico" steps={mecTourSteps} />
```

- [ ] **Step 7: Montar no AppShell**

Em `app/app/_components/app-shell.tsx`, dentro do `<div className="h-dvh bg-[var(--app-bg)] lg:flex">` (linha 22 atual):

```tsx
<WelcomeTour storageKey="tutorial-tour-visto-cliente" papel="cliente" steps={appTourSteps} />
```

- [ ] **Step 8: Verificação manual do tour**

No navegador, limpar `localStorage` (devtools → Application → Local Storage → limpar as 3 chaves `tutorial-tour-visto-*`) e logar como cada papel.
Expected: o card de boas-vindas aparece na primeira visita de cada papel, "Pular" e "Próximo" funcionam, o último passo tem "Ver manual completo" levando pra `/tutorial?papel=<x>`, e recarregar a página não mostra o tour de novo (já gravou no `localStorage`).

- [ ] **Step 9: Checar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: sem erros.

- [ ] **Step 10: Commit**

```bash
git add app/_components/welcome-tour.tsx app/oficina/_components/admin-tour-steps.ts app/mecanico/_components/mec-tour-steps.ts app/app/_components/app-tour-steps.ts app/oficina/_components/admin-shell.tsx app/mecanico/_components/mec-shell.tsx app/app/_components/app-shell.tsx
git commit -m "feat(tutorial): tour de boas-vindas no primeiro login de cada papel"
```

---

### Task 6: Verificação final

**Files:** nenhum novo — só validação.

- [ ] **Step 1: Build de produção**

Run: `npm run build`
Expected: build conclui sem erro (mesma checagem já usada na auditoria de bugs).

- [ ] **Step 2: Checklist de navegação manual**

Com o build (ou dev server) rodando: abrir `/tutorial` deslogado (3 abas, 24 passos, nenhuma imagem quebrada); logar como admin/mecânico/cliente e conferir o tour de boas-vindas e o link "Como usar" de cada painel; conferir o link na tela de login.

- [ ] **Step 3: Decidir o destino da conta de mecânico de teste**

Voltar em `/oficina/acessos` logado como admin e decidir: excluir `mecanico.teste@mundial.com.br` (se não for usar) ou trocar a senha por uma definitiva (se for aproveitar como conta real de um mecânico).

- [ ] **Step 4: Commit final (se sobrar algo solto)**

```bash
git status
```

Expected: nada pendente relacionado a `app/tutorial/`, `app/_components/welcome-tour.tsx`, `public/tutorial/`, ou os 3 shells + login.
