import { requireAdmin } from "@/lib/auth";
import { getUsers } from "@/lib/admin-data";
import { AccessManager } from "./_components/access-manager";

export const dynamic = "force-dynamic";

export default async function AcessosPage() {
  const session = await requireAdmin();
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div>
        <p className="adm-mono text-[0.6rem] adm-brand">Segurança</p>
        <h1 className="adm-display mt-1.5 text-2xl adm-ink">Acessos da equipe</h1>
        <p className="mt-1.5 max-w-prose text-sm adm-muted">
          Crie logins para administradores e mecânicos, redefina senhas e remova
          acessos. Clientes têm cadastro próprio pelo aplicativo.
        </p>
      </div>

      <AccessManager users={users} currentUserId={session.id} />
    </div>
  );
}
