# Cuidado proativo do veículo — Design

**Data:** 2026-07-06
**Status:** aprovado (usuário delegou execução: "faça tudo você")

## Objetivo

Tornar a plataforma **premium por retenção**: o sistema cuida do carro do
cliente sozinho — sabe quando troca de óleo, revisão e IPVA/licenciamento estão
chegando, avisa no celular (push nativo), e mostra tudo num prontuário visual.

Reaproveita o que já existe: model `Notification`, os toggles de `Settings`
(`notifOleo/notifRevisao/notifIpva` — hoje só salvam; passam a **ligar** cada
lembrete), `Vehicle.km` e as OS finalizadas.

## Decisões

1. **Gatilho por tempo** (datas), não por km — confiável entre visitas.
2. **Ordem/fases:** Prontuário → Motor → Push (cada fase é publicável sozinha).
3. **Origem da "última" manutenção:** heurística no texto dos itens da OS ao
   finalizar (normalizado, sem acento) **+** base manual editável no veículo.
4. **Intervalos padrão** (constantes, configuráveis depois): óleo 12 meses,
   revisão 12 meses. IPVA/licenciamento pelo mês do final da placa (Detran-PR).
5. **Janela de aviso:** dispara ~15 dias antes do vencimento e enquanto vencido.

## Modelo de dados (aditivo — `db push` seguro)

```prisma
model Reminder {
  id        String   @id @default(cuid())
  vehicleId String
  vehicle   Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  clientId  String?
  type      String   // "oleo" | "revisao" | "ipva"
  dueDate   DateTime
  status    String   @default("pendente") // pendente | avisado | concluido | adiado
  createdAt DateTime @default(now())
  @@unique([vehicleId, type, dueDate]) // dedup: 1 lembrete por ciclo
  @@map("reminders")
}

model PushSubscription {
  id        String   @id @default(cuid())
  clientId  String
  client    Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)
  endpoint  String   @unique
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  @@map("push_subscriptions")
}

// Vehicle ganha:
lastOilChangeAt DateTime?
lastRevisaoAt   DateTime?
```

Por que um `Reminder` dedicado (e não só `Notification`): dedup limpo via
`@@unique`, visão de "próximas manutenções" no prontuário/admin, e espaço pra
*adiar/concluir*. `Notification` continua sendo a mensagem entregue.

## Núcleo compartilhado — `lib/maintenance.ts`

Função pura usada pelo prontuário (display) **e** pelo motor (cron):

```
type Status = "em_dia" | "proximo" | "vencido";
computeMaintenance(vehicle, settings, now) -> {
  oleo?:    { dueDate, status },
  revisao?: { dueDate, status },
  ipva:     { dueDate, status },
}
```

- óleo/revisão: `due = lastXAt + intervalo`; sem `lastXAt` → omitido (precisa base).
- ipva: `ipvaMonthPR(plate)` (final da placa → mês no calendário Detran-PR do ano);
  `due` = dia 1 desse mês no ano corrente.
- status: `vencido` (due < now) · `proximo` (due ≤ now+15d) · `em_dia`.
- cada tipo respeita o toggle correspondente em `Settings`.

## Fase 1 — Prontuário (sem dependência externa)

- `getProntuario(vehicleId)` (admin-data) e versão escopada por cliente
  (client-data): devolve veículo, `computeMaintenance(...)` e a timeline das OS
  finalizadas (data, km, itens, total), mais recente primeiro.
- UI cliente: incrementa [/app/veiculos/[id]](app/app/veiculos/[id]/page.tsx)
  com cabeçalho "Próximas manutenções" (chips óleo/revisão/IPVA com status) +
  timeline vertical das OS.
- UI admin: mesmo bloco em [/oficina/veiculos/[id]](app/oficina/veiculos/[id]/page.tsx).

## Fase 2 — Motor de lembretes (cron diário → notificação in-app)

- Schema: `Reminder` + campos no `Vehicle`. Form de veículo (admin) ganha os 2
  campos de base (última troca de óleo / revisão).
- Hook no `mudarStatus` (Finalizada): itens que casam "oleo"/"revisao" (texto
  normalizado) atualizam `vehicle.lastXAt = data da OS`.
- `runReminders(now)` (lib): p/ cada veículo com cliente, `computeMaintenance`;
  p/ cada tipo com status `proximo|vencido` sem `Reminder(vehicle,type,due)`,
  cria `Reminder` + `Notification` (via `notificar`).
- Rota `GET /api/cron/reminders`: valida `Authorization: Bearer CRON_SECRET`,
  chama `runReminders`, devolve resumo.
- `vercel.json`: cron diário (`0 12 * * *` ≈ 9h BRT) → `/api/cron/reminders`.
- Painel admin "Próximos lembretes" (opcional, se sobrar): lista `Reminder` pendentes.

## Fase 3 — Web Push (entrega premium)

- Schema: `PushSubscription`. Lib `web-push` + chaves VAPID.
- `public/sw.js`: eventos `push` (mostra notificação) e `notificationclick` (abre a URL).
- Cliente: registra o SW e assina (`pushManager.subscribe` com a VAPID pública);
  action `salvarPushSubscription`. Amarrado no card "Instalar na tela inicial" do perfil.
- `enviarPush(clientId, payload)` (lib, `web-push`): dispara pras inscrições do
  cliente; remove as que retornam 404/410. Chamado de dentro de `notificar`.
- **Limitação iOS:** push só com o PWA instalado na tela inicial (iOS 16.4+).
  Android funciona direto.

## Envs (dependem do usuário, na Vercel)

- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY` (geradas via CLI).
- `CRON_SECRET` (segredo forte; a Vercel manda no header do cron).

Só a Fase 3 depende das VAPID; Fase 1 e 2 não bloqueiam.

## Fora de escopo (fast-follow)

Gatilho por km estimado; IPVA com calendário de outros estados; lembrete via
WhatsApp (o motor já nasce agnóstico — `notificar` é o ponto de plug).
