# Ciclo de vida da OS — Fase 1 (a OS como espinha do processo)

**Data:** 2026-07-06
**Objetivo:** deixar o sistema funcional de verdade fazendo a **Ordem de Serviço** ser o processo do carro (da entrada à entrega), conectando vistoria, orçamento, estoque, financeiro e a aprovação do cliente.

## Diagnóstico
As peças existiam soltas (OS estática, orçamento, estoque, financeiro sem conversar). A raiz dos "furos de processo" era a OS não ser tratada como o fluxo do carro. Fase 1 conserta isso.

## Fluxo modelado
`Aberta → Aguardando aprovação → Em execução → Finalizada → Entregue`

1. **Entrada (check-in) + vistoria** (`/oficina/entrada`): recepção registra cliente, veículo, km, combustível, **vistoria** (checklist de 12 itens com OK/Atenção/Avaria + avarias + objetos) e **autorização** → abre a OS `Aberta`.
2. **Orçamento na própria OS** (`/oficina/ordens/[id]` = centro de controle): adiciona/remove peças e serviços; peça pode **vincular a um produto do estoque**. "Enviar p/ aprovação" gera um `Budget` ligado à OS e move para `Aguardando aprovação`.
3. **Aprovação do cliente** (`/app/orcamentos/[id]`): aprovar move a OS para `Em execução` (rejeitar volta p/ `Aberta`) — via `setBudgetStatus` que enxerga `budget.serviceOrderId`.
4. **Execução → Finalizada**: ao finalizar, **baixa o estoque** das peças vinculadas (idempotente via `stockApplied`).
5. **Entrega (check-out)**: km de saída + pagamento. Se pago, **lança a receita** no financeiro (idempotente via `financeApplied`), ligada à OS.

## Mudanças de dados (schema, não-destrutivo)
- `ServiceOrder`: `fuelLevel`, `exitKm`, `inspection`(Json), `authorized`, `paid`, `deliveredAt`, `stockApplied`, `financeApplied`.
- `ServiceOrderItem`: `productId` (vínculo com estoque).
- `Budget`: `serviceOrderId`. `Transaction`: `serviceOrderId`.

## Arquivos-chave
- `app/oficina/os-actions.ts` — `darEntrada`, `adicionarItemOS`, `removerItemOS`, `mudarStatus` (baixa estoque ao finalizar), `enviarParaAprovacao`, `entregarOS` (lança receita).
- `app/oficina/entrada/` + `_components/entrada-form.tsx` — check-in/vistoria.
- `app/oficina/_components/order-control.tsx` — centro de controle da OS (status funcional, itens, vistoria, entrega).
- `lib/admin-data.ts` — `getOrdemControle`. `app/app/orcamentos/actions.ts` — liga aprovação → OS.

## Verificado
Ciclo real no banco: entrada com vistoria → finalizar baixou estoque (−qtd da peça) → entrega paga lançou receita ligada à OS. Build de produção passa.

## Fora de escopo (Fases seguintes)
- **Fase 2 (mecânico):** OS atribuídas, checklist técnico durante execução, mecânico adiciona itens, **upload real de fotos** (Vercel Blob).
- **Fase 3 (cliente):** solicitar orçamento, acompanhar a OS em tempo real, **notificações por evento**, documentos reais liberados.
