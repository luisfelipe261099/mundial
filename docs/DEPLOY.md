# Checklist de produção — Auto Mecânica Mundial

## 1. Variáveis de ambiente na Vercel (Settings → Environment Variables, escopo Production)

| Variável | Obrigatória | O que acontece se faltar |
|---|---|---|
| `DATABASE_URL` | **Sim** | O app não sobe (falha explícita no boot). Use o endpoint **pooled** (host com `-pooler`). |
| `SESSION_SECRET` | **Sim** | Login e toda página autenticada retornam erro 500. Gere com `openssl rand -base64 48`. |
| `CRON_SECRET` | **Sim** | A rota do cron responde 401 para sempre e **os lembretes de manutenção nunca rodam**, sem nenhum aviso. |
| `NEXT_PUBLIC_SITE_URL` | Sim, se o domínio não for `automecanicamundial.com.br` | `robots.txt`, `sitemap.xml`, canonical, OG e JSON-LD apontam para o domínio errado. É lida no build — trocar exige redeploy. |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Recomendada | Push desligado silenciosamente. Precisa existir **no build** (vai para o bundle do cliente). |
| `VAPID_PRIVATE_KEY` | Recomendada | Push desligado silenciosamente. |
| `BLOB_READ_WRITE_TOKEN` | Recomendada | Upload de fotos da OS falha. Na Vercel é injetada ao conectar um Blob store ao projeto. |

**`SEED_CONFIRM` não pode existir na Vercel.** Com o valor `yes-apagar-tudo` ela arma o script que **apaga o banco inteiro** (`prisma/seed.ts`).

## 2. Antes de apertar o botão

- [ ] Confirmar que o `DATABASE_URL` da Vercel aponta para o banco de produção (hoje o `.env` local usa o **mesmo** banco — ver risco 3 abaixo).
- [ ] Conferir o horário de funcionamento em `app/_data/business.ts` (linhas 30–35, marcado com ⚠️). Ele é publicado no site, no painel e no `schema.org` que o Google lê.
- [ ] Conferir `foundedYearsApprox` (linha 10, marcado com ⚠️) e as avaliações `rating: 4.7 / reviewCount: 74` (linhas 8–9), que vão para o `aggregateRating` do Google.
- [ ] Conferir os depoimentos em `app/(site)/_components/reviews.tsx` — estão rotulados como "Avaliação real · Google" e devem ser citações verdadeiras.
- [ ] Conferir as marcas citadas em `app/(site)/_components/services.tsx` (Scanner LAUNCH, óleo MOTUL, Tecnomotor).
- [ ] Trocar a senha do admin `victorhugo@mundial.com.br` se ela já circulou por WhatsApp/e-mail.

## 3. Riscos conhecidos que ficam para depois do lançamento

1. **Primeiro acesso por placa + telefone.** Hoje **115 dos 124 clientes** ainda não têm senha e podem ser ativados por quem souber a placa (visível no carro) e o telefone do dono. Há limite por IP e por placa, mas não há prova de posse (SMS/WhatsApp). Se o dado do cliente for sensível, o caminho é a oficina gerar o acesso em `/oficina/acessos` e entregar a senha pessoalmente.
2. **Sessão não é revogável.** Trocar a senha ou excluir um usuário não derruba a sessão dele; o acesso cai sozinho em até 7 dias. Para revogar na hora hoje só trocando o `SESSION_SECRET` (o que desloga todo mundo).
3. **Dev e produção usam o mesmo banco.** Qualquer `npm run dev`, `db:push` ou Prisma Studio local mexe em dados reais de cliente. O ideal é um banco separado para desenvolvimento.
4. **Fotos da OS são públicas.** Vão para o Vercel Blob com `access: "public"` — quem tiver a URL vê a foto, sem login. As fotos de vistoria registram placa, avarias e objetos deixados no carro.
5. **Schema sem migrations.** O banco é gerenciado por `db push`, então não há histórico nem rollback de schema.
6. **Cliente não troca a própria senha.** Senha temporária gerada pelo admin vira senha definitiva. A troca precisa passar pela oficina.

## 4. Depois do deploy

- [ ] Acessar `/login` e entrar com o admin.
- [ ] Confirmar que o painel mostra `R$ 0,00` e o texto "Nenhuma receita lançada ainda" — se aparecer um gráfico com valores, algo está errado.
- [ ] Rodar o cron manualmente uma vez:
      `curl -H "Authorization: Bearer $CRON_SECRET" https://SEU-DOMINIO/api/cron/reminders`
      Resposta esperada: `{"ok":true,...}`. Um 401 significa `CRON_SECRET` diferente do configurado.
- [ ] Dar entrada em um veículo de teste, gerar orçamento, aprovar pelo app do cliente e entregar — confirmando estoque e financeiro.
- [ ] Conferir `https://SEU-DOMINIO/robots.txt` (as áreas logadas devem estar em `Disallow`).
