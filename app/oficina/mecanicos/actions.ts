"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import type { AccessResult } from "../acessos/actions";

// Painel de mecânicos: cadastro da equipe (model User, role=mecanico) e
// vínculo dos mecânicos com as OS.
//
// Só o nome é obrigatório. Mecânico de bancada, que não usa o app, entra só
// com o nome — serve para aparecer nas OS. E-mail e senha podem ser
// preenchidos depois, quando ele for de fato usar o login.

function refresh() {
  revalidatePath("/oficina/mecanicos");
  revalidatePath("/oficina/acessos");
}

// Normaliza e valida o e-mail. `null` = sem e-mail (permitido).
async function checarEmail(email: string, ignorarUserId?: string): Promise<
  { ok: true; email: string | null } | { ok: false; error: string }
> {
  const limpo = email.trim().toLowerCase();
  if (!limpo) return { ok: true, email: null };
  if (!limpo.includes("@")) return { ok: false, error: "E-mail inválido." };
  const existente = await prisma.user.findUnique({ where: { email: limpo } });
  if (existente && existente.id !== ignorarUserId) {
    return { ok: false, error: "Já existe um acesso com esse e-mail." };
  }
  return { ok: true, email: limpo };
}

export async function criarMecanico(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AccessResult> {
  await requireAdmin();
  const name = input.name.trim();
  if (!name) return { ok: false, error: "Informe o nome do mecânico." };

  const email = await checarEmail(input.email);
  if (!email.ok) return { ok: false, error: email.error };

  const senha = input.password.trim();
  if (senha && senha.length < 6) return { ok: false, error: "A senha precisa de ao menos 6 caracteres." };
  if (senha && !email.email) return { ok: false, error: "Para definir senha, informe também o e-mail — ele é o login." };

  await prisma.user.create({
    data: {
      name,
      email: email.email,
      role: "mecanico",
      password: senha ? await bcrypt.hash(senha, 10) : null,
    },
  });
  refresh();
  return { ok: true };
}

// Define ou atualiza o acesso do mecânico: e-mail (login) e/ou senha. Campo
// de senha vazio mantém a senha atual; e-mail vazio tira o login dele.
export async function definirAcessoMecanico(input: {
  userId: string;
  email: string;
  password: string;
}): Promise<AccessResult> {
  await requireAdmin();
  const target = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!target) return { ok: false, error: "Mecânico não encontrado." };

  const email = await checarEmail(input.email, input.userId);
  if (!email.ok) return { ok: false, error: email.error };

  const senha = input.password.trim();
  if (senha && senha.length < 6) return { ok: false, error: "A senha precisa de ao menos 6 caracteres." };
  if (!email.email && (senha || target.password)) {
    return { ok: false, error: "Sem e-mail ele não tem como entrar — apague a senha junto ou informe o e-mail." };
  }

  await prisma.user.update({
    where: { id: input.userId },
    data: {
      email: email.email,
      ...(senha ? { password: await bcrypt.hash(senha, 10) } : {}),
    },
  });
  refresh();
  return { ok: true };
}

// Remove o acesso do mecânico. As OS dele continuam no histórico com o nome
// já gravado — só o vínculo (mechanicId) sai, senão sobraria um id órfão.
export async function excluirMecanico(input: { userId: string }): Promise<AccessResult> {
  const session = await requireAdmin();
  if (input.userId === session.id) return { ok: false, error: "Você não pode excluir o próprio acesso." };
  const target = await prisma.user.findUnique({ where: { id: input.userId } });
  if (!target) return { ok: false, error: "Mecânico não encontrado." };
  if (target.role !== "mecanico") {
    return { ok: false, error: "Esse acesso não é de mecânico — use a tela de Acessos." };
  }

  await prisma.serviceOrder.updateMany({ where: { mechanicId: input.userId }, data: { mechanicId: null } });
  await prisma.user.delete({ where: { id: input.userId } });

  refresh();
  revalidatePath("/oficina/ordens");
  revalidatePath("/mecanico");
  return { ok: true };
}

// Vincula (ou desvincula, com mechanicId vazio) uma OS a um mecânico.
export async function vincularOS(osId: string, mechanicId: string): Promise<AccessResult> {
  await requireAdmin();
  const mec = mechanicId ? await prisma.user.findUnique({ where: { id: mechanicId } }) : null;
  if (mechanicId && (!mec || mec.role !== "mecanico")) return { ok: false, error: "Mecânico não encontrado." };
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, select: { id: true } });
  if (!os) return { ok: false, error: "OS não encontrada." };

  await prisma.serviceOrder.update({
    where: { id: osId },
    data: { mechanicId: mechanicId || null, mechanic: mec?.name ?? null },
  });

  refresh();
  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
  revalidatePath("/mecanico");
  return { ok: true };
}
