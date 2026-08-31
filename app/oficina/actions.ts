"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { gerarSenhaTemporaria } from "@/lib/identity";

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
        create: input.itens.map((i, idx) => ({ type: i.tipo, description: i.descricao, qty: i.qtd, value: i.valor, position: idx + 1 })),
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

// Marca o agendamento como concluído/cancelado (ou volta pra confirmado).
// É o que tira o compromisso velho do meio dos próximos sem apagar o registro.
export async function atualizarStatusAgendamento(id: string, status: string) {
  await requireAdmin();
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/oficina/agenda");
  revalidatePath("/oficina");
}

export async function excluirAgendamento(id: string) {
  await requireAdmin();
  await prisma.appointment.delete({ where: { id } });
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

// Cadastra o cliente e, opcionalmente, já o primeiro veículo dele — o admin
// costuma ter os dois em mãos no balcão. O veículo só entra quando modelo e
// placa vieram preenchidos; qualquer outro campo dele é acessório.
export async function criarCliente(values: Record<string, string>): Promise<{ error?: string }> {
  await requireAdmin();

  const modelo = (values.veiculoModelo ?? "").trim();
  const placa = (values.veiculoPlaca ?? "").trim().toUpperCase();
  const querVeiculo = modelo !== "" || placa !== "";
  if (querVeiculo && (modelo === "" || placa === "")) {
    return { error: "Para cadastrar o veículo junto, informe modelo e placa." };
  }
  if (placa) {
    const jaExiste = await prisma.vehicle.findUnique({ where: { plate: placa } });
    if (jaExiste) return { error: `Já existe um veículo com a placa ${placa}.` };
  }

  // Sem senha: o cliente ativa a conta por Primeiro acesso (placa + telefone) ou
  // o admin gera acesso no detalhe do cliente. Nunca uma senha padrão conhecida.
  const cliente = await prisma.client.create({
    data: {
      name: values.nome,
      cpf: values.cpf || null,
      phone: values.telefone || null,
      whatsapp: values.whatsapp || null,
      email: values.email || null,
      city: values.cidade || null,
      address: values.endereco || null,
      since: "2026",
      password: null,
    },
  });

  if (querVeiculo) {
    const { brand, model } = split(modelo);
    await prisma.vehicle.create({
      data: {
        clientId: cliente.id,
        brand,
        model,
        year: Number(values.veiculoAno) || new Date().getFullYear(),
        plate: placa,
        km: Number(values.veiculoKm) || 0,
        engine: values.veiculoMotor?.trim() || null,
        fuel: values.veiculoCombustivel || null,
        color: values.veiculoCor || null,
      },
    });
    revalidatePath("/oficina/veiculos");
  }

  revalidatePath("/oficina/clientes");
  revalidatePath("/oficina");
  return {};
}

// Exclui um cliente com tudo que é exclusivamente dele (veículos, lembretes,
// inscrições de push). O histórico financeiro NÃO some: OS, orçamentos,
// agendamentos, documentos e notificações ficam, só perdem o vínculo — os
// campos denormalizados (nome do cliente, veículo, placa) mantêm a leitura.
export async function excluirCliente(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const cliente = await prisma.client.findUnique({
    where: { id },
    select: { id: true, vehicles: { select: { id: true } } },
  });
  if (!cliente) return { error: "Cliente não encontrado." };
  const veiculoIds = cliente.vehicles.map((v) => v.id);

  await prisma.$transaction([
    prisma.serviceOrder.updateMany({
      where: { OR: [{ clientId: id }, { vehicleId: { in: veiculoIds } }] },
      data: { clientId: null, vehicleId: null },
    }),
    prisma.budget.updateMany({ where: { clientId: id }, data: { clientId: null } }),
    prisma.appointment.updateMany({ where: { clientId: id }, data: { clientId: null } }),
    prisma.document.updateMany({ where: { clientId: id }, data: { clientId: null } }),
    prisma.notification.updateMany({ where: { clientId: id }, data: { clientId: null } }),
    prisma.reminder.deleteMany({ where: { OR: [{ clientId: id }, { vehicleId: { in: veiculoIds } }] } }),
    prisma.pushSubscription.deleteMany({ where: { clientId: id } }),
    prisma.vehicle.deleteMany({ where: { clientId: id } }),
    prisma.client.delete({ where: { id } }),
  ]);

  revalidatePath("/oficina/clientes");
  revalidatePath("/oficina/veiculos");
  revalidatePath("/oficina");
  return {};
}

// Exclui um veículo e seus lembretes. As OS do veículo continuam no histórico,
// só sem o vínculo (o nome e a placa gravados na OS seguem valendo).
export async function excluirVeiculo(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  const veiculo = await prisma.vehicle.findUnique({ where: { id }, select: { clientId: true } });
  if (!veiculo) return { error: "Veículo não encontrado." };

  await prisma.$transaction([
    prisma.serviceOrder.updateMany({ where: { vehicleId: id }, data: { vehicleId: null } }),
    prisma.reminder.deleteMany({ where: { vehicleId: id } }),
    prisma.vehicle.delete({ where: { id } }),
  ]);

  revalidatePath("/oficina/veiculos");
  revalidatePath("/oficina/clientes");
  revalidatePath(`/oficina/clientes/${veiculo.clientId}`);
  revalidatePath("/oficina");
  return {};
}

// Gera (ou redefine) o acesso de um cliente ao app: cria uma senha temporária,
// grava o hash e devolve o texto plano UMA vez para o admin repassar. Serve
// tanto para quem não consegue o autoatendimento quanto como reset de senha.
export async function gerarAcessoCliente(clientId: string): Promise<{ senha?: string; error?: string }> {
  await requireAdmin();
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return { error: "Cliente não encontrado." };
  const senha = gerarSenhaTemporaria();
  const hash = await bcrypt.hash(senha, 10);
  await prisma.client.update({ where: { id: clientId }, data: { password: hash } });
  revalidatePath(`/oficina/clientes/${clientId}`);
  return { senha };
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
      engine: values.motor?.trim() || null,
      fuel: values.combustivel || null,
      color: values.cor || null,
    },
  });
  revalidatePath("/oficina/veiculos");
}

