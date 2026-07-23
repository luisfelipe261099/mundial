"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setSession } from "@/lib/auth";
import { normPlate, normPhone } from "@/lib/identity";

export type CadastroState = { error?: string };

export async function cadastrarCliente(
  _prev: CadastroState,
  formData: FormData
): Promise<CadastroState> {
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const senha = String(formData.get("senha") ?? "");
  const telefone = String(formData.get("telefone") ?? "").trim();
  const placa = String(formData.get("placa") ?? "").trim().toUpperCase();
  const modelo = String(formData.get("modelo") ?? "").trim();

  if (!nome || !email || senha.length < 6) {
    return { error: "Preencha nome, e-mail e uma senha (mín. 6 caracteres)." };
  }
  const existing = await prisma.client.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) return { error: "Já existe uma conta com esse e-mail." };

  // Anti-duplicação: se a placa ou o telefone já pertencem a um cliente, ele já
  // é da base (importado ou cadastrado pelo admin) → deve usar o Primeiro acesso.
  const placaNorm = placa ? normPlate(placa) : "";
  const foneNorm = telefone ? normPhone(telefone) : "";
  if (placaNorm || foneNorm) {
    const [veiculos, clientesComFone] = await Promise.all([
      placaNorm ? prisma.vehicle.findMany({ select: { plate: true } }) : Promise.resolve([]),
      foneNorm
        ? prisma.client.findMany({ select: { phone: true, whatsapp: true } })
        : Promise.resolve([]),
    ]);
    const placaExiste = veiculos.some((v) => normPlate(v.plate) === placaNorm);
    const foneExiste = clientesComFone.some(
      (c) => (c.phone && normPhone(c.phone) === foneNorm) || (c.whatsapp && normPhone(c.whatsapp) === foneNorm)
    );
    if (placaExiste || foneExiste) {
      return { error: "Você já é nosso cliente. Use o Primeiro acesso para ativar sua conta (link na tela de login)." };
    }
  }

  const hash = await bcrypt.hash(senha, 10);
  let clientId = "";
  let clientName = "";
  try {
    const client = await prisma.client.create({
      data: {
        name: nome,
        email,
        phone: telefone || null,
        whatsapp: telefone || null,
        city: "Curitiba/PR",
        since: String(new Date().getFullYear()),
        password: hash,
        vehicles:
          placa && modelo
            ? {
                create: [
                  {
                    brand: modelo.split(" ")[0] || modelo,
                    model: modelo.split(" ").slice(1).join(" ") || modelo,
                    year: new Date().getFullYear(),
                    plate: placa,
                    km: 0,
                    fuel: "Flex",
                  },
                ],
              }
            : undefined,
      },
    });
    clientId = client.id;
    clientName = client.name;
  } catch {
    return { error: "Não foi possível cadastrar (a placa já pode estar em uso). Tente sem o veículo." };
  }

  await setSession({ kind: "cliente", id: clientId, name: clientName });
  redirect("/app");
}
