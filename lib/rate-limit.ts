import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

const JANELA_MS = 10 * 60 * 1000; // 10 minutos
const MAX_FALHAS = 10; // generoso: um cliente errando não chega perto

// Limite por alvo (placa), independente do IP. O limite por IP sozinho não
// protege uma conta específica: quem roda por várias saídas de rede continua
// tentando telefones contra a mesma placa. A janela aqui é mais longa porque
// o dono legítimo do carro erra poucas vezes.
const JANELA_ALVO_MS = 60 * 60 * 1000; // 1 hora
const MAX_FALHAS_ALVO = 8;

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

// Contadores por alvo. Reaproveitam a tabela AuthAttempt gravando o alvo no
// campo `ip` com um prefixo — assim não precisa de migração de schema.
function chaveAlvo(alvo: string): string {
  return `alvo:${alvo}`;
}

export async function excedeuTentativasAlvo(alvo: string, kind: string): Promise<boolean> {
  if (!alvo) return false;
  try {
    const desde = new Date(Date.now() - JANELA_ALVO_MS);
    const n = await prisma.authAttempt.count({
      where: { ip: chaveAlvo(alvo), kind, createdAt: { gte: desde } },
    });
    return n >= MAX_FALHAS_ALVO;
  } catch {
    return false;
  }
}

export async function registrarFalhaAlvo(alvo: string, kind: string): Promise<void> {
  if (!alvo) return;
  try {
    await prisma.authAttempt.create({ data: { ip: chaveAlvo(alvo), kind } });
  } catch {
    /* fail-open */
  }
}

// Registros fora da janela não servem para mais nada e a tabela é gravável por
// qualquer visitante — sem limpeza ela cresce para sempre. Chamada pelo cron.
export async function limparTentativasAntigas(): Promise<number> {
  try {
    const { count } = await prisma.authAttempt.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - JANELA_ALVO_MS) } },
    });
    return count;
  } catch {
    return 0;
  }
}
