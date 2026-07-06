"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin, requireStaff } from "@/lib/auth";

function hoje() {
  return new Date().toLocaleDateString("pt-BR");
}

// Notificação por evento para o cliente (aparece no app dele).
async function notificar(clientId: string | null, type: string, title: string, text: string) {
  if (!clientId) return;
  await prisma.notification.create({
    data: { clientId, type, title, text, when: "agora", read: false },
  });
  revalidatePath("/app");
  revalidatePath("/app/notificacoes");
}

async function recomputeTotal(osId: string) {
  const items = await prisma.serviceOrderItem.findMany({ where: { serviceOrderId: osId } });
  const total = items.reduce((s, i) => s + i.value * i.qty, 0);
  await prisma.serviceOrder.update({ where: { id: osId }, data: { total } });
}

export interface EntradaInput {
  clienteId: string;
  veiculoId: string;
  km: number;
  fuelLevel: string;
  defeito: string;
  checklist: { item: string; status: string }[];
  avarias: string;
  objetos: string;
  authorized: boolean;
}

// Dar entrada = recepção + vistoria → abre a OS "Aberta" com o estado inicial.
export async function darEntrada(input: EntradaInput): Promise<{ id: string }> {
  await requireAdmin();
  const [cliente, veiculo] = await Promise.all([
    prisma.client.findUnique({ where: { id: input.clienteId } }),
    prisma.vehicle.findUnique({ where: { id: input.veiculoId } }),
  ]);
  const id = `OS-${2100 + Math.floor(Math.random() * 8999)}`;
  await prisma.serviceOrder.create({
    data: {
      id,
      clientId: input.clienteId || null,
      vehicleId: input.veiculoId || null,
      clientName: cliente?.name ?? "—",
      vehicleName: veiculo ? `${veiculo.brand} ${veiculo.model}` : "—",
      plate: veiculo?.plate ?? null,
      date: hoje(),
      km: input.km || 0,
      fuelLevel: input.fuelLevel || null,
      defect: input.defeito,
      status: "Aberta",
      authorized: input.authorized,
      inspection: {
        checklist: input.checklist,
        avarias: input.avarias,
        objetos: input.objetos,
      } as Prisma.InputJsonValue,
      total: 0,
    },
  });
  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina");
  return { id };
}

export async function adicionarItemOS(
  osId: string,
  item: { tipo: string; descricao: string; qtd: number; valor: number; productId?: string }
) {
  await requireStaff();
  await prisma.serviceOrderItem.create({
    data: {
      serviceOrderId: osId,
      type: item.tipo,
      description: item.descricao,
      qty: item.qtd,
      value: item.valor,
      productId: item.productId || null,
    },
  });
  await recomputeTotal(osId);
  revalidatePath(`/oficina/ordens/${osId}`);
}

export async function removerItemOS(itemId: string, osId: string) {
  await requireStaff();
  await prisma.serviceOrderItem.delete({ where: { id: itemId } });
  await recomputeTotal(osId);
  revalidatePath(`/oficina/ordens/${osId}`);
}

// Avançar/voltar status. Ao FINALIZAR, baixa o estoque das peças vinculadas (1x).
export async function mudarStatus(osId: string, novoStatus: string) {
  const staff = await requireStaff();
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, include: { items: true } });
  if (!os) return;

  if (novoStatus === "Finalizada" && !os.stockApplied) {
    for (const it of os.items) {
      if (!it.productId) continue;
      try {
        await prisma.product.update({ where: { id: it.productId }, data: { qty: { decrement: it.qty } } });
        await prisma.stockMovement.create({
          data: { productId: it.productId, delta: -it.qty, reason: "Baixa OS", serviceOrderId: osId, actor: staff.name },
        });
      } catch {}
    }
    await prisma.serviceOrder.update({ where: { id: osId }, data: { status: novoStatus, stockApplied: true } });
    await notificar(os.clientId, "geral", "Seu carro está pronto", "O serviço foi concluído. Aguarde o contato para retirada.");
  } else {
    await prisma.serviceOrder.update({ where: { id: osId }, data: { status: novoStatus } });
  }

  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

