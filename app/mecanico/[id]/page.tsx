import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getOrdemControle, getEstoque } from "@/lib/admin-data";
import { MechanicOrder } from "../_components/mechanic-order";

export default async function MecanicoOrdem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireStaff();
  const { id } = await params;
  const [os, estoque] = await Promise.all([getOrdemControle(id), getEstoque()]);
  if (!os) notFound();
  // A listagem já mostra só as OS do mecânico; isto fecha o acesso por URL.
  if (session.kind === "mecanico" && os.mechanicId !== session.id) notFound();

  return <MechanicOrder os={os} estoque={estoque} />;
}
