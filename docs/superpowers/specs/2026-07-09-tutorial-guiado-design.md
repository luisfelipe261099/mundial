# Design — Tutorial Guiado (Admin / Mecânico / Cliente) · Oficina Noturna

**Data:** 2026-07-09
**Sub-projeto:** independente da auditoria de bugs pré-lançamento (feita em paralelo, sem overlap de arquivos)
**Tipo:** Página pública de onboarding, conteúdo real (screenshots do app rodando), sem backend novo.

---

## 1. Contexto

A plataforma "Oficina Noturna" (Auto Mecânica Mundial) tem três áreas logadas —
`/oficina` (admin), `/mecanico`, `/app` (cliente) — todas já com dados reais via
Prisma/Postgres. O cliente pediu um tutorial guiado, o mais completo possível,
para os três perfis aprenderem a usar o sistema, com lançamento em produção
previsto para 2026-07-10.

Já existia um início não commitado (`app/tutorial/tutorial.css`): tema escuro,
marca "Oficina Noturna", com uma transição de passo (`.tut-rise`) já definida —
este design continua nessa linha em vez de propor um formato novo.

### Decisões já tomadas (com o cliente)

| Decisão | Escolha |
|---|---|
| Formato | Página pública **`/tutorial`** (sem login), por abas de papel |
| Profundidade | **Completo**, com screenshots reais do app rodando (não só texto) |
| Dados para screenshot | Banco atual só tem seed fictício (João Mendes, Marina Schmidt etc.) — captura direto, sem preparar dados à parte |
| Conta de mecânico p/ captura | Não existe — será criada uma de teste via `/oficina/acessos` |
| Reforço "guiado na tela" | Além da página `/tutorial`, um **tour de boas-vindas leve** (4-5 passos) no primeiro login de cada papel, apontando pro menu principal, terminando com link pro manual completo — ver seção 8 |

---

## 2. Fora de escopo

- Tour guiado instrumentando as ~24 telas dos 3 papéis (um overlay por
  funcionalidade) — o reforço "guiado na tela" é só o tour de boas-vindas
  leve da seção 8 (4-5 passos, menu principal); o conteúdo completo mora na
  página `/tutorial`.
- Vídeo ou GIF animado — só imagem estática + texto.
- Tradução — só português (mesmo idioma do resto da plataforma).
- Edição/reset de senha de qualquer conta real — a conta de mecânico criada para captura é de teste e será sinalizada para o cliente decidir se apaga.

---

## 3. Arquitetura

- Rota nova: `app/tutorial/page.tsx` (+ `layout.tsx` próprio, sem os guards de sessão dos outros três — é pública). `robots: { index: false }` como as outras áreas internas (não é conteúdo de marketing).
- Reaproveita `app/tutorial/tutorial.css` (já existe, não commitado) — root `.tut-root`, mesmo padrão de isolamento de tema (`html:has(.tut-root)`) usado por `/app`, `/oficina`, `/mecanico`.
- Componente client (`tutorial-view.tsx`) controla aba ativa (`admin | mecanico | cliente`) e passo ativo dentro da aba via `useState`, sem rotas por passo — mais simples de manter e navegar. Aceita `?papel=admin|mecanico|cliente` na URL (lido no Server Component) para abrir direto na aba certa quando linkado a partir de um painel.
- Conteúdo (textos dos passos) mora num arquivo de dados `app/tutorial/_data/conteudo.ts` — array por papel, cada item `{ titulo, texto, imagem }` — separado do componente de apresentação (fácil de editar o texto sem mexer em JSX).
- Screenshots: arquivos estáticos em `public/tutorial/<papel>/<slug>.png`, capturados por mim rodando o app localmente (dev server + devtools do navegador), referenciados via `next/image` local (sem custo de otimização remota).

## 4. Conteúdo (passos por papel)

Agrupado por área funcional (não uma tela picada por passo):

**Admin (oficina)** — visão geral do painel · clientes (listar/cadastrar/ficha) ·
veículos · ordens de serviço (criar → acompanhar → fechar → gerar PDF) ·
entrada de veículo (vistoria) · agenda · estoque · financeiro · relatórios ·
configurações · gestão de acessos da equipe.

**Mecânico** — painel de ordens atribuídas · abrir uma OS, preencher vistoria
técnica/checklist, anexar fotos · finalizar o serviço.

**Cliente (app)** — visão geral · solicitar serviço · agendar · acompanhar
serviço em andamento · histórico (com fotos) · orçamentos · veículos ·
documentos · notificações · perfil.

## 5. Pontos de entrada

- Link "Como usar" no shell de cada painel (`AdminShell`, `MecShell`, `AppShell`) → `/tutorial?papel=<x>`.
- Link discreto na tela `/login` ("Primeira vez? Veja o tutorial") → `/tutorial`.

## 6. Erros/edge cases

- `?papel=` inválido ou ausente → cai na primeira aba (Admin).
- Imagem de um passo ainda não capturada (durante o desenvolvimento) → não deixar passo publicado sem imagem; todo passo do conteúdo final tem `imagem` obrigatória no tipo.

## 7. Teste

- Verificação manual: abrir `/tutorial` deslogado, navegar as 3 abas e todos os passos, conferir que nenhuma imagem quebra e que os links "Como usar" dos três painéis abrem na aba certa.

## 8. Tour de boas-vindas (reforço "guiado na tela")

Componente reutilizável `<WelcomeTour steps={...} storageKey="..." />`, montado
uma vez dentro de cada shell (`AdminShell`, `MecShell`, `AppShell`), só quando
há sessão ativa.

- **Padrão visual:** "spotlight" — overlay semi-transparente cobrindo a tela
  com um recorte (via `getBoundingClientRect` do alvo real) destacando o item
  de menu do passo atual, e um card com o texto do passo + botões
  "Pular"/"Próximo". Sem lib nova — só React + CSS (mede o alvo real com
  `useLayoutEffect`, recalcula em resize).
- **Passos:** 4-5 por papel, cada um apontando para um item de navegação já
  existente no shell daquele papel (os itens mais importantes do menu — a
  lista exata de quais itens fica para o plano de implementação, olhando o
  shell real de cada papel).
- **Último passo:** sempre com um botão "Ver manual completo" → `/tutorial?papel=<x>`.
- **Persistência:** `localStorage` (chave por papel, ex. `tutorial-tour-visto-admin`)
  — decisão deliberada de não criar coluna/tabela nova no banco para isso, é
  só um "já vi isso" de conveniência, não dado de negócio. Se o usuário limpar
  o navegador ou logar de outro aparelho, vê o tour de novo — aceitável para
  um tour de boas-vindas.
- **Disparo:** ao montar o shell, se a chave não existe no `localStorage`,
  mostra o tour; ao fechar (pular ou terminar), grava a chave.
