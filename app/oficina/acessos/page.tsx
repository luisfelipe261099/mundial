import { requireAdmin } from "@/lib/auth";
import { getUsers } from "@/lib/admin-data";
import { AccessManager } from "./_components/access-manager";
import { PageHeader } from "../_components/ui";

export const dynamic = "force-dynamic";

export default async function AcessosPage() {
  const session = await requireAdmin();
  const users = await getUsers();
  const admins = users.filter((u) => u.role === "admin").length;
  const mecanicos = users.filter((u) => u.role === "mecanico").length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Segurança"
        title="Acessos da equipe"
        description="Crie logins para administradores e mecânicos, redefina senhas e remova acessos. Clientes têm cadastro próprio pelo aplicativo."
        stats={[
          { label: "administradores", value: admins.toString() },
          { label: "mecânicos", value: mecanicos.toString() },
        ]}
      />

      <AccessManager users={users} currentUserId={session.id} />
    </div>
  );
}
