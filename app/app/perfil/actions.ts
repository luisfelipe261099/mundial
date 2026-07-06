"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export async function atualizarPerfil(values: Record<string, string>) {
  const clientId = await requireClientId();
  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: values.nome || undefined,
      cpf: values.cpf || null,
      phone: values.telefone || null,
      whatsapp: values.whatsapp || null,
      email: values.email || null,
      city: values.cidade || null,
      address: values.endereco || null,
    },
  });
  revalidatePath("/app/perfil");
  revalidatePath("/app");
  redirect("/app/perfil");
}
