"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

function split(full: string) {
  const [brand, ...rest] = full.trim().split(" ");
  return { brand: brand ?? full, model: rest.join(" ") || full };
}

export async function criarOS(input: {
  clienteId: string;
  veiculoId: string;
  data: string;
  km: number;
  defeito: string;
  observacoes: string;
  itens: { tipo: string; descricao: string; qtd: number; valor: number }[];
}): Promise<{ id: string }> {
  await requireAdmin();
  const [cliente, veiculo] = await Promise.all([
    prisma.client.findUnique({ where: { id: input.clienteId } }),
    prisma.vehicle.findUnique({ where: { id: input.veiculoId } }),
  ]);
  const total = input.itens.reduce((s, i) => s + i.valor * i.qtd, 0);
  const id = `OS-${2100 + Math.floor(Math.random() * 8999)}`;
  await prisma.serviceOrder.create({
    data: {
      id,
      clientId: input.clienteId || null,
      vehicleId: input.veiculoId || null,
      clientName: cliente?.name ?? "—",
      vehicleName: veiculo ? `${veiculo.brand} ${veiculo.model}` : "—",
      plate: veiculo?.plate ?? null,
      date: input.data || "Hoje",
      km: input.km || 0,
      defect: input.defeito,
      status: "Aberta",
      total,
      observations: input.observacoes,
      items: {
        create: input.itens.map((i) => ({ type: i.tipo, description: i.descricao, qty: i.qtd, value: i.valor })),
      },
    },
  });
  revalidatePath("/oficina/ordens");
  revalidatePath("/oficina");
  return { id };
}

export async function movimentarEstoque(id: string, delta: number, motivo?: string) {
  const admin = await requireAdmin();
  const p = await prisma.product.findUnique({ where: { id } });
  if (!p) return;
  const novaQtd = Math.max(0, p.qty + delta);
  const efetivo = novaQtd - p.qty; // delta real (respeita o piso 0)
  await prisma.product.update({ where: { id }, data: { qty: novaQtd } });
  if (efetivo !== 0) {
    await prisma.stockMovement.create({
      data: {
        productId: id,
        delta: efetivo,
        reason: motivo?.trim() || (efetivo > 0 ? "Entrada manual" : "Saída manual"),
        actor: admin.name,
      },
    });
  }
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

export async function criarProduto(input: {
  produto: string;
  marca: string;
  codigo: string;
  qtd: number;
  minimo: number;
  preco?: number | null;
}) {
  const admin = await requireAdmin();
  const created = await prisma.product.create({
    data: {
      name: input.produto,
      brand: input.marca || null,
      code: input.codigo,
      qty: input.qtd,
      min: input.minimo,
      price: input.preco ?? null,
    },
  });
  if (input.qtd > 0) {
    await prisma.stockMovement.create({
      data: { productId: created.id, delta: input.qtd, reason: "Estoque inicial", actor: admin.name },
    });
  }
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

// Edita cadastro do produto. Quantidade fica de fora de propósito:
// ela só muda via movimentação, para a trilha de auditoria valer.
export async function editarProduto(
  id: string,
  input: { produto: string; marca: string; codigo: string; minimo: number; preco: number | null }
) {
  await requireAdmin();
  await prisma.product.update({
    where: { id },
    data: {
      name: input.produto,
      brand: input.marca || null,
      code: input.codigo,
      min: input.minimo,
      price: input.preco,
    },
  });
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

// Exclui produto E sua trilha de movimentações (schema é Restrict).
// A UI confirma antes, avisando quantas movimentações vão junto.
export async function excluirProduto(id: string) {
  await requireAdmin();
  await prisma.stockMovement.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/oficina/estoque");
  revalidatePath("/oficina");
}

export async function criarAgendamento(input: {
  cliente: string;
  veiculo: string;
  servico: string;
  data: string;
  hora: string;
  status: string;
}) {
  await requireAdmin();
  await prisma.appointment.create({
    data: {
      clientName: input.cliente.trim() || null,
      vehicleName: input.veiculo.trim() || "—",
      service: input.servico.trim() || "—",
      date: input.data || "Hoje",
      time: input.hora || "—",
      status: input.status || "Confirmado",
    },
  });
  revalidatePath("/oficina/agenda");
  revalidatePath("/oficina");
}

export async function criarLancamento(input: {
  tipo: "receita" | "despesa";
  descricao: string;
  categoria: string;
  valor: number;
}) {
  await requireAdmin();
  await prisma.transaction.create({
    data: { type: input.tipo, description: input.descricao, category: input.categoria, value: input.valor, date: "Hoje" },
  });
  revalidatePath("/oficina/financeiro");
  revalidatePath("/oficina");
}

export async function salvarConfiguracoes(input: {
  shopName: string;
  phone: string;
  whatsapp: string;
  address: string;
  notifOleo: boolean;
  notifRevisao: boolean;
  notifIpva: boolean;
  notifPromo: boolean;
}) {
  await requireAdmin();
  await prisma.settings.upsert({
    where: { id: "default" },
    create: { id: "default", ...input },
    update: input,
  });
  revalidatePath("/oficina/configuracoes");
}

export async function criarCliente(values: Record<string, string>) {
  await requireAdmin();
  const senha = await bcrypt.hash("cliente123", 10);
  await prisma.client.create({
    data: {
      name: values.nome,
      cpf: values.cpf || null,
      phone: values.telefone || null,
      whatsapp: values.whatsapp || null,
      email: values.email || null,
      city: values.cidade || null,
      address: values.endereco || null,
      since: "2026",
      password: senha,
    },
  });
  revalidatePath("/oficina/clientes");
}

export async function criarVeiculo(values: Record<string, string>) {
  await requireAdmin();
  const dono = await prisma.client.findFirst({ where: { name: values.proprietario } });
  if (!dono) return;
  const { brand, model } = split(values.modelo);
  await prisma.vehicle.create({
    data: {
      clientId: dono.id,
      brand,
      model,
      year: Number(values.ano) || new Date().getFullYear(),
      plate: values.placa,
      km: Number(values.km) || 0,
      fuel: values.combustivel || null,
      color: values.cor || null,
    },
  });
  revalidatePath("/oficina/veiculos");
}

// Define/atualiza a data-base de manutenção do veículo (destrava os lembretes).
// Campo vazio não limpa a base existente.
export async function definirBaseManutencao(formData: FormData) {
  await requireAdmin();
  const vehicleId = String(formData.get("vehicleId") ?? "");
  const oleo = String(formData.get("oleo") ?? "");
  const revisao = String(formData.get("revisao") ?? "");
  if (!vehicleId) return;
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: {
      ...(oleo ? { lastOilChangeAt: new Date(oleo) } : {}),
      ...(revisao ? { lastRevisaoAt: new Date(revisao) } : {}),
    },
  });
  revalidatePath(`/oficina/veiculos/${vehicleId}`);
}
