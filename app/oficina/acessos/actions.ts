"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

// Gestão de acessos da EQUIPE (model User: admin | mecanico). Cliente tem seu
// próprio fluxo (auto-cadastro no app). Todas as ações exigem admin.

export type AccessResult = { ok: boolean; error?: string };

const ROLES = ["admin", "mecanico"] as const;
const isRole = (r: string): r is (typeof ROLES)[number] => (ROLES as readonly string[]).includes(r);

export async function createAccess(input: {
  name: string;
  email: string;
  role: string;
  password: string;
}): Promise<AccessResult> {
  await requireAdmin();
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const role = isRole(input.role) ? input.role : "mecanico";
  if (!name) return { ok: false, error: "Informe o nome." };
  if (!email.includes("@")) return { ok: false, error: "E-mail inválido." };
  if (input.password.length < 6) return { ok: false, error: "A senha precisa de ao menos 6 caracteres." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "Já existe um acesso com esse e-mail." };

  const password = await bcrypt.hash(input.password, 10);
  await prisma.user.create({ data: { name, email, role, password } });
  revalidatePath("/oficina/acessos");
  return { ok: true };
}

export async function resetPassword(input: { userId: string; password: string }): Promise<AccessResult> {
  await requireAdmin();
  if (input.password.length < 6) return { ok: false, error: "A senha precisa de ao menos 6 caracteres." };
  const target = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!target) return { ok: false, error: "Acesso não encontrado." };
  const password = await bcrypt.hash(input.password, 10);
  await prisma.user.update({ where: { id: input.userId }, data: { password } });
  revalidatePath("/oficina/acessos");
  return { ok: true };
}

export async function deleteAccess(input: { userId: string }): Promise<AccessResult> {
  const session = await requireAdmin();
  if (input.userId === session.id) return { ok: false, error: "Você não pode excluir o próprio acesso." };
  const target = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!target) return { ok: false, error: "Acesso não encontrado." };
  if (target.role === "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) return { ok: false, error: "Deve existir ao menos um administrador." };
  }
  await prisma.user.delete({ where: { id: input.userId } });
  revalidatePath("/oficina/acessos");
  return { ok: true };
}
