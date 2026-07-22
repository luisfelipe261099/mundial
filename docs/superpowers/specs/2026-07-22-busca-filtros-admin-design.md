# Busca e filtros no painel admin + upgrade da página de Estoque

**Data:** 2026-07-22 · **Status:** aprovado pelo usuário

## Objetivo

Com a base real importada (64 clientes, 71 veículos), as listagens do painel
`/oficina` viraram scroll sem fim. Adicionar **busca e filtros** em Clientes,
Veículos, Ordens de serviço e Estoque — e, no Estoque, melhorar a página como
um todo (movimentação com quantidade, edição/exclusão, preço e ordenação).

## Abordagem

**Filtro client-side, instantâneo** (aprovado sobre alternativas server-side/URL):
as páginas já carregam todos os dados no server component e o volume é pequeno
(dezenas/centenas de linhas). A tabela vira/estende um client component com
`useState`, seguindo o padrão existente da `OrdersTable` (abas de status).
Sem query params, sem paginação, sem mudança de backend para a busca em si.

## Componente compartilhado

`app/oficina/_components/table-filters.tsx`:

- `SearchInput` — campo com ícone de lupa, placeholder por página, botão limpar.
- `FilterChip` — toggle de filtro booleano (ex.: "Abaixo do mínimo").
- `FilterSelect` — select estilizado para filtros de valor (marca, mecânico, ordenação).
- `matches(texto, busca)` — normalização compartilhada: case-insensitive, sem
  acentos (NFD), e placas casam com/sem hífen (mesma ideia do `normPlate` do login).

Visual: mesmo idioma dos cards admin (`--ad-line`, `--ad-surface-2`, `adm-muted`).

## Comportamentos comuns

- Contador "**X de Y**" visível quando há filtro ativo.
- Estado vazio: "Nenhum resultado para '…'" + botão **Limpar filtros**.
- Stats do `PageHeader` continuam globais (não reagem ao filtro).
- Filtros não persistem entre navegações (decisão consciente — YAGNI).

## Por página

### Clientes (`/oficina/clientes`)

- Nova `clients-table.tsx` (client); a página server continua buscando os dados.
- **Busca:** nome, telefone, e-mail, cidade **e placas dos veículos** do cliente.
- **Filtros (chips):** "Sem telefone" · "Sem veículo" (dados a completar na base real).
- Ajuste na camada de dados: `getClientes` passa a incluir as placas
  (`vehicles: { select: { plate: true } }`) no lugar de só `_count`.

### Veículos (`/oficina/veiculos`)

- Nova `vehicles-table.tsx` (client).
- **Busca:** placa, marca, modelo, proprietário.
- **Filtros:** select de **marca** (montado dos dados) + chip "Revisão vencida".

### Ordens (`/oficina/ordens`)

- Estende a `OrdersTable` existente (mantém as abas de status).
- **Busca:** nº da OS, cliente, placa, veículo.
- **Filtro novo:** select de **mecânico** (montado dos dados).

### Estoque (`/oficina/estoque`) — upgrade completo

- **Busca:** produto, marca, código. **Chip:** "Abaixo do mínimo".
- **Ordenação:** padrão = abaixo do mínimo primeiro, depois nome; select
  Status / Nome / Quantidade.
- **Movimentar com quantidade:** além dos botões ±1, botão "Movimentar" por
  linha abre mini-form inline: Entrada/Saída + quantidade + motivo (sugestões:
  Compra, Uso em OS, Ajuste, Perda; aceita texto livre). Registra na trilha
  (`StockMovement`) com o `actor` da sessão.
- **Editar produto:** nome, marca, código, mínimo, preço. **Quantidade não é
  editável direto** — só via movimentação (preserva a trilha de auditoria).
- **Excluir produto:** confirmação explícita; se houver movimentações, o aviso
  informa que o histórico vai junto ("apaga também as N movimentações") e a
  action remove os movimentos antes do produto (o schema é `onDelete: Restrict`).
  Itens de OS antigas não são afetados (guardam descrição própria; `productId`
  é string sem FK).
- **Preço e valor do estoque:** novo campo `price Int?` no model `Product` —
  mudança **aditiva** (coluna nullable) aplicada com `prisma db push` no banco
  único dev/prod, segura. Coluna "Preço" na tabela e stat novo no `PageHeader`:
  "valor em estoque" = Σ `price × qty` (só produtos com preço). Reais inteiros,
  convenção do sistema (sem centavos — mudar isso seria migração global, fora
  de escopo).

## Actions (todas com `requireAdmin`)

- `movimentarEstoque(id, delta, motivo?)` — ganha parâmetro opcional de motivo
  (default atual: "Entrada manual"/"Saída manual").
- `editarProduto(id, { produto, marca, codigo, minimo, preco })` — nova.
- `excluirProduto(id)` — nova; `deleteMany` dos movimentos + delete do produto.
- `criarProduto` — ganha campo `preco` opcional.
- `getEstoque` inclui `price`; tipo `Produto` ganha `preco?: number | null`.

## Fora de escopo

Filtros na URL, paginação, área do mecânico, app do cliente, centavos,
edição de quantidade direta, papel de estoque para mecânico (segue admin-only).

## Verificação

`npm run build` + lint limpos; navegação real nas 4 páginas (dev server +
browser) exercitando busca, cada filtro, movimentação com quantidade, edição
e exclusão. ⚠️ O banco é produção: testar escrita criando um produto "TESTE"
e excluí-lo ao final (a própria feature de exclusão cobre a limpeza).
