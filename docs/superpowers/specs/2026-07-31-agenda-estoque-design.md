# Agenda com cliente vinculado + Estoque com nota fiscal e preço de venda — design

**Data:** 2026-07-31 · **Status:** aprovado pelo usuário

Dois subsistemas independentes, desenhados juntos porque compartilham um
componente (o combobox de busca). **Implementação em duas fases: agenda
primeiro, estoque depois.**

---

# Parte 1 — Agenda

## Problema

1. **Agendamento criado pelo admin nasce órfão.** O model `Appointment` já tem
   `clientId` (FK opcional) *e* `clientName` (texto livre) — foi desenhado para
   aceitar cliente cadastrado ou avulso. Mas `criarAgendamento`
   (`app/oficina/actions.ts:137`) só grava `clientName`. Resultado: o cliente
   nunca vê no portal dele, porque `/app/agendar` filtra por `clientId`.
2. **Não há como escolher um cliente cadastrado.** O campo é texto puro, sem
   busca — e a oficina tem 124 clientes.
3. **A lista é uma lista corrida** de todos os agendamentos ordenada por data
   crescente, então os vencidos aparecem primeiro. Sem agrupamento, sem busca,
   sem filtro.
4. **Só dá para criar.** Não existe editar, remarcar, cancelar nem excluir.
5. **Quatro vocabulários de status convivendo:**
   - o form do admin grava `"Confirmado"`/`"Aguardando"`;
   - o portal do cliente grava `"Agendado"` (`app/app/agendar/actions.ts:21`);
   - `getAgendaHoje` achata tudo que não for `"Confirmado"` em `"Aguardando"`,
     perdendo o rótulo original;
   - os tipos divergem: `Agendamento["status"]` do admin
     (`app/oficina/_data/mock.ts:191`) é `"Confirmado" | "Aguardando"`, e
     `StatusAgendamento` do portal (`app/app/_data/mock.ts:16`) é
     `"Agendado" | "Confirmado" | "Em andamento" | "Finalizado"`.

   Pior: `lib/client-data.ts:316` faz `a.status as Agendamento["status"]` — um
   cast sem verificação. Um status que o portal não conhece passa direto pelo
   TypeScript e cai no mapa de badge de `category.tsx:55` como `undefined`,
   gerando `class={undefined}`.

## Objetivo

No novo agendamento, escolher **um cliente cadastrado** (buscando conforme
digita) **ou** digitar **um nome avulso** — e, no primeiro caso, escolher o
veículo entre os carros daquele cliente. Junto disso, tornar a página utilizável:
agrupada por dia, com busca, filtros, edição, cancelamento e um atalho para
transformar o compromisso em OS.

## Decisões (confirmadas com o usuário)

- Cliente cadastrado **ou** avulso, no mesmo campo, com filtragem conforme digita.
- Ao escolher cliente cadastrado, o veículo vira lista dos carros dele.
- Agrupar por dia e separar os passados.
- Editar, remarcar e cancelar.
- Botão "cliente chegou → dar entrada".
- Busca e filtros.

## Banco

Uma mudança:

```prisma
model Appointment {
  clientId    String?   // JÁ EXISTE — passa a ser preenchido
  vehicleId   String?   // NOVO
  vehicle     Vehicle?  @relation(fields: [vehicleId], references: [id])
  clientName  String?   // continua, mas SÓ para cliente avulso
  ...
  @@index([date])       // NOVO — a listagem ordena e agrupa por data
}

model Vehicle {
  appointments Appointment[]   // NOVO (lado inverso da relação)
}
```

**Regra de preenchimento:**

| Caso | `clientId` | `clientName` |
|---|---|---|
| Cliente cadastrado | id do cliente | **`null`** |
| Cliente avulso | `null` | nome digitado |

`clientName` fica nulo quando há vínculo de propósito. A leitura já faz
`clientName ?? client?.name` (`lib/admin-data.ts:439`), então o nome passa a ser
sempre derivado da fonte da verdade — renomear um cliente reflete na agenda. E o
campo ganha um significado único: *"este agendamento é de alguém não cadastrado"*.

