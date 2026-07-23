"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession, clearSession, homeFor, type Session } from "@/lib/auth";
import { normPlate } from "@/lib/identity";

// Hash bcrypt "morto" (senha aleatória, sem correspondência real). Usado para
// sempre pagar o custo de um bcrypt.compare, mesmo quando não existe conta —
// sem isso, o tempo de resposta vaza se o e-mail/placa existe no banco.
const DUMMY_HASH = "$2b$10$vtkSj.xOPwB41GFKtZN2uup4PtkGB4jgX5pzR9BsUzDI6GGJiSa7G";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Preencha e-mail/placa e senha." };

  let session: Session | null = null;

  if (identifier.includes("@")) {
    // e-mail → primeiro usuário (admin/mecânico), depois cliente
    const email = identifier.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (await bcrypt.compare(password, user?.password ?? DUMMY_HASH)) {
      if (user?.password) {
        session = { kind: user.role === "mecanico" ? "mecanico" : "admin", id: user.id, name: user.name };
      }
    }
    if (!session) {
      const client = await prisma.client.findFirst({
        where: { email: { equals: identifier, mode: "insensitive" } },
      });
      if (await bcrypt.compare(password, client?.password ?? DUMMY_HASH)) {
        if (client?.password) {
          session = { kind: "cliente", id: client.id, name: client.name };
        }
      }
    }
  } else {
    // placa → veículo (normalizado) → cliente
    const vehicles = await prisma.vehicle.findMany({ select: { plate: true, clientId: true } });
    const match = vehicles.find((v) => normPlate(v.plate) === normPlate(identifier));
    const client = match ? await prisma.client.findUnique({ where: { id: match.clientId } }) : null;
    if (await bcrypt.compare(password, client?.password ?? DUMMY_HASH)) {
      if (client?.password) {
        session = { kind: "cliente", id: client.id, name: client.name };
      }
    }
  }

  if (!session) return { error: "E-mail/placa ou senha inválidos." };

  await setSession(session);
  redirect(homeFor(session.kind));
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/login");
}
