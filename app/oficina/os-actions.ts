"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";
import { requireAdmin, requireStaff } from "@/lib/auth";

// Data e hora no fuso da oficina — o servidor da Vercel roda em UTC, então sem
// o timeZone a data virava "amanhã" a partir das 21h de Curitiba.
function hoje() {
  return new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function agora() {
  return new Date().toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
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
      entryTime: agora(),
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
  const ultimo = await prisma.serviceOrderItem.aggregate({
    where: { serviceOrderId: osId },
    _max: { position: true },
  });
  await prisma.serviceOrderItem.create({
    data: {
      serviceOrderId: osId,
      type: item.tipo,
      description: item.descricao,
      qty: item.qtd,
      value: item.valor,
      productId: item.productId || null,
      position: (ultimo._max.position ?? 0) + 1,
    },
  });
  await recomputeTotal(osId);
  revalidatePath(`/oficina/ordens/${osId}`);
}

// Sobe/desce um item na lista do orçamento — a ordem daqui é a que sai no PDF.
// Antes de trocar, renumera a sequência inteira (1..n), o que corrige qualquer
// posição duplicada ou zerada herdada de versões antigas.
export async function moverItemOS(
  itemId: string,
  osId: string,
  direcao: "cima" | "baixo"
): Promise<{ error?: string }> {
  await requireStaff();
  const itens = await prisma.serviceOrderItem.findMany({
    where: { serviceOrderId: osId },
    orderBy: [{ position: "asc" }, { id: "asc" }],
    select: { id: true },
  });
  const i = itens.findIndex((x) => x.id === itemId);
  if (i < 0) return { error: "Item não encontrado nesta OS." };
  const j = direcao === "cima" ? i - 1 : i + 1;
  if (j < 0 || j >= itens.length) return {};

  const ordem = itens.map((x) => x.id);
  [ordem[i], ordem[j]] = [ordem[j], ordem[i]];
  await prisma.$transaction(
    ordem.map((id, idx) =>
      prisma.serviceOrderItem.update({ where: { id }, data: { position: idx + 1 } })
    )
  );
  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath(`/mecanico/${osId}`);
  return {};
}

// Edita a ficha da OS: cliente, veículo, entrada, km, combustível, defeito e
// observações. Trocar cliente/veículo regrava também os campos denormalizados
// (nome e placa), que são o que aparece na lista e no PDF.
export async function editarOS(
  osId: string,
  input: {
    clienteId: string;
    veiculoId: string;
    data: string;
    horaEntrada: string;
    dataSaida: string;
    horaSaida: string;
    km: string;
    fuelLevel: string;
    defeito: string;
    observacoes: string;
  }
): Promise<{ error?: string }> {
  await requireAdmin();
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, select: { id: true } });
  if (!os) return { error: "OS não encontrada." };

  const [cliente, veiculo] = await Promise.all([
    input.clienteId ? prisma.client.findUnique({ where: { id: input.clienteId } }) : null,
    input.veiculoId ? prisma.vehicle.findUnique({ where: { id: input.veiculoId } }) : null,
  ]);
  if (input.clienteId && !cliente) return { error: "Cliente não encontrado." };
  if (input.veiculoId && !veiculo) return { error: "Veículo não encontrado." };

  await prisma.serviceOrder.update({
    where: { id: osId },
    data: {
      clientId: cliente?.id ?? null,
      vehicleId: veiculo?.id ?? null,
      clientName: cliente?.name ?? "—",
      vehicleName: veiculo ? `${veiculo.brand} ${veiculo.model}` : "—",
      plate: veiculo?.plate ?? null,
      date: input.data.trim() || hoje(),
      entryTime: input.horaEntrada.trim() || null,
      deliveredAt: input.dataSaida.trim() || null,
      exitTime: input.horaSaida.trim() || null,
      km: Math.max(0, Math.trunc(Number(input.km)) || 0),
      fuelLevel: input.fuelLevel || null,
      defect: input.defeito.trim() || null,
      observations: input.observacoes.trim() || null,
    },
  });

  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
  revalidatePath(`/mecanico/${osId}`);
  revalidatePath("/oficina");
  return {};
}

