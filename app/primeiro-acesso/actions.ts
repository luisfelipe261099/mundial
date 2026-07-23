"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { normPlate, normPhone, podeAtivar } from "@/lib/identity";

export type AtivarState = { error?: string };

// Ativação de conta de cliente já cadastrado: placa + telefone → define senha.
// Não cria cliente novo (isso é o /cadastro); só ativa quem já existe e não tem senha.
export async function ativarAcesso(_prev: AtivarState, formData: FormData): Promise<AtivarState> {
  const placa = normPlate(String(formData.get("placa") ?? ""));
  const telefone = normPhone(String(formData.get("telefone") ?? ""));
  const senha = String(formData.get("senha") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!placa || !telefone) return { error: "Informe a placa do carro e o telefone." };
  if (senha.length < 6) return { error: "Escolha uma senha de pelo menos 6 caracteres." };

  // placa → veículo (normalizado) → cliente
  const veiculos = await prisma.vehicle.findMany({ select: { plate: true, clientId: true } });
  const match = veiculos.find((v) => normPlate(v.plate) === placa);
  const client = match ? await prisma.client.findUnique({ where: { id: match.clientId } }) : null;

  // Conta já ativada é o único caso que vale mensagem específica (ajuda o cliente
  // a ir pro login). Qualquer outra falha usa mensagem genérica — não revela se a
  // placa existe nem se o telefone confere (evita enumeração de dados).
  if (client?.password) {
    return { error: "Essa conta já tem acesso. Faça login (esqueceu a senha? fale com a oficina)." };
  }
  const veredito = client
    ? podeAtivar(client, telefone)
    : ({ ok: false, reason: "nao_confere" } as const);
  if (!veredito.ok) {
    return { error: "Placa e telefone não conferem. Confira os dados ou procure a oficina." };
  }

  // e-mail opcional: só grava se informado e não estiver em uso por outra conta
  let emailParaGravar: string | undefined;
  if (email) {
    const [outroCliente, outroUser] = await Promise.all([
      prisma.client.findFirst({ where: { email: { equals: email, mode: "insensitive" }, NOT: { id: client!.id } } }),
      prisma.user.findUnique({ where: { email } }),
    ]);
    if (outroCliente || outroUser) return { error: "Esse e-mail já está em uso em outra conta." };
    emailParaGravar = email;
  }

  const hash = await bcrypt.hash(senha, 10);
  await prisma.client.update({
    where: { id: client!.id },
    data: { password: hash, ...(emailParaGravar ? { email: emailParaGravar } : {}) },
  });

  await setSession({ kind: "cliente", id: client!.id, name: client!.name });
  redirect("/app");
}
