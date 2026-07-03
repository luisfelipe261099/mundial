# Design — Gerar PDF da Ordem de Serviço

**Data:** 2026-07-03
**Contexto:** Painel admin (`/oficina`), tela de detalhe da OS.
**Objetivo:** O botão "Gerar PDF" (hoje inerte) deve baixar um `.pdf` bonito e completo,
com logo, cores e identidade visual da Auto Mecânica Mundial.

## Decisões (aprovadas)

| Tema | Decisão |
|---|---|
| Entrega | **Download direto** de um arquivo `.pdf` (sem diálogo de impressão) |
| Biblioteca | `@react-pdf/renderer` (PDF vetorial, controle total de layout/cores/fontes) |
| Onde renderiza | **Route Handler no servidor** — mantém Prisma no servidor, zero lib pesada no cliente |
| Fotos de evidência | **Não incluir** (as atuais são placeholders fixos, não fotos reais da OS) |
| Assinaturas | **Sim** — Cliente + Responsável técnico (mecânico) |
| Tipografia | **Fontes da marca**: Outfit (títulos) + Work Sans (corpo), TTFs embutidos |
| Cor de acento | Azul da marca `#2563eb`; documento em papel branco, tinta grafite `#1a2230` |

## Arquitetura

### Fluxo
```
Clique no <a href="/oficina/ordens/OS-2098/pdf">
   → Route Handler (GET) [runtime nodejs]
       → getOrdemParaPdf(id)            (Prisma: OS + client + vehicle)
       → <ServiceOrderPDF os={...} />   (@react-pdf/renderer)
       → renderToBuffer(...)
       → Response(pdf, {
             Content-Type: application/pdf,
             Content-Disposition: attachment; filename="OS-2098-Joao-Mendes.pdf"
         })
   → navegador baixa o arquivo
```

### Arquivos

| Arquivo | Responsabilidade |
|---|---|
| `app/oficina/ordens/[id]/pdf/route.tsx` | Route Handler: busca dados, renderiza, devolve `application/pdf` com `Content-Disposition: attachment`. `export const runtime = "nodejs"`. |
| `app/oficina/ordens/[id]/pdf/document.tsx` | Componente `<ServiceOrderPDF>` — o documento `@react-pdf` (`Document`/`Page`/`View`/`Text`). Recebe os dados já formatados. Mantém o route fino. |
| `app/oficina/ordens/[id]/pdf/assets.ts` | Registro de fontes (`Font.register` de Outfit/Work Sans) + carga do logo em Buffer/data-URI. Executado uma vez no módulo. |
| `assets/fonts/*.ttf` | Outfit-SemiBold, Outfit-Bold, WorkSans-Regular, WorkSans-SemiBold (4 arquivos, subset mínimo). |
| `lib/admin-data.ts` | Novo `getOrdemParaPdf(id)` — inclui `client` (cpf/phone) e `vehicle` (year/color/fuel/km) com fallback aos campos denormalizados. |
| `app/oficina/ordens/[id]/page.tsx` | Trocar o `<button>` "Gerar PDF" por `<a href={.../pdf}>` mantendo o estilo atual. |
| `next.config.ts` | Se necessário: `serverExternalPackages: ["@react-pdf/renderer"]` (evita erro de bundling). |

### Dados — `getOrdemParaPdf(id)`
Estende o `getOrdem` atual incluindo as relações:
```ts
prisma.serviceOrder.findUnique({
  where: { id },
  include: { items: true, client: true, vehicle: true },
})
```
Retorna a OS + um bloco extra com:
- **Cliente:** nome, cpf, telefone/whatsapp  (fallback: `clientName`)
- **Veículo:** modelo, placa, ano, cor, combustível, km  (fallback: `vehicleName`/`plate`/`km`)

Campos ausentes viram "—". Ordens sem `clientId`/`vehicleId` (denormalizadas) continuam funcionando pelos campos de texto.

## Layout do documento (A4 retrato)

1. **Cabeçalho** — logo à esquerda; nome "AUTO MECÂNICA MUNDIAL" + categoria/cidade;
   à direita "ORDEM DE SERVIÇO", número `OS-xxxx` (destaque), data e badge de status colorido.
   Régua azul separando.
2. **Linha de contato da oficina** — endereço · telefone · WhatsApp · Instagram (fina, cinza).
3. **Dois cards** lado a lado — **Cliente** (nome, cpf, telefone) e **Veículo** (modelo · placa, ano/cor/combustível, km).
4. **Defeito relatado** — bloco de texto.
5. **Tabela de itens** — cabeçalho azul suave; colunas Tipo · Descrição · Qtd · Valor; zebra sutil.
   Rodapé com **TOTAL** em caixa azul destacada. Reusa `brl()` para moeda.
6. **Observações** — bloco de texto.
7. **Assinaturas** — duas linhas: `Cliente` e `Responsável técnico` (nome do mecânico da OS).
8. **Rodapé** — "Documento gerado em dd/mm/aaaa hh:mm" + contato/site + numeração de página se >1.

### Cores/estilo do documento
- Papel: branco `#ffffff`
- Tinta principal: `#1a2230` (grafite) · secundária/labels: `#6b7280`
- Acento: `#2563eb` (faixas, cabeçalho de tabela, caixa do total, régua)
- Badge de status: mapa de cor por status (Entregue/Finalizada = verde; Em execução = azul; etc.)

### Status badge — mapa de cores (PDF)
| Status | Fundo | Texto |
|---|---|---|
| Aberta | `#eef2ff` | `#3730a3` |
| Aguardando aprovação | `#fef3c7` | `#92400e` |
| Em execução | `#dbeafe` | `#1e40af` |
| Finalizada | `#dcfce7` | `#166534` |
| Entregue | `#dcfce7` | `#166534` |

## Riscos técnicos conhecidos (validar na implementação)
- **Bundling do `@react-pdf/renderer` no Next 16:** pode exigir `serverExternalPackages`. Verificar guia em `node_modules/next/dist/docs/` antes de escrever o route (regra do AGENTS.md).
- **Compat React 19:** confirmar versão do `@react-pdf/renderer` que suporta React 19 (4.x). Testar `renderToBuffer` de fato produz bytes.
- **Fontes:** `Font.register` precisa dos TTFs acessíveis em runtime — ler via caminho de filesystem (`process.cwd()`), arquivos commitados (incluídos no deploy da Vercel). Evitar `fetch` de URL.
- **Logo:** ler `public/images/logo.png` do filesystem como Buffer/data-URI (não por URL de rede).
- **Data/hora:** gerar no servidor no fuso pt-BR (`America/Sao_Paulo`) para o "gerado em".

## Fora de escopo (YAGNI por agora)
- PDF na visão do mecânico (`/mecanico`) e no app do cliente (`/app`) — o botão só existe no admin.
- Fotos de evidência reais no PDF.
- Envio do PDF por WhatsApp/e-mail.
- Personalização de template / múltiplos modelos.

## Critérios de sucesso
- Clicar em "Gerar PDF" na tela `/oficina/ordens/[id]` baixa `OS-<id>-<cliente>.pdf`.
- O PDF abre em A4, com logo, faixa azul, dados de cliente/veículo, tabela de itens com total, observações e assinaturas — usando as fontes da marca.
- Ordens com e sem vínculo de cliente/veículo geram o PDF sem quebrar (fallbacks).