// Edita a ficha do veículo. Placa é única no sistema, então checa antes de
// gravar; o resto é campo livre e pode ser apagado (vira null).
export async function editarVeiculo(
  id: string,
  input: {
    modelo: string;
    placa: string;
    motor: string;
    ano: string;
    km: string;
    cor: string;
    combustivel: string;
    clienteId: string;
  }
): Promise<{ error?: string }> {
  await requireAdmin();
  const veiculo = await prisma.vehicle.findUnique({ where: { id }, select: { clientId: true } });
  if (!veiculo) return { error: "Veículo não encontrado." };

  const modelo = input.modelo.trim();
  const placa = input.placa.trim().toUpperCase();
  if (!modelo) return { error: "Informe a marca e o modelo." };
  if (!placa) return { error: "Informe a placa." };

  const comMesmaPlaca = await prisma.vehicle.findUnique({ where: { plate: placa } });
  if (comMesmaPlaca && comMesmaPlaca.id !== id) {
    return { error: `A placa ${placa} já está em outro veículo.` };
  }

  const dono = input.clienteId
    ? await prisma.client.findUnique({ where: { id: input.clienteId }, select: { id: true } })
    : null;
  if (input.clienteId && !dono) return { error: "Proprietário não encontrado." };

  const { brand, model } = split(modelo);
  await prisma.vehicle.update({
    where: { id },
    data: {
      brand,
      model,
      plate: placa,
      engine: input.motor.trim() || null,
      year: Number(input.ano) || new Date().getFullYear(),
      km: Number(input.km) || 0,
      color: input.cor.trim() || null,
      fuel: input.combustivel || null,
      ...(dono ? { clientId: dono.id } : {}),
    },
  });

  revalidatePath(`/oficina/veiculos/${id}`);
  revalidatePath("/oficina/veiculos");
  revalidatePath("/oficina/clientes");
  revalidatePath(`/oficina/clientes/${veiculo.clientId}`);
  if (dono && dono.id !== veiculo.clientId) revalidatePath(`/oficina/clientes/${dono.id}`);
  return {};
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
