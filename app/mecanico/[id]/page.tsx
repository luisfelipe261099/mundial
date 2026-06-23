import { notFound } from "next/navigation";
import { getOrdem } from "@/lib/admin-data";
import { MechanicOrder } from "../_components/mechanic-order";

export default async function MecanicoOrdem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const os = await getOrdem(id);
  if (!os) notFound();

  return <MechanicOrder os={os} />;
}