// Exclui a OS e o que só existe por causa dela: os itens e a receita lançada
// na entrega (que não tem como apagar pela tela do Financeiro, então ficaria
// órfã). A baixa de estoque NÃO volta — as peças saíram de verdade; se foi
// engano, dê entrada manual no estoque.
export async function excluirOS(osId: string): Promise<{ error?: string }> {
  await requireAdmin();
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, select: { id: true } });
  if (!os) return { error: "OS não encontrada." };

  await prisma.$transaction([
    prisma.transaction.deleteMany({ where: { serviceOrderId: osId } }),
    prisma.serviceOrderItem.deleteMany({ where: { serviceOrderId: osId } }),
    prisma.serviceOrder.delete({ where: { id: osId } }),
  ]);

  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina/financeiro");
  revalidatePath("/mecanico");
  revalidatePath("/oficina");
  return {};
}

// Corrige um item já lançado (valor errado, descrição, quantidade, tipo) sem
// precisar apagar e lançar de novo. Trocar para "Serviço" solta o vínculo com
// o estoque, que só faz sentido em peça.
export async function editarItemOS(
  itemId: string,
  osId: string,
  item: { tipo: string; descricao: string; qtd: number; valor: number }
): Promise<{ error?: string }> {
  await requireStaff();
  const atual = await prisma.serviceOrderItem.findUnique({ where: { id: itemId } });
  if (!atual || atual.serviceOrderId !== osId) return { error: "Item não encontrado nesta OS." };

  const descricao = item.descricao.trim();
  if (!descricao) return { error: "Informe a descrição do item." };
  const qtd = Math.max(1, Math.trunc(item.qtd) || 1);
  const valor = Math.max(0, Math.trunc(item.valor) || 0);

  await prisma.serviceOrderItem.update({
    where: { id: itemId },
    data: {
      type: item.tipo,
      description: descricao,
      qty: qtd,
      value: valor,
      ...(item.tipo === "Serviço" ? { productId: null } : {}),
    },
  });
  await recomputeTotal(osId);
  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
  revalidatePath(`/mecanico/${osId}`);
  return {};
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
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } } });
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

    // Base de manutenção: se a OS incluiu óleo/revisão, reinicia o contador do veículo.
    if (os.vehicleId) {
      const norm = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const temOleo = os.items.some((it) => norm(it.description).includes("oleo"));
      const temRevisao = os.items.some((it) => norm(it.description).includes("revisao"));
      if (temOleo || temRevisao) {
        await prisma.vehicle.update({
          where: { id: os.vehicleId },
          data: {
            ...(temOleo ? { lastOilChangeAt: new Date() } : {}),
            ...(temRevisao ? { lastRevisaoAt: new Date() } : {}),
          },
        });
      }
    }
  } else {
    await prisma.serviceOrder.update({
      where: { id: osId },
      data: {
        status: novoStatus,
        // Entrega pelo fluxo de status (sem passar pelo check-out) também
        // registra a saída do veículo — só na primeira vez.
        ...(novoStatus === "Entregue" && !os.deliveredAt
          ? { deliveredAt: hoje(), exitTime: agora() }
          : {}),
      },
    });
  }

  revalidatePath(`/oficina/ordens/${osId}`);
  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

// Gera/atualiza o orçamento do cliente a partir da OS e coloca em "Aguardando aprovação".
export async function enviarParaAprovacao(osId: string) {
  await requireAdmin();
  const os = await prisma.serviceOrder.findUnique({ where: { id: osId }, include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } } });
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
      data: { status: "Entregue", exitKm: exitKm || null, paid: true, deliveredAt: hoje(), exitTime: agora(), financeApplied: true },
    });
  } else {
    await prisma.serviceOrder.update({
      where: { id: osId },
      data: { status: "Entregue", exitKm: exitKm || null, paid, deliveredAt: hoje(), exitTime: agora() },
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
