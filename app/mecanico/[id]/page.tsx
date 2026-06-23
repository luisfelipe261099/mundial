import { notFound } from "next/navigation";
import { getOrdem } from "../../oficina/_data/mock";
import { MechanicOrder } from "../_components/mechanic-order";

export default async function MecanicoOrdem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const os = getOrdem(id);
  if (!os) notFound();

  return <MechanicOrder os={os} />;
}
