import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "node:crypto";

const COOKIE = "mundial_session";

// Lazy: só falha quando alguém realmente assina/decodifica uma sessão (em
// runtime), nunca no import do módulo — evita quebrar o build da Vercel se a
// env não estiver disponível na fase de build.
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET não definida — obrigatória em produção (configure na Vercel).");
  }
  return "dev-secret-troque-isto";
}

export type SessionKind = "admin" | "mecanico" | "cliente";

export interface Session {
  kind: SessionKind;
  id: string;
  name: string;
}

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

export function encodeSession(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || sign(payload) !== sig) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Session;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE)?.value);
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, encodeSession(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export function homeFor(kind: SessionKind): string {
  if (kind === "admin") return "/oficina";
  if (kind === "mecanico") return "/mecanico";
  return "/app";
}

export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// Garante sessão de cliente e devolve o id do cliente (para escopar queries).
export async function requireClientId(): Promise<string> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.kind !== "cliente") redirect(homeFor(session.kind));
  return session.id;
}

export async function requireAdmin(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.kind !== "admin") redirect(homeFor(session.kind));
  return session;
}

// admin OU mecânico (equipe da oficina)
export async function requireStaff(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.kind !== "admin" && session.kind !== "mecanico") redirect(homeFor(session.kind));
  return session;
}
