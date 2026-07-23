import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const JANELA_MS = 10 * 60 * 1000; // 10 minutos
const MAX_FALHAS = 10; // generoso: um cliente errando não chega perto

// IP do cliente atrás do proxy da Vercel. Null quando não dá para determinar
// (nesse caso o rate limit é pulado — melhor liberar do que bloquear em massa).
export async function ipDaRequisicao(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
}

// Fail-open em tudo: qualquer erro de infra devolve "não excedeu" / no-op, para
// nunca trancar um cliente legítimo por causa de uma falha do banco.
export async function excedeuTentativas(ip: string | null, kind: string): Promise<boolean> {
  if (!ip) return false;
  try {
    const desde = new Date(Date.now() - JANELA_MS);
    const n = await prisma.authAttempt.count({ where: { ip, kind, createdAt: { gte: desde } } });
    return n >= MAX_FALHAS;
  } catch {
    return false;
  }
}

export async function registrarFalha(ip: string | null, kind: string): Promise<void> {
  if (!ip) return;
  try {
    await prisma.authAttempt.create({ data: { ip, kind } });
  } catch {
    /* fail-open: não atrapalha o fluxo se o registro falhar */
  }
}
