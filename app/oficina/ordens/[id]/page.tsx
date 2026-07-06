import { notFound } from "next/navigation";
import { getOrdemControle, getEstoque, getMecanicos } from "@/lib/admin-data";
import { OrderControl } from "../../_components/order-control";

export default async function OrdemDetalhe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [os, estoque, mecanicos] = await Promise.all([
    getOrdemControle(id),
    getEstoque(),
    getMecanicos(),
  ]);
  if (!os) notFound();

  return <OrderControl os={os} estoque={estoque} mecanicos={mecanicos} />;
}