## Componente compartilhado: `combobox.tsx`

`app/oficina/_components/combobox.tsx` — combobox genérico, sem saber nada de
agenda nem de estoque. É a base do seletor de cliente (fase 1) e do seletor de
produto (fase 2).

```ts
type ComboOption = { id: string; label: string; hint?: string };

{
  value: { id: string | null; texto: string };
  onChange: (v: { id: string | null; texto: string }) => void;
  options: ComboOption[];
  placeholder?: string;
  /** Rótulo do item extra no fim da lista quando a busca não acha nada.
   *  Recebe o texto digitado. Ausente = sem item extra. */
  criarLabel?: (texto: string) => string;
  onCriar?: (texto: string) => void;
}
```

**Comportamento:**

- Filtra `options` com `matches([label, hint], texto)` de `filter-utils.ts` —
  o mesmo normalizador das outras listagens, que ignora acento e pontuação
  (buscar `jose` acha `José Antônio`).
- Escolher da lista → `{ id, texto: label }`. Digitar sem escolher →
  `{ id: null, texto }`. Editar o texto depois de ter escolhido **limpa o `id`**.
- Teclado: `↓`/`↑` navegam, `Enter` escolhe o realçado, `Esc` fecha.
- A11y: `role="combobox"` com `aria-expanded` e `aria-activedescendant` no input;
  `role="listbox"` na lista e `role="option"` com `aria-selected` nos itens.
- Fecha ao clicar fora e ao perder foco.

`client-picker.tsx` é uma casca fina: recebe `clientes: {id, nome}[]`, monta as
`options` e exibe o selo de estado abaixo do campo — `● cliente cadastrado ·
N veículos` ou `○ avulso — não vai aparecer no app dele`.

## Campo de veículo

Deriva do cliente escolhido:

- **Cliente cadastrado com carros** → `<select>` com `modelo · placa` e uma opção
  final `✎ digitar outro`, que troca para texto livre. Grava `vehicleId`.
- **Cliente avulso, ou cadastrado sem carro, ou "digitar outro"** → texto livre.
  Grava só `vehicleName`.

**Correção necessária em `getClientesVeiculosParaOS()`** (`lib/admin-data.ts:513`):
hoje devolve `proprietario` como **nome**, e `new-order-form.tsx:50` filtra os
veículos comparando strings de nome — dois clientes homônimos misturam os carros.
Passa a devolver também `clienteId`, e o filtro passa a ser por id. Conserta a
agenda e o formulário de nova OS.

## Status unificado

Cinco valores canônicos, num tipo só — `StatusAgendamento` em
`app/app/_data/mock.ts:16`, que passa a ser **a única definição**, importada
também pelo admin:

| Status | Significado | Badge admin | Badge portal |
|---|---|---|---|
| `Agendado` | padrão; o que o portal do cliente já grava | `osb-aberta` | `badge-agendado` |
| `Confirmado` | oficina confirmou | `osb-finalizada` | `badge-confirmado` |
| `Compareceu` | cliente veio | `osb-execucao` | `badge-confirmado` |
| `Faltou` | não veio | `osb-cancelada` **(nova)** | `badge-agendado` |
| `Cancelado` | desmarcado | `osb-entregue` | `badge-agendado` |

- `.osb-cancelada` não existe em `app/oficina/admin.css` — é uma classe nova, em
  vermelho, seguindo o padrão das linhas 161–165.
- `Faltou` e `Cancelado` aparecem esmaecidos na lista da agenda.
- Registros antigos com `"Aguardando"` são **lidos** como `Agendado` (mapeamento
  na leitura, sem tocar nos dados existentes).
- `"Em andamento"` e `"Finalizado"` saem do tipo: nenhuma action grava esses
  valores, só existiam nos dados de protótipo.
- `getAgendaHoje` (`lib/admin-data.ts:348`) para de achatar tudo em dois valores
  e passa a devolver o status real.
