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

export async function movimentarEstoque(id: string, delta: number) {
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
        reason: efetivo > 0 ? "Entrada manual" : "Saída manual",
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
}) {
  const admin = await requireAdmin();
  const created = await prisma.product.create({
    data: { name: input.produto, brand: input.marca, code: input.codigo, qty: input.qtd, min: input.minimo },
  });
  if (input.qtd > 0) {
    await prisma.stockMovement.create({
      data: { productId: created.id, delta: input.qtd, reason: "Estoque inicial", actor: admin.name },
    });
  }
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
