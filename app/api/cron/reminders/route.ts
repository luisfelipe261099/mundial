import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { runReminders } from "@/lib/reminders";
import { limparTentativasAntigas } from "@/lib/rate-limit";

// A rota pode rodar por vários segundos (varre a frota inteira); sem isso ela
// morre no timeout padrão e os lembretes do dia somem sem aviso.
export const maxDuration = 300;
export const dynamic = "force-dynamic";

function confere(recebido: string | null, esperado: string): boolean {
  if (!recebido) return false;
  const a = Buffer.from(recebido);
  const b = Buffer.from(`Bearer ${esperado}`);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Cron diário (Vercel) — gera os lembretes de manutenção do dia.
// Protegido por CRON_SECRET (a Vercel manda no header Authorization).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || !confere(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const result = await runReminders();
  const limpos = await limparTentativasAntigas();
  return NextResponse.json({ ok: true, ...result, tentativasLimpas: limpos });
}