- `Agendamento["status"]` em `app/oficina/_data/mock.ts:191` deixa de ser a união
  de dois e passa a usar `StatusAgendamento`.
- O cast sem verificação de `lib/client-data.ts:316` vira uma função
  `normalizarStatus(s: string): StatusAgendamento` que mapeia `"Aguardando"` →
  `Agendado` e qualquer valor desconhecido → `Agendado`. Assim nenhum dado velho
  ou inesperado gera `class={undefined}` no portal.

## Listagem

**Agrupamento por dia.** Futuros primeiro, em blocos: `Hoje`, `Amanhã`, depois
`rotuloDia(iso)` (`lib/datas.ts`, formato `Seg · 04/08`). Os anteriores vão para
um `<details>` recolhido no fim, com a contagem no rótulo.

**A data de hoje é calculada no servidor** com `hojeISO()` e passada como prop
para o componente cliente. Obrigatório: o servidor da Vercel roda em UTC e
`lib/datas.ts` ancora tudo em `America/Sao_Paulo`; se o cliente calculasse com
`new Date()`, depois das 21h o "hoje" divergiria e daria erro de hidratação.

**Busca e filtros**, reaproveitando `table-filters.tsx`:

- `SearchInput` — busca em cliente, veículo e serviço via `matches()`.
- `FilterSelect` — status (`Todos` + os cinco).
- `FilterChip` — "só futuros".
- `ResultBar` — `N de M` e botão de limpar.

**Ações por linha:**

- **Editar** — abre o mesmo formulário preenchido.
- **Status** — `FilterSelect` inline que chama `mudarStatusAgendamento`.
- **Excluir** — confirmação inline, no padrão já usado no estoque
  (`stock-manager.tsx:319`).
- **Cliente chegou** — link para `/oficina/entrada?cliente=<id>&veiculo=<id>`.
  Só aparece quando o agendamento tem **os dois** vínculos; agendamento avulso
  não tem o que pré-preencher.

## Pré-preenchimento da entrada

`app/oficina/entrada/page.tsx` passa a ler `searchParams` — que no Next 16 é
`Promise`, igual ao `params` em `app/oficina/ordens/[id]/page.tsx:8`:

```ts
export default async function EntradaPage({
  searchParams,
}: {
  searchParams: Promise<{ cliente?: string; veiculo?: string }>;
}) {
  const { cliente, veiculo } = await searchParams;
  const { clientes, veiculos } = await getClientesVeiculosParaOS();
  return <EntradaForm clientes={clientes} veiculos={veiculos}
                      clienteInicial={cliente} veiculoInicial={veiculo} />;
}
```

`EntradaForm` usa os valores como estado inicial de `clienteId`/`veiculoId`,
**validando que os ids existem nas listas recebidas** — id inválido na URL cai no
comportamento atual (campo vazio), sem quebrar a tela.

## Actions (todas com `requireAdmin`)

| Action | O que faz |
|---|---|
| `criarAgendamento` (altera) | passa a aceitar `clienteId?` e `veiculoId?`; aplica a regra `clientId`/`clientName` da tabela acima |
| `atualizarAgendamento(id, input)` | mesma regra, em update |
| `mudarStatusAgendamento(id, status)` | valida contra os cinco status |
| `excluirAgendamento(id)` | remove o registro |

Todas com `revalidatePath("/oficina/agenda")` e `revalidatePath("/oficina")`.

## Arquivos

