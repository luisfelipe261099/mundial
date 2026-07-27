"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireClientId } from "@/lib/auth";

export type PerfilState = { error?: string };

export async function atualizarPerfil(values: Record<string, string>): Promise<PerfilState> {
  const clientId = await requireClientId();

  const email = (values.email ?? "").trim().toLowerCase();
  if (email) {
    // Client.email não tem unique no schema e o login por e-mail usa findFirst.
    // Sem esta checagem, um cliente podia assumir o e-mail de outro e derrubar
    // o login dele.
    const emUso = await prisma.client.findFirst({
      where: { email: { equals: email, mode: "insensitive" }, id: { not: clientId } },
      select: { id: true },
    });
    if (emUso) return { error: "Esse e-mail já está em uso por outra conta." };
  }

  await prisma.client.update({
    where: { id: clientId },
    data: {
      name: values.nome || undefined,
      cpf: values.cpf || null,
      // Telefone e WhatsApp são a prova de identidade do fluxo de primeiro
      // acesso, então continuam sob controle da oficina, não do cliente.
      email: email || null,
      city: values.cidade || null,
      address: values.endereco || null,
    },
  });
  revalidatePath("/app/perfil");
  revalidatePath("/app");
  redirect("/app/perfil");
}
