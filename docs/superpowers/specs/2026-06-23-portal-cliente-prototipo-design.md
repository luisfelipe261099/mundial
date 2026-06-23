# Design — Protótipo do Portal do Cliente (PWA) · Auto Mecânica Mundial

**Data:** 2026-06-23
**Sub-projeto:** Fatia A (Portal do Cliente) — *primeira entrega* da plataforma Mecânica Mundial
**Tipo:** Protótipo visual navegável (front-end, dados fictícios). Sem backend.

---

## 1. Contexto

O repositório hoje contém apenas o **site de marketing** da oficina: quatro
propostas de design (`/v1`–`/v4`) + uma tela de escolha (`/`). Stack: Next.js
16.2.9, React 19, Tailwind CSS 4, `lucide-react`, `motion`. Não há banco de
dados, autenticação, Prisma nem shadcn.

O cliente forneceu um documento de especificação de uma **plataforma completa**
de gestão de oficina (3 perfis — cliente, admin, mecânico — e ~16 módulos) e uma
**imagem de referência** de um dashboard de app mobile (tema escuro, "fintech
navy"). Como a plataforma inteira é grande demais para um único spec, ela foi
decomposta em fatias. **Este documento cobre apenas a primeira fatia.**

### Decisões já tomadas (com o cliente)

| Decisão | Escolha |
|---|---|
| Abordagem | **Protótipo visual primeiro** (mock data; backend depois) |
| Público inicial | **Portal do Cliente** |
| Identidade visual | **Fiel à imagem de referência** (navy fintech: fundo quase-preto, azul flat, chips de ícone coloridos) |
| Escopo de telas | **Portal completo — 7 telas** |
| Plataforma-alvo | **Mobile-first** (PWA de celular); no desktop, frame de telefone centralizado |

### Objetivo desta fatia

Entregar um protótipo **navegável e de alta fidelidade** das 7 telas do app do
cliente, batendo o visual da imagem de referência, com a marca da Auto Mecânica
Mundial, para validar layout e fluxos antes de qualquer investimento em backend.

---

## 2. Fora de escopo (entram em fatias posteriores)

- Banco de dados, Prisma, conexão TiDB Cloud.
- Login/autenticação real e papéis de usuário.
- Manifest + service worker (PWA "instalável" de verdade) — aqui só o *visual* de app.
- Integrações: WhatsApp API, Firebase Push, Mercado Pago, PIX, Google Maps.
- Painel da Oficina (admin) e área do Mecânico.
- Persistência de qualquer ação (aprovar orçamento, agendar) — tudo é estado local efêmero.

---

## 3. Identidade visual (tokens)

Tema escuro "fintech navy", fiel à referência, escopado em `.app-root` para **não
vazar** para o site de marketing (que permanece claro). Mesmo padrão de
isolamento já usado pelo `/v2` (`html:has(.v2-root)`).

| Token | Valor aproximado | Uso |
|---|---|---|
| `--app-bg` | `#0a0e17` | Fundo da tela (quase-preto navy) |
| `--app-surface` | `#121826` | Cards |
| `--app-surface-2` | `#192231` | Cards elevados / inputs |
| `--app-line` | `#222c3d` | Hairlines/bordas |
| `--app-ink` | `#f4f7fb` | Texto/títulos |
| `--app-muted` | `#8b95a7` | Texto secundário |
| `--app-brand` | `#2563eb` | Azul primário (aba ativa, links, progresso, gradiente do veículo) |
| `--app-brand-2` | `#3b82f6` | Azul claro (realces) |
| Categorias | verde `#16a34a` · azul `#2563eb` · roxo `#7c3aed` · âmbar `#d97706` | Chips de ícone (óleo/freio/filtro/…) |

- **Raio:** cards `rounded-2xl`/`rounded-3xl` (~16–22px).
- **Tipografia:** reutilizar as fontes já carregadas (`Outfit` display para a
  saudação/títulos grandes, `Work Sans` para corpo). **Sem novas dependências.**
- **Ícones:** `lucide-react` (já instalado).
- **Animação:** `motion` (já instalado) para transições sutis (carrossel, drawer,
  passos do agendamento, toggles). Respeitar `prefers-reduced-motion`.

---

## 4. Navegação e app shell

A imagem tem bottom-nav de 4 abas; o menu do spec tem 7 itens. Reconciliação:

- **Bottom tab bar (4 abas):** 🏠 Início · 🚗 Veículos · 🔧 Serviços · 👤 Perfil.
  Aba ativa em azul com traço indicador superior. Aba detectada via `usePathname`.
- **App bar (topo):** ☰ menu (abre **drawer** com o menu completo dos 7 itens +
  "Falar no WhatsApp" + sair) · 🔔 sino com badge → **Notificações**.
- **Aba "Serviços" = hub** que agrupa o que não tem aba própria: *Agendar serviço,
  Meus agendamentos, Orçamentos, Histórico* + catálogo de serviços.
- **"Serviços rápidos" do dashboard** (Agendar, Orçamento, Pneus, Bateria) são
  atalhos diretos para os fluxos.
- **Frame de celular:** no desktop, o app é renderizado num container de largura
  de telefone (~390px) centralizado, com cantos arredondados, para vender o "é um
  app". No mobile, ocupa a viewport inteira.

---

## 5. As telas (os 7 itens do menu + telas de apoio)

São as **7 telas do menu do cliente** (Início, Meus Veículos, Agendamentos,
Histórico, Orçamentos, Notificações, Perfil) mais telas de **apoio**: o **hub
Serviços** (necessário porque a bottom-nav tem essa aba) e as telas de **detalhe**
(veículo, OS, orçamento). Todas com dados fictícios.

**Persona mock:** João Mendes. Veículos: **VW Golf 1.4 TSI 2018** (placa ABC-1D23)
e **Chevrolet Onix 1.0 Turbo 2021** (placa DEF-2G45). Datas mock plausíveis
(revisões no futuro próximo; reparos recentes).

### 5.1 Início (`/app`) — réplica fiel da referência
- App bar (☰ + 🔔 com badge "2").
- Saudação "Olá, João! 👋" + "Bem-vindo à Auto Mecânica Mundial".
- "Meus veículos" + "Ver todos" → **carrossel** de cards de veículo (logo da
  marca, modelo, ano, placa com botão copiar, foto/gradiente) + indicador de dots.
- Card "**Próxima revisão**": ícone calendário, "Em 3.250 km ou DD/MM/AAAA", barra
  de progresso, "Faltam 3.250 km", chevron.
- "**Últimos reparos**" + "Ver histórico" → 3 linhas com chip de ícone colorido,
  nome, data, valor, chevron.
- "**Serviços rápidos**" → 4 cards: Agendar serviço · Orçamento · Pneus · Bateria.

### 5.2 Meus Veículos (`/app/veiculos`) + detalhe (`/app/veiculos/[id]`)
- Lista de veículos (cards).
- Detalhe: foto/cabeçalho, ficha (marca, modelo, ano, versão, cor, placa, renavam,
  chassi, combustível, km) e "**Próximas manutenções**" (óleo, filtro, freios,
  bateria, correia dentada, pneus) com status (em dia / próxima / vencida).

### 5.3 Serviços — hub (`/app/servicos`)
- Atalhos: Agendar serviço · Meus agendamentos · Orçamentos · Histórico.
- Catálogo: Troca de óleo · Revisão · Freios · Suspensão · Elétrica · Alinhamento ·
  Balanceamento · Diagnóstico.

### 5.4 Agendamento (`/app/agendar`)
- Fluxo em passos (estado local): **veículo → serviço → data → horário →
  confirmação**. Stepper visual no topo.
- "Meus agendamentos": lista com status no fluxo **Agendado → Confirmado → Em
  andamento → Finalizado** (badges).

### 5.5 Histórico (`/app/historico`) + detalhe da OS
- Lista de OS: nº, data, km, valor, garantia, responsável. Filtro por veículo.
- Detalhe: fotos **antes/durante/depois** (usar as fotos reais da oficina —
  `real-garage.jpg`, `real-diagnostic.jpg` — como mock), valor, garantia,
  "Relatório PDF" (link fake).

### 5.6 Orçamentos (`/app/orcamentos`) + detalhe
- Lista com status: **pendente / aprovado / rejeitado**.
- Detalhe: **peças** (nome, qtd, valor), **serviços** (descrição, valor),
  **totalização** (subtotal, descontos, valor final), botões **Aprovar / Rejeitar**
  (alternam o estado no protótipo, sem persistência).

### 5.7 Notificações (`/app/notificacoes`) e Perfil (`/app/perfil`)
- **Notificações:** troca de óleo próxima, revisão em 30 dias, IPVA, licenciamento,
  promoção (10% óleo). Estado lido/não-lido (badge).
- **Perfil:** dados do cliente (nome, CPF, telefone, WhatsApp, e-mail, endereço),
  ajustes, dica "instalar app na tela inicial", sair (mock).

---

## 6. Arquitetura e estrutura de arquivos

```
app/app/                      ← URL base /app (renomeável p/ /cliente ou /portal)
  layout.tsx                  ← tema escuro (.app-root) + PhoneFrame + app shell
  app.css                     ← tokens navy escopados em .app-root
  _data/
    mock.ts                   ← fonte única de verdade dos dados fictícios (tipada)
  _components/
    phone-frame.tsx           ← frame de celular (desktop) / full-bleed (mobile)
    top-bar.tsx               ← ☰ + título + 🔔 badge
    bottom-nav.tsx            ← 4 abas, ativa via usePathname
    drawer.tsx                ← menu completo (7 itens + WhatsApp + sair)
    vehicle-carousel.tsx, vehicle-card.tsx
    next-service-card.tsx, repair-row.tsx, quick-actions.tsx
    service-hub.tsx, booking-stepper.tsx, status-badge.tsx
    budget-card.tsx, budget-detail.tsx, notification-row.tsx
    section-heading.tsx       ← "Título + Ver todos/Ver histórico"
  page.tsx                    ← Início
  veiculos/page.tsx, veiculos/[id]/page.tsx
  servicos/page.tsx
  agendar/page.tsx
  historico/page.tsx, historico/[id]/page.tsx
  orcamentos/page.tsx, orcamentos/[id]/page.tsx
  notificacoes/page.tsx
  perfil/page.tsx
```

### Princípios
- **Isolamento de tema:** `.app-root` + `html:has(.app-root)` força escuro só na
  rota `/app`. O site de marketing continua claro. Sem regressão.
- **Sem novas dependências:** apenas `lucide-react` + `motion` + Tailwind 4.
- **Componentes focados:** cada componente faz uma coisa, recebe dados via props,
  testável isoladamente. `mock.ts` é a única fonte de dados.
- **Server vs Client:** páginas são Server Components quando possível; componentes
  com interação (carrossel, stepper, drawer, toggles aprovar/rejeitar) são
  `"use client"` com estado local React.
- **Next.js 16:** consultar `node_modules/next/dist/docs/` antes de codar
  (conforme AGENTS.md — esta versão tem breaking changes).

### Modelo dos dados mock (formato em `mock.ts`)
`cliente` · `veiculos[]` (com `proximasManutencoes[]` e `proximaRevisao`) ·
`reparos[]` · `agendamentos[]` (com `status`) · `orcamentos[]` (com `pecas[]`,
`servicos[]`, `totais`, `status`) · `notificacoes[]` (com `lido`) ·
`catalogoServicos[]` · `ordensServico[]` (histórico, com `fotos[]`).

---

## 7. Lacuna de assets

A imagem mostra um **render recortado do carro** sobre gradiente azul. Só existem
2 fotos limpas (`real-garage.jpg`, `real-diagnostic.jpg`) e não há gerador de
imagem. **Resolução:** card de veículo com gradiente azul + brasão/nome da marca
(via `lucide-react` ou texto) + tratamento da foto real disponível — sem depender
de um recorte inexistente. As fotos reais alimentam o detalhe da OS (antes/depois).

---

## 8. Verificação

1. `next dev` e abrir `/app` em viewport mobile (~375–390px).
2. Navegar as **7 telas** (e os detalhes de veículo/OS/orçamento); conferir
   fidelidade à imagem de referência.
3. Confirmar que o **tema escuro não vaza** para `/`, `/v1`–`/v4` e que o site
   claro não afeta `/app`.
4. Conferir interações: carrossel, abrir/fechar drawer, passos do agendamento,
   aprovar/rejeitar orçamento, marcar notificação como lida.
5. **Cuidados de verificação** (do histórico do projeto): scroll-reveal + corrida
   de compilação do `next dev` podem mostrar tela em branco/sem estilo em
   screenshots ingênuos — rolar por seção e usar `wait_for` antes de medir.

---

## 9. Próximos passos (após este protótipo)

1. Estender para Fatia B (Painel da Oficina) e Fatia C (Mecânico) — protótipos.
2. Camada de Fundação: TiDB + Prisma + autenticação + papéis.
3. Trocar `mock.ts` por dados reais (Server Actions / API Routes).
4. PWA real (manifest + service worker) e integrações externas.