| Arquivo | O que acontece |
|---|---|
| `app/oficina/_components/combobox.tsx` | **novo** — combobox genérico |
| `app/oficina/_components/client-picker.tsx` | **novo** — casca de cliente |
| `app/oficina/_components/agenda-form.tsx` | **novo** — criar/editar |
| `app/oficina/_components/agenda-manager.tsx` | encolhe: lista, agrupamento, filtros, ações |
| `app/oficina/agenda/page.tsx` | carrega clientes/veículos e `hojeISO()` |
| `app/oficina/actions.ts` | 3 actions novas + `criarAgendamento` alterada |
| `lib/admin-data.ts` | `AgendaItem` ganha `clienteId`, `veiculoId`, `placa`; `getClientesVeiculosParaOS` ganha `clienteId` |
| `app/oficina/entrada/page.tsx` | lê `searchParams` |
| `app/oficina/_components/entrada-form.tsx` | aceita valores iniciais |
| `app/oficina/_components/new-order-form.tsx` | filtra veículos por `clienteId` |
| `app/app/_data/mock.ts` | `StatusAgendamento` vira os cinco canônicos |
| `app/oficina/_data/mock.ts` | `Agendamento["status"]` passa a usar `StatusAgendamento` |
| `lib/client-data.ts` | cast sem verificação vira `normalizarStatus()` |
| `app/app/_components/category.tsx` | mapa de badge cobre os cinco status |
| `app/oficina/admin.css` | classe `.osb-cancelada` |
| `prisma/schema.prisma` | `Appointment.vehicleId` + índice + relação inversa |

---

# Parte 2 — Estoque

## Problema

1. **Não existe preço de venda.** `Product.price` é o **custo**
   (`prisma/schema.prisma:169`). Não há como saber a margem de nada.
2. **Não existe nota fiscal nem fornecedor** em lugar nenhum do sistema.
3. **A entrada é peça por peça.** O painel inline de movimentação
   (`stock-manager.tsx:274`) aceita tipo + quantidade + motivo. Uma nota com 8
   itens são 8 operações desconexas, e o custo daquela compra não fica registrado.
4. **O vínculo com a OS não aproveita o preço.** `order-control.tsx:303` preenche
   só a descrição ao escolher uma peça do estoque; o valor é digitado à mão.

## Objetivo

Dar entrada no estoque **por nota fiscal** — fornecedor, número, data e vários
itens com custo unitário, num lançamento só — e passar a controlar **custo e
preço de venda** por produto, com margem visível e preenchimento automático na OS.

## Decisões (confirmadas com o usuário)

- Entrada por NF como **documento** (model próprio), não campo solto.
- Preço de venda é **campo próprio**, com **markup sugerido** configurável.
- O preço de venda **puxa automático** para a OS ao vincular a peça.
- **Custo em centavos, venda em reais inteiros** (justificativa abaixo).
- Dá para **cadastrar produto novo** durante o lançamento da nota.
- **Sem anexar arquivo** da NF (PDF/XML) nesta etapa.

### Por que duas unidades de dinheiro

O custo vem da nota fiscal: a oficina não escolhe o valor, o fornecedor cobra
R$ 38,90 — precisa de centavos. O preço de venda é decidido pela oficina, que
vende a R$ 62 ou R$ 65, não a R$ 62,90 — não precisa.

Com isso o valor de venda tem **a mesma unidade da OS** (reais inteiros), e
puxá-lo para um item de OS é exato, sem arredondamento. A alternativa —
migrar OS, itens, orçamentos, transações e financeiro para centavos — mexeria em
PDF, relatórios e portal do cliente e exigiria script de conversão sobre dados
reais, sem ganho para o usuário final.

O sufixo `Cents` no nome é a única defesa contra confundir as duas. `costCents`
avisa que precisa dividir por 100; `salePrice` avisa que não.

## Banco

```prisma
model Product {
  costCents  Int?   // NOVO — custo unitário em CENTAVOS (última compra)
  salePrice  Int?   // NOVO — preço de venda em REAIS inteiros
  price      Int?   // REMOVIDO ao fim da migração (ver abaixo)
  purchaseItems PurchaseNoteItem[]   // NOVO
  ...
}

// Nota de compra: um documento, vários produtos.
model PurchaseNote {
  id         String   @id @default(cuid())
  supplier   String
  number     String?              // opcional — compra sem nota
  date       String               // ISO "YYYY-MM-DD"
  totalCents Int      @default(0) // soma dos itens, para conferir com o fornecedor
  actor      String?              // quem lançou
  createdAt  DateTime @default(now())
  items      PurchaseNoteItem[]

  @@index([date])
  @@map("purchase_notes")
}

model PurchaseNoteItem {
  id            String       @id @default(cuid())
  noteId        String
  note          PurchaseNote @relation(fields: [noteId], references: [id], onDelete: Cascade)
  productId     String
  product       Product      @relation(fields: [productId], references: [id], onDelete: Restrict)
  qty           Int
  unitCostCents Int

  @@index([noteId])
  @@index([productId])
  @@map("purchase_note_items")
}

model StockMovement {
  purchaseNoteId String?   // NOVO — liga a trilha à nota que originou a entrada
  ...
}

model Settings {
  markupPct Int @default(60)   // NOVO — margem padrão sugerida
  ...
}
```

