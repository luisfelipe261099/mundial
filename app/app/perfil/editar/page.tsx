import { requireClientId } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PerfilForm } from "./perfil-form";

export default async function EditarPerfil() {
  const clientId = await requireClientId();
  const c = await prisma.client.findUnique({ where: { id: clientId } });
  return (
    <PerfilForm
      inicial={{
        nome: c?.name ?? "",
        cpf: c?.cpf ?? "",
        telefone: c?.phone ?? "",
        whatsapp: c?.whatsapp ?? "",
        email: c?.email ?? "",
        cidade: c?.city ?? "",
        endereco: c?.address ?? "",
      }}
    />
  );
}
