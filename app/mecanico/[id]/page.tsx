import { notFound } from "next/navigation";
import { getOrdemControle, getEstoque } from "@/lib/admin-data";
import { MechanicOrder } from "../_components/mechanic-order";

export default async function MecanicoOrdem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [os, estoque] = await Promise.all([getOrdemControle(id), getEstoque()]);
  if (!os) notFound();

  return <MechanicOrder os={os} estoque={estoque} />;
}