`costCents` é o custo da **última entrada**, não média ponderada — é o que a
oficina tem na cabeça ("essa peça tá custando quanto agora?") e não exige
recalcular histórico a cada compra.

## Lançar a nota é uma transação só

`lancarNota` faz cinco coisas, todas dentro de um `prisma.$transaction`:

1. cria a `PurchaseNote`
2. cria os produtos novos que vieram inline
3. cria os `PurchaseNoteItem`
4. soma `qty` e atualiza `costCents` de cada produto
5. cria um `StockMovement` por item, com `reason: "Entrada por NF"` e
   `purchaseNoteId` preenchido

Isso é requisito, não detalhe. Se metade aplicasse, o estoque ficaria com
quantidade sem trilha ou trilha sem quantidade, e o histórico deixaria de ser
auditável. Ou entra a nota inteira, ou não entra nada.

**Guarda contra lançamento duplicado:** antes de salvar, a action procura nota
com mesmo `supplier` + `number`. Se achar, devolve
`{ duplicada: { data } }` e a tela avisa ("essa nota já foi lançada em 14/jul"),
exigindo confirmação explícita (`forcar: true`) para prosseguir. Não bloqueia —
número repetido entre fornecedores diferentes acontece.

## Tela de entrada — `/oficina/estoque/entrada`

Página própria. Não cabe em painel inline: são cabeçalho, N itens e totais, e o
`stock-manager.tsx` já tem 343 linhas.

```
NOVA ENTRADA DE ESTOQUE                    [Cancelar]
──────────────────────────────────────────────────────
Fornecedor: [Auto Peças Silva      ▾]  ← datalist com
Nota fiscal: [45821]  Data: [31/07/2026]   fornecedores já usados

ITENS
  Produto                    Qtd   Custo un.    Total
  Óleo Motul 5W30 · MOT-530   12   R$ 38,90   R$ 466,80  ✕
  Pastilha diant. · PF-320    ⤷ produto novo
                               4   R$ 89,90   R$ 359,60  ✕
  [ + adicionar item ]
──────────────────────────────────────────────────────
  2 itens · 16 peças              TOTAL  R$ 826,40
                        [ Dar entrada no estoque ]
```

- **Fornecedor:** texto livre com `<datalist>` dos fornecedores já usados
  (`SELECT DISTINCT supplier`). Sem model `Supplier` — YAGNI.
- **Data:** default hoje (`hojeISO()`).
- **Produto:** `product-picker.tsx`, casca do `combobox.tsx` sobre a lista do
  estoque (`label` = nome, `hint` = código).
- **Produto novo:** quando a busca não acha, o combobox oferece
  `+ cadastrar "pastilha diant…"`. A linha expande pedindo **código, marca,
  mínimo e preço de venda** — este já sugerido por
  `Math.round((custoEmReais) * (1 + markupPct/100))`. O produto é criado dentro
  da mesma transação da nota.
- **Salvar habilita** com fornecedor preenchido e ao menos um item com produto,
  `qty >= 1` e `unitCostCents >= 0`.

**Digitação de centavos:** `<input type="number" step="0.01" min="0">`,
convertido com `Math.round(valor * 100)`. O arredondamento é necessário porque
`38.90 * 100` em ponto flutuante dá `3889.9999…`.

## Resto da página de estoque

**Tabela** ganha três colunas — Custo, Venda, Margem:

