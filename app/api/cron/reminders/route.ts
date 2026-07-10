import { NextResponse } from "next/server";
import { runReminders } from "@/lib/reminders";

// Cron diário (Vercel) — gera os lembretes de manutenção do dia.
// Protegido por CRON_SECRET (a Vercel manda no header Authorization).
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }
  const result = await runReminders();
  return NextResponse.json({ ok: true, ...result });
}