// Gera/atualiza o orçamento do cliente a partir da OS e coloca em "Aguardando aprovação".
export async function enviarParaAprovacao(osId: string) {
  await requireAdmin();
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, include: { items: true } });
  if (!os) return;
  const total = os.items.reduce((s, i) => s + i.value * i.qty, 0);
  const itensBudget = os.items.map((i) => ({
    kind: i.type === "Peça" ? "peca" : "servico",
    description: i.description,
    qty: i.qty,
    value: i.value,
  }));

  const existing = await prisma.budget.findFirst({ where: { serviceOrderId: osId } });
  if (existing) {
    await prisma.budgetItem.deleteMany({ where: { budgetId: existing.id } });
    await prisma.budget.update({
      where: { id: existing.id },
      data: { status: "pendente", subtotal: total, total, date: hoje(), items: { create: itensBudget } },
    });
  } else {
    await prisma.budget.create({
      data: {
        id: `ORC-${300 + Math.floor(Math.random() * 699)}`,
        clientId: os.clientId,
        vehicleName: os.vehicleName,
        date: hoje(),
        status: "pendente",
        subtotal: total,
        discount: 0,
        total,
        serviceOrderId: osId,
        items: { create: itensBudget },
      },
    });
  }

  await prisma.serviceOrder.update({ where: { id: osId }, data: { status: "Aguardando aprovação", total } });
  await notificar(os.clientId, "revisao", "Orçamento pronto", `Seu orçamento da ${osId} está pronto. Toque para aprovar ou rejeitar.`);
  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
}

// Entrega (check-out): km de saída + pagamento. Se pago, lança a receita (1x).
export async function entregarOS(osId: string, exitKm: number, paid: boolean) {
  await requireAdmin();
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId } });
  if (!os) return;

  if (paid && !os.financeApplied) {
    await prisma.transaction.create({
      data: {
        type: "receita",
        description: `${os.id} — ${os.vehicleName}`,
        category: "Serviços",
        value: os.total,
        date: hoje(),
        serviceOrderId: os.id,
      },
    });
    await prisma.serviceOrder.update({
      where: { id: osId },
      data: { status: "Entregue", exitKm: exitKm || null, paid: true, deliveredAt: hoje(), financeApplied: true },
    });
  } else {
    await prisma.serviceOrder.update({
      where: { id: osId },
      data: { status: "Entregue", exitKm: exitKm || null, paid, deliveredAt: hoje() },
    });
  }

  await notificar(os.clientId, "geral", "Veículo entregue", "Obrigado pela confiança! Seu veículo foi entregue.");
  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina/financeiro");
  revalidatePath("/oficina");
}

// Atribuir mecânico à OS (só admin).
export async function atribuirMecanico(osId: string, mechanicId: string) {
  await requireAdmin();
  const mec = mechanicId ? await prisma.user.findUnique({ where: { id: mechanicId } }) : null;
  await prisma.serviceOrder.update({
    where: { id: osId },
    data: { mechanicId: mechanicId || null, mechanic: mec?.name ?? null },
  });
  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/mecanico");
}

// Vistoria técnica do mecânico (equipe).
export async function salvarTechChecklist(
  osId: string,
  checklist: { item: string; status: string }[]
) {
  await requireStaff();
  await prisma.serviceOrder.update({
    where: { id: osId },
    data: { techChecklist: checklist as Prisma.InputJsonValue },
  });
  revalidatePath(`/mecanico/${osId}`);
  revalidatePath(`/oficina/ordens/${osId}`);
}

// Fotos da OS (URLs no Vercel Blob), salvas pela equipe.
export async function salvarFotos(osId: string, fotos: string[]) {
  await requireStaff();
  await prisma.serviceOrder.update({
    where: { id: osId },
    data: { photos: fotos as Prisma.InputJsonValue },
  });
  revalidatePath(`/mecanico/${osId}`);
  revalidatePath(`/oficina/ordens/${osId}`);
}