```
Produto          Código    Custo     Venda   Margem   Qtd
Óleo Motul 5W30  MOT-530   R$ 38,90  R$ 62    +59%     12
Filtro de óleo   FO-114    R$ 12,45  R$ 25   +101%     20
Pastilha diant.  PF-320    R$ 89,90  R$ 95     +6% ⚠    4
```

Margem = `((salePrice * 100 - costCents) / costCents) * 100`, arredondada.
Destacada em âmbar abaixo de 20% e em vermelho se negativa. Sem custo ou sem
venda cadastrados → `—`, sem alerta.

Ordenação ganha as opções `Margem` e `Valor em estoque`.

**Cabeçalho** passa de três para quatro números: itens, abaixo do mínimo,
**valor a custo** (`Σ costCents × qtd`) e **valor a venda** (`Σ salePrice × qtd`).

**Histórico** vira duas abas no mesmo bloco:

- `Movimentações` — o que já existe; entradas por NF mostram o número da nota
  ao lado do motivo (como já faz com `osId` em `stock-history.tsx:45`).
- `Notas de entrada` — fornecedor, número, data, nº de itens e total,
  expansível para ver os itens com quantidade e custo unitário.

**Cadastro de produto** ganha custo e preço de venda, com a venda sugerida pelo
markup assim que o custo é digitado (sobrescrevível).

**Configurações da oficina** (`/oficina/configuracoes`) ganha o campo
"margem padrão (%)", gravado em `Settings.markupPct`.

## Preço de venda na OS

`order-control.tsx:303-304` hoje preenche só `descricao` ao escolher uma peça.
Passa a preencher também `valor` com `p.salePrice` (quando existe), ainda
editável. É onde o vínculo `productId` já existe.

O orçamento **não tem vínculo com estoque** (`BudgetItem` não tem `productId`),
mas como orçamento é gerado a partir de uma OS (`Budget.serviceOrderId`), o preço
flui sozinho. Não se cria vínculo novo lá.

## Actions (todas com `requireAdmin`)

| Action | O que faz |
|---|---|
| `lancarNota(input, forcar?)` | a transação descrita acima; devolve `{ ok }` ou `{ duplicada }` |
| `criarProduto` (altera) | aceita `costCents` e `salePrice` no lugar de `preco` |
| `editarProduto` (altera) | idem |
| `excluirProduto` (altera) | **bloqueia** se o produto está em alguma nota (ver abaixo) |
| `salvarConfiguracoes` (altera) | aceita `markupPct` |

**Exclusão de produto muda de comportamento.** Hoje `excluirProduto`
(`app/oficina/actions.ts:129`) apaga as movimentações e depois o produto. Com
`PurchaseNoteItem` referenciando `Product` com `onDelete: Restrict`, apagar um
produto que está numa nota lançada passaria a estourar erro cru do Prisma.

A action passa a contar as notas antes e, se houver alguma, **recusa** com
`{ error: "Produto está em N nota(s) de entrada e não pode ser excluído." }` —
e a UI mostra a mensagem no lugar do botão de confirmar. Apagar em cascata seria
errado: a nota é registro de compra, não pode perder item.

Leituras novas em `lib/admin-data.ts`: `getFornecedores()` (distinct) e
`getNotasEntrada()` (últimas 30 com itens). `getEstoque()` passa a devolver
`costCents` e `salePrice`.

## Migração de `price` → `costCents`

O projeto usa `db push`, sem migrations. Renomear a coluna num `db push` é
**drop + create**: os preços cadastrados hoje somem. Então:

1. Acrescentar `costCents` e `salePrice` no schema, **mantendo `price`**
2. `db push`
3. Backfill: `costCents = price * 100` para todo produto com `price` não nulo
   (script em `prisma/`, idempotente — só preenche onde `costCents IS NULL`)
4. Trocar o código para ler `costCents`
5. Remover `price` do schema e dar `db push` de novo

