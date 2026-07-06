# Integrações externas — Auto Mecânica Mundial

Guia das integrações que dependem de **contas/credenciais suas** (não dá pra
configurar pelo código). Cada seção diz **o que criar**, **qual variável de
ambiente setar** e **onde no código já está o ponto de encaixe**.

> Onde setar variáveis na Vercel: projeto → **Settings → Environment Variables**
> (marque Production + Preview). Depois **redeploy**. Localmente, use o `.env`.

---

## 0. Variáveis de ambiente já usadas

| Variável | Para quê | Onde é lida |
|---|---|---|
| `DATABASE_URL` | Postgres (Retool/Neon) | [prisma.config.ts](../prisma.config.ts), [lib/prisma.ts](../lib/prisma.ts) |
| `SESSION_SECRET` | Assina o cookie de sessão (HMAC) | [lib/auth.ts](../lib/auth.ts) |
| `BLOB_READ_WRITE_TOKEN` | Upload de fotos (Vercel Blob) | [app/api/upload/route.ts](../app/api/upload/route.ts) |

`SESSION_SECRET`: gere um valor forte (`openssl rand -base64 32`) e **use o mesmo**
em todos os ambientes, senão as sessões existentes caem no próximo deploy.

---

## 1. Fotos das OS — Vercel Blob  ✅ código pronto

O mecânico tira/anexa fotos na tela da OS; elas sobem pro Blob e a URL é salva
na OS (`ServiceOrder.photos`). Aparecem pro mecânico e no controle da OS do admin.

**Falta só criar o store e o token:**

1. Vercel → **Storage → Create → Blob**.
2. Conecte ao projeto. A Vercel injeta `BLOB_READ_WRITE_TOKEN` automaticamente
   nos deploys.
3. Para rodar **local**, copie o token (Storage → seu store → `.env.local`) para
   o seu `.env`:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxx
   ```
4. Redeploy. Pronto — o botão **Adicionar** na aba Fotos passa a subir de verdade.

Enquanto não existir o token, o upload falha com uma mensagem amigável (não quebra
a tela). Encaixe no código: [app/api/upload/route.ts](../app/api/upload/route.ts)
(gera o token, só equipe pode subir), o `upload()` em
[mechanic-order.tsx](../app/mecanico/_components/mechanic-order.tsx) e a action
`salvarFotos` em [os-actions.ts](../app/oficina/os-actions.ts).

---

## 2. Pagamentos — PIX / Mercado Pago

Hoje "Entregar OS" só marca `paid` e lança a receita
(`entregarOS` em [os-actions.ts](../app/oficina/os-actions.ts)). Para cobrar de verdade:

**Opção simples (PIX estático):** gere um QR Code PIX fixo da conta da oficina
(no app do banco) e mostre na fatura/PDF. Zero integração, mas sem conciliação
automática.

**Opção completa (Mercado Pago):**
1. Crie conta em [mercadopago.com.br/developers](https://www.mercadopago.com.br/developers) → **Credenciais** → copie o `Access Token`.
2. Env: `MP_ACCESS_TOKEN=...`.
3. `npm i mercadopago`. Crie uma action que gera uma _preference_ (PIX/cartão) a
   partir do total da OS e devolve o link/QR de pagamento.
4. Um **webhook** (`app/api/mercadopago/route.ts`) recebe a confirmação e chama
   `entregarOS(osId, exitKm, true)` para marcar pago + lançar a receita.

Ponto de encaixe: o botão de entrega no
[order-control.tsx](../app/oficina/_components/order-control.tsx) passaria a
oferecer "Cobrar via PIX" antes de fechar.

---

## 3. Notificações no WhatsApp

Hoje as notificações são **in-app** (`notificar()` em
[os-actions.ts](../app/oficina/os-actions.ts) grava em `Notification`, e o cliente
vê no app). Para mandar também no WhatsApp do cliente:

**Opção rápida (link wa.me):** já existe — o admin clica "Avisar no WhatsApp" no
controle da OS. Manual, sem custo.

**Opção automática (WhatsApp Cloud API — Meta):**
1. [developers.facebook.com](https://developers.facebook.com) → app **WhatsApp** →
   pegue `Phone Number ID` e um `Access Token` permanente.
2. Envs: `WHATSAPP_TOKEN=...`, `WHATSAPP_PHONE_ID=...`.
3. Aprove **templates** de mensagem (obrigatório para iniciar conversa).
4. Dentro de `notificar()`, além de gravar no banco, faça um `fetch` para
   `https://graph.facebook.com/v20.0/<PHONE_ID>/messages` com o template.

Alternativa mais fácil de começar: **Twilio WhatsApp** (`TWILIO_*`), com SDK
próprio. Mesmo ponto de encaixe (`notificar()`).

---

## 4. Localização — Google Maps

O endereço fica em [app/_data/business.ts](../app/_data/business.ts)
(`business.address` + os helpers `mapsEmbedUrl` e `mapsLink`). A seção de
localização do site já usa esses helpers pro Maps.

- **Só link/*embed*:** não precisa de chave. Um `<iframe>` do Google Maps ou um
  link `https://maps.google.com/?q=<endereço>` basta.
- **Mapa interativo/rotas:** crie uma API key no
  [Google Cloud Console](https://console.cloud.google.com) (Maps JavaScript API),
  env `NEXT_PUBLIC_MAPS_API_KEY=...`, e **restrinja por domínio**.

---

## Checklist de deploy

- [ ] `DATABASE_URL` (produção) na Vercel
- [ ] `SESSION_SECRET` forte e igual em todos os ambientes
- [ ] `BLOB_READ_WRITE_TOKEN` (após criar o Blob store) — habilita as fotos
- [ ] (opcional) `MP_ACCESS_TOKEN`, `WHATSAPP_*`/`TWILIO_*`, `NEXT_PUBLIC_MAPS_API_KEY`
