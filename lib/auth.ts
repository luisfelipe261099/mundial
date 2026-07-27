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

// Payload gravado no cookie: a sessão + o instante de expiração. O maxAge do
// cookie sozinho não basta — ele é uma dica ao navegador, e um token copiado
// continuaria válido para sempre se o servidor não checasse o prazo.
interface TokenPayload extends Session {
  exp: number;
}

const DURACAO_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

function sign(data: string): string {
  return crypto.createHmac("sha256", getSecret()).update(data).digest("base64url");
}

// Comparação em tempo constante: um `!==` de string vaza, pelo tempo de
// resposta, quantos bytes iniciais da assinatura o atacante já acertou.
function assinaturaConfere(payload: string, sig: string): boolean {
  const esperada = Buffer.from(sign(payload));
  const recebida = Buffer.from(sig);
  if (esperada.length !== recebida.length) return false;
  return crypto.timingSafeEqual(esperada, recebida);
}

export function encodeSession(session: Session): string {
  const dados: TokenPayload = { ...session, exp: Date.now() + DURACAO_MS };
  const payload = Buffer.from(JSON.stringify(dados)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !assinaturaConfere(payload, sig)) return null;
  try {
    const dados = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as TokenPayload;
    if (!dados || typeof dados.exp !== "number" || dados.exp < Date.now()) return null;
    if (dados.kind !== "admin" && dados.kind !== "mecanico" && dados.kind !== "cliente") return null;
    if (typeof dados.id !== "string" || !dados.id) return null;
    return { kind: dados.kind, id: dados.id, name: String(dados.name ?? "") };
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
    maxAge: DURACAO_MS / 1000, // espelha o `exp` assinado dentro do token
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