> ⚠️ **Dev e produção usam o mesmo banco** (risco 3 de `docs/DEPLOY.md`). Todo
> `db push` e o backfill acertam dados reais de 124 clientes. **Parar e confirmar
> com o usuário antes de rodar cada um dos dois passos**, incluindo o backfill,
> que reescreve coluna.

## Arquivos

| Arquivo | O que acontece |
|---|---|
| `lib/dinheiro.ts` | **novo** — `brlCents()`, `centavosParaReais()`, `reaisParaCentavos()`, e a documentação das duas convenções |
| `app/oficina/_components/product-picker.tsx` | **novo** — casca de produto sobre o `combobox.tsx` da fase 1 |
| `app/oficina/estoque/entrada/page.tsx` | **novo** — tela de entrada por NF |
| `app/oficina/_components/purchase-note-form.tsx` | **novo** — formulário da nota |
| `app/oficina/_components/purchase-notes.tsx` | **novo** — aba de notas lançadas |
| `app/oficina/_components/stock-manager.tsx` | colunas de custo/venda/margem, cadastro com os dois preços, botão para a tela de entrada |
| `app/oficina/_components/stock-history.tsx` | vira abas |
| `app/oficina/estoque/page.tsx` | quatro estatísticas, carrega notas |
| `app/oficina/actions.ts` | `lancarNota` + ajustes |
| `lib/admin-data.ts` | `getFornecedores`, `getNotasEntrada`, `getEstoque` com os dois preços |
| `app/oficina/_components/order-control.tsx` | preenche o valor com `salePrice` |
| `app/oficina/_components/settings-form.tsx` | campo de margem padrão |
| `prisma/schema.prisma` | 2 models novos + campos em `Product`, `StockMovement`, `Settings` |
| `prisma/backfill-custo.ts` | **novo** — script do passo 3 |

---

## Fora de escopo

- Anexar PDF/XML da nota (o Vercel Blob do projeto é público — exigiria upload
  privado).
- Model `Supplier` — fornecedor é texto com sugestão.
- Custo médio ponderado — `costCents` é o custo da última compra.
- Migrar OS, orçamento, transações e financeiro para centavos.
- Vincular produto do estoque a item de **orçamento** (`BudgetItem` não tem
  `productId`; o preço chega via OS).
- Editar ou estornar nota já lançada. Correção hoje é movimentação manual, que
  fica registrada na trilha.
- Contas a pagar a partir da nota — a nota não lança despesa em `Transaction`.

## Verificação

Em cada fase: `npm run lint` e `npx tsc --noEmit`, e teste no navegador com a app
rodando, reportando a saída real.

**Fase 1 — agenda:**

- [ ] Criar agendamento avulso (nome digitado) → aparece na lista como avulso
- [ ] Criar agendamento escolhendo cliente cadastrado pela busca → veículo lista
      só os carros dele
- [ ] O agendamento vinculado aparece no portal do cliente (`/app`)
- [ ] Busca com e sem acento acha o mesmo cliente
- [ ] Navegação por teclado no combobox (setas, Enter, Esc)
- [ ] Agrupamento: Hoje / Amanhã / datas futuras / bloco recolhido de anteriores
- [ ] Editar, mudar status e excluir
- [ ] "Cliente chegou" abre `/oficina/entrada` com cliente e veículo preenchidos
- [ ] URL com id inválido não quebra a tela de entrada

**Fase 2 — estoque:**

- [ ] Cadastrar produto com custo e venda; venda sugerida pelo markup
- [ ] Lançar nota com 2 itens, sendo 1 produto novo criado na hora
- [ ] Conferir: quantidade somada, `costCents` atualizado, 2 movimentações
      criadas com `purchaseNoteId`, total da nota igual à soma dos itens
- [ ] Relançar a mesma nota → aviso de duplicada, e só entra com confirmação
- [ ] Margem correta na tabela, incluindo o alerta de margem baixa
- [ ] Vincular a peça num item de OS → valor preenchido com o preço de venda
- [ ] Excluir produto que está numa nota → recusa com mensagem clara
- [ ] Backfill: produtos que tinham `price` aparecem com o custo certo
