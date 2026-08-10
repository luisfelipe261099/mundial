"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { createAccess, resetPassword, type AccessResult } from "../acessos/actions";

// Painel de mecânicos: cadastro da equipe (model User, role=mecanico) e
// vínculo dos mecânicos com as OS. O cadastro reaproveita as regras de
// Acessos — aqui a função já entra travada em "mecanico".

function refresh() {
  revalidatePath("/oficina/mecanicos");
  revalidatePath("/oficina/acessos");
}

export async function criarMecanico(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AccessResult> {
  const r = await createAccess({ ...input, role: "mecanico" });
  if (r.ok) refresh();
  return r;
}

export async function redefinirSenhaMecanico(input: {
  userId: string;
  password: string;
}): Promise<AccessResult> {
  const r = await resetPassword(input);
  if (r.ok) refresh();
  return r;
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
