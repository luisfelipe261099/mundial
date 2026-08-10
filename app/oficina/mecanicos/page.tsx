import { requireAdmin } from "@/lib/auth";
import { getMecanicosPainel } from "@/lib/admin-data";
import { PageHeader } from "../_components/ui";
import { MecanicosManager } from "./_components/mecanicos-manager";

export const dynamic = "force-dynamic";

export default async function MecanicosPage() {
  const session = await requireAdmin();
  const { mecanicos, ordensAtivas, semMecanico } = await getMecanicosPainel();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Equipe"
        title="Mecânicos"
        description="Cadastre os mecânicos da oficina, veja a carga de trabalho de cada um e vincule as ordens de serviço. O login criado aqui é o mesmo que ele usa no app do mecânico."
        stats={[
          { label: "mecânicos", value: mecanicos.length.toString() },
          { label: "OS ativas", value: ordensAtivas.length.toString() },
          { label: "sem mecânico", value: semMecanico.toString(), accent: semMecanico > 0 },
        ]}
      />

      <MecanicosManager
        mecanicos={mecanicos}
        ordensAtivas={ordensAtivas}
        currentUserId={session.id}
      />
    </div>
  );
}
