# Primeiro acesso do cliente — design

**Data:** 2026-07-23 · **Status:** aprovado pelo usuário

## Problema

Os 124 clientes importados (lotes de 22–23/07) existem no banco **sem e-mail e
sem senha** — aparecem no painel do admin, mas não conseguem entrar no app do
cliente. E a tela pública `/cadastro` cria um cliente **novo** por e-mail: se um
cliente já importado se registrar sozinho, vira **duplicata** sem o histórico.

## Objetivo

Deixar o cliente já cadastrado **ativar a própria conta** por **placa + telefone**,
definindo uma senha — sem duplicar cadastro. Cobrir também quem não tem telefone
no cadastro (via admin) e transformar o `/cadastro` em porta só para walk-in novo.

## Decisões (confirmadas com o usuário)

- Autoatendimento: **placa + telefone → define senha** (mín. 6). **E-mail opcional.**
- Quem não tem telefone/telefone errado: **o admin gera acesso no painel** (fallback).
- `/cadastro` não pode mais criar duplicata.

## Arquitetura (3 caminhos, responsabilidades separadas)

### 1. Autoatendimento — `/primeiro-acesso` (público, `noindex`)

Página nova + form (placa, telefone, senha, e-mail opcional), no visual do
`/login` e `/cadastro`. Server action `ativarAcesso`:

1. `normPlate(placa)` → `prisma.vehicle.findMany({ select: { plate, clientId } })`
   → casa a placa normalizada (mesma abordagem do `login`) → pega o cliente.
2. Decisão em **função pura testável** `podeAtivar(client, telefoneDigitos)`:
   - cliente inexistente → falha;
   - `client.password` **já preenchida** → falha "conta já ativada";
   - `normPhone(client.phone)` (ou `whatsapp`) **≠** telefone informado → falha;
   - senão → ok.
3. Se ok: `bcrypt.hash(senha)`, grava `password` (e `email` se informado e livre),
   `setSession({ kind: "cliente", ... })`, `redirect("/app")`.

`/login` ganha o link *"Já é cliente e é a primeira vez? Ativar acesso"* → `/primeiro-acesso`.

### 2. Fallback do admin — detalhe do cliente (`/oficina/clientes/[id]`)

Ação `gerarAcessoCliente(clientId)` (só admin): gera **senha temporária forte**
(`gerarSenhaTemporaria`, blocos legíveis), grava o hash e **devolve o texto plano
uma única vez** para o admin repassar. Cliente entra com **placa + senha temporária**.

- Se o cliente **já tem** senha, o botão é **"Redefinir acesso"** (mesma ação) —
  serve de **recuperação de senha** manual ("cliente liga → admin redefine").
- Aviso na UI se o cliente **não tem veículo** (sem placa não loga; admin completa
  o cadastro antes). Não bloqueia, só sinaliza.

### 3. Anti-duplicação no `/cadastro`

Antes de criar, `ativarAcesso`-guard: se a **placa** normalizada já existe **ou** o
**telefone** (dígitos) já é de algum cliente → **bloqueia** com
*"Você já é nosso cliente. Use o Primeiro acesso"* + link. Mantém o check de e-mail
duplicado que já existe. Assim `/cadastro` fica só para quem é realmente novo.

## Estrutura de arquivos

- **`lib/identity.ts`** (novo): `normPlate(s)`, `normPhone(s)` (só dígitos),
  `gerarSenhaTemporaria()`, e `podeAtivar(client, telDigitos)` (pura). O
  `app/login/actions.ts` passa a **importar `normPlate` daqui** (hoje é privado e
  duplicado) — reduz divergência.
- **`app/primeiro-acesso/`**: `page.tsx` (server, noindex, redireciona se já logado),
  `primeiro-acesso-form.tsx` (client, `useActionState`), `actions.ts` (`ativarAcesso`).
- **`app/login/page.tsx`**: + link para `/primeiro-acesso`.
- **`app/cadastro/actions.ts`**: + guarda anti-duplicação (placa/telefone).
- **Painel**: `app/oficina/clientes/[id]/page.tsx` (UI do botão + senha exibida uma
  vez) e a ação `gerarAcessoCliente` (arquivo de actions do cliente no admin —
  confirmar no código: `app/oficina/actions.ts`).

## Tratamento de erros (mensagens genéricas — é auth)

- Placa/telefone não conferem → **uma** mensagem genérica (evita enumeração de dados).
- Conta já ativada → "Essa conta já tem acesso. Faça login (esqueceu a senha? fale
  com a oficina)."
- E-mail informado já usado por outra conta (client **ou** user) → "E-mail já em uso."
- Senha < 6 → "Escolha uma senha de pelo menos 6 caracteres."

## Segurança

- Só ativa conta com `password` nula → **não sequestra** conta já ativa.
- Verificação exige **placa + telefone que confere** → só quem conhece os dois ativa.
- Admin (fallback/reset) é `requireAdmin`.
- **Revisão de segurança antes do merge** (enumeração, hijack, timing) — é o único
  código novo que cria credencial de cliente.

## Fora de escopo

Recuperação de senha por e-mail/SMS/WhatsApp (o reset do admin cobre por ora);
troca de senha pelo próprio cliente logado; verificação por OTP; captcha/rate-limit
(anotado como melhoria geral, não específico deste fluxo).

## Verificação

- Puro: `normPlate`, `normPhone`, `podeAtivar` via `tsx` + `node:assert`.
- Fluxo real (banco é **produção**): criar um **cliente TESTE** (placa/telefone
  conhecidos, senha nula) por script, exercitar ativar + reset do admin + guarda do
  cadastro, e **apagar o TESTE ao final**. Nunca ativar a conta de um cliente real
  durante o teste. `npm run build` + `lint` limpos.
