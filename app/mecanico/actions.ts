"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { salvarObservacoesOS } from "@/app/oficina/os-actions";

async function requireStaff() {
  const s = await getSession();
  if (!s) redirect("/login");
  if (s.kind !== "mecanico" && s.kind !== "admin") redirect("/login");
}

export async function avancarStatus(id: string, novoStatus: string) {
  await requireStaff();
  await prisma.serviceOrder.update({ where: { id }, data: { status: novoStatus } });
  revalidatePath(`/mecanico/${id}`);
  revalidatePath("/mecanico");
  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina");
}

// Mesma implementação do painel: a anotação é a mesma nas duas telas, e
// salvar aqui precisa atualizar a OS no painel da oficina também.
export async function salvarObservacoes(id: string, texto: string) {
  await salvarObservacoesOS(id, texto);
}
