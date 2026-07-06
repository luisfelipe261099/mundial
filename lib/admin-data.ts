import { prisma } from "@/lib/prisma";
import type {
  Cliente,
  VeiculoAdmin,
  OrdemServicoAdmin,
  Produto,
  Agendamento,
} from "@/app/oficina/_data/mock";

// Trend de 6 meses é ilustrativo (o banco não guarda histórico mensal).
export const faturamentoMensal = [
  { mes: "Jan", valor: 52300 },
  { mes: "Fev", valor: 47800 },
  { mes: "Mar", valor: 61200 },
  { mes: "Abr", valor: 58900 },
  { mes: "Mai", valor: 69400 },
  { mes: "Jun", valor: 78450 },
];

type ClientRow = { id: string; name: string; phone: string | null; cpf: string | null; whatsapp: string | null; email: string | null; city: string | null; address: string | null; since: string | null };

function mapVeiculo(v: { id: string; brand: string; model: string; year: number; plate: string; km: number; nextRevisionDate: string | null; revisionOverdue: boolean; client?: { name: string } | null }): VeiculoAdmin {
  return {
    id: v.id,
    proprietario: v.client?.name ?? "—",
    modelo: `${v.brand} ${v.model}`,
    placa: v.plate,
    ano: v.year,
    km: v.km,
    proximaRevisao: v.nextRevisionDate ?? "—",
    revisaoVencida: v.revisionOverdue,
  };
}

function mapOrdem(o: {
  id: string;
  clientName: string;
  vehicleName: string;
  plate: string | null;
  date: string;
  km: number;
  defect: string | null;
  status: string;
  mechanic: string | null;
  total: number;
  observations: string | null;
  items?: { type: string; description: string; qty: number; value: number }[];
}): OrdemServicoAdmin {
  return {
    id: o.id,
    cliente: o.clientName,
    veiculo: o.vehicleName,
    placa: o.plate ?? "—",
    data: o.date,
    km: o.km,
    defeito: o.defect ?? "—",
    status: o.status as OrdemServicoAdmin["status"],
    mecanico: o.mechanic ?? "—",
    itens: (o.items ?? []).map((i) => ({ tipo: i.type as "Peça" | "Serviço", descricao: i.description, qtd: i.qty, valor: i.value })),
    total: o.total,
    observacoes: o.observations ?? "—",
  };
}

function mapCliente(c: ClientRow, veiculos: number, gastoTotal: number): Cliente {
  return {
    id: c.id,
    nome: c.name,
    cpf: c.cpf ?? "—",
    telefone: c.phone ?? "—",
    whatsapp: c.whatsapp ?? "—",
    email: c.email ?? "—",
    cidade: c.city ?? "—",
    veiculos,
    gastoTotal,
    desde: c.since ?? "—",
  };
}

const ABERTAS = ["Aberta", "Aguardando aprovação", "Em execução"];
const CONCLUIDAS = ["Finalizada", "Entregue"];

export async function getKpis() {
  const [clientes, veiculos, osAbertas, osConcluidasMes, receita, faturamentoAnoAgg] = await Promise.all([
    prisma.client.count(),
    prisma.vehicle.count(),
    prisma.serviceOrder.count({ where: { status: { in: ABERTAS } } }),
    prisma.serviceOrder.count({ where: { status: { in: CONCLUIDAS } } }),
    prisma.transaction.aggregate({ where: { type: "receita" }, _sum: { value: true } }),
    prisma.serviceOrder.aggregate({ _sum: { total: true }, _count: true }),
  ]);
  const faturamentoAno = faturamentoAnoAgg._sum.total ?? 0;
  const osTotal = faturamentoAnoAgg._count || 1;
  return {
    clientes,
    veiculos,
    osAbertas,
    osConcluidasMes,
    faturamentoMes: receita._sum.value ?? 0,
    faturamentoAno,
    ticketMedio: Math.round(faturamentoAno / osTotal),
  };
}

export async function getClientes(): Promise<Cliente[]> {
  const [clients, gastos] = await Promise.all([
    prisma.client.findMany({ include: { _count: { select: { vehicles: true } } }, orderBy: { name: "asc" } }),
    prisma.serviceOrder.groupBy({ by: ["clientId"], _sum: { total: true } }),
  ]);
  const gastoMap = new Map(gastos.map((g) => [g.clientId, g._sum.total ?? 0]));
  return clients.map((c) => mapCliente(c, c._count.vehicles, gastoMap.get(c.id) ?? 0));
}

export async function getClienteDetalhe(id: string) {
  const c = await prisma.client.findUnique({ where: { id } });
  if (!c) return null;
  const [veiculos, ordens, gasto] = await Promise.all([
    prisma.vehicle.findMany({ where: { clientId: id }, include: { client: true } }),
    prisma.serviceOrder.findMany({ where: { clientId: id }, include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.serviceOrder.aggregate({ where: { clientId: id }, _sum: { total: true } }),
  ]);
  return {
    cliente: mapCliente(c, veiculos.length, gasto._sum.total ?? 0),
    veiculos: veiculos.map(mapVeiculo),
    ordens: ordens.map(mapOrdem),
  };
}

export async function getVeiculos(): Promise<VeiculoAdmin[]> {
  const rows = await prisma.vehicle.findMany({ include: { client: true }, orderBy: { plate: "asc" } });
  return rows.map(mapVeiculo);
}

export async function getVeiculoDetalhe(id: string) {
  const v = await prisma.vehicle.findUnique({ where: { id }, include: { client: true } });
  if (!v) return null;
  const ordens = await prisma.serviceOrder.findMany({ where: { vehicleId: id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  return { veiculo: mapVeiculo(v), ordens: ordens.map(mapOrdem) };
}

export async function getOrdens(): Promise<OrdemServicoAdmin[]> {
  const rows = await prisma.serviceOrder.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return rows.map(mapOrdem);
}

export async function getOrdem(id: string): Promise<OrdemServicoAdmin | null> {
  const o = await prisma.serviceOrder.findUnique({ where: { id }, include: { items: true } });
  return o ? mapOrdem(o) : null;
}

// OS + dados de contato do cliente e detalhes do veículo, para o PDF "completo".
// Faz fallback aos campos denormalizados quando a OS não tem vínculo (client/vehicle nulos).
export type OrdemPdf = OrdemServicoAdmin & {
  clienteInfo: { cpf: string; telefone: string; cidade: string };
  veiculoInfo: { ano: string; cor: string; combustivel: string };
};

export async function getOrdemParaPdf(id: string): Promise<OrdemPdf | null> {
  const o = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { items: true, client: true, vehicle: true },
  });
  if (!o) return null;
  return {
    ...mapOrdem(o),
    clienteInfo: {
      cpf: o.client?.cpf ?? "—",
      telefone: o.client?.phone ?? o.client?.whatsapp ?? "—",
      cidade: o.client?.city ?? "—",
    },
    veiculoInfo: {
      ano: o.vehicle?.year ? String(o.vehicle.year) : "—",
      cor: o.vehicle?.color ?? "—",
      combustivel: o.vehicle?.fuel ?? "—",
    },
  };
}

// OS completa para o "centro de controle" (vistoria + itens com id + status do orçamento).
export async function getOrdemControle(id: string) {
  const o = await prisma.serviceOrder.findUnique({ where: { id }, include: { items: true } });
  if (!o) return null;
  const budget = await prisma.budget.findFirst({
    where: { serviceOrderId: id },
    select: { status: true },
  });
  const inspection = (o.inspection ?? null) as {
    checklist?: { item: string; status: string }[];
    avarias?: string;
    objetos?: string;
  } | null;
  return {
    id: o.id,
    cliente: o.clientName,
    veiculo: o.vehicleName,
    placa: o.plate ?? "—",
    data: o.date,
    km: o.km,
    exitKm: o.exitKm,
    fuelLevel: o.fuelLevel,
    defeito: o.defect ?? "—",
    status: o.status,
    mecanico: o.mechanic ?? "—",
    total: o.total,
    observacoes: o.observations ?? "",
    authorized: o.authorized,
    paid: o.paid,
    deliveredAt: o.deliveredAt,
    inspection,
    mechanicId: o.mechanicId,
    techChecklist: (o.techChecklist ?? null) as { item: string; status: string }[] | null,
    itens: o.items.map((i) => ({
      id: i.id,
      tipo: i.type,
      descricao: i.description,
      qtd: i.qty,
      valor: i.value,
      productId: i.productId,
    })),
    budgetStatus: budget?.status ?? null,
  };
}

export type OsControle = NonNullable<Awaited<ReturnType<typeof getOrdemControle>>>;

export async function getMecanicos() {
  return prisma.user.findMany({
    where: { role: "mecanico" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getOrdensMecanico(mechanicId: string): Promise<OrdemServicoAdmin[]> {
  const rows = await prisma.serviceOrder.findMany({
    where: { mechanicId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrdem);
}

export async function getAgendaHoje(): Promise<Agendamento[]> {
  const rows = await prisma.appointment.findMany({ where: { date: "Hoje" }, include: { client: true }, orderBy: { time: "asc" } });
  return rows.map((a) => ({
    hora: a.time,
    cliente: a.client?.name ?? "—",
    veiculo: a.vehicleName,
    servico: a.service,
    status: a.status === "Confirmado" ? "Confirmado" : "Aguardando",
  }));
}

export async function getEstoque(): Promise<Produto[]> {
  const rows = await prisma.product.findMany({ orderBy: { name: "asc" } });
  return rows.map((p) => ({ id: p.id, produto: p.name, marca: p.brand ?? "—", codigo: p.code, qtd: p.qty, minimo: p.min }));
}

export async function getFinanceiroResumo() {
  const [receitas, despesas] = await Promise.all([
    prisma.transaction.groupBy({ by: ["category"], where: { type: "receita" }, _sum: { value: true } }),
    prisma.transaction.groupBy({ by: ["category"], where: { type: "despesa" }, _sum: { value: true } }),
  ]);
  return {
    receitas: receitas.map((r) => ({ fonte: r.category ?? "Outros", valor: r._sum.value ?? 0 })),
    despesas: despesas.map((d) => ({ fonte: d.category ?? "Outros", valor: d._sum.value ?? 0 })),
  };
}

export async function getLancamentos() {
  const rows = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((t) => ({
    id: t.id,
    tipo: t.type as "receita" | "despesa",
    descricao: t.description,
    categoria: t.category ?? "Outros",
    valor: t.value,
    data: t.date ?? "Hoje",
  }));
}

export async function getRelatorios() {
  const [servicos, gastos, vencidas] = await Promise.all([
    prisma.serviceOrderItem.groupBy({
      by: ["description"],
      where: { type: "Serviço" },
      _count: { description: true },
      _sum: { value: true },
      orderBy: { _count: { description: "desc" } },
      take: 5,
    }),
    prisma.serviceOrder.groupBy({ by: ["clientId", "clientName"], _count: true, _sum: { total: true }, orderBy: { _sum: { total: "desc" } }, take: 4 }),
    prisma.vehicle.findMany({ where: { revisionOverdue: true }, include: { client: true } }),
  ]);
  return {
    servicosMaisVendidos: servicos.map((s) => ({ servico: s.description, qtd: s._count.description, receita: s._sum.value ?? 0 })),
    clientesMaisAtivos: gastos.map((g) => ({ nome: g.clientName, os: g._count, gasto: g._sum.total ?? 0 })),
    revisoesPendentes: vencidas.map((v) => ({
      modelo: `${v.brand} ${v.model}`,
      placa: v.plate,
      proprietario: v.client?.name ?? "—",
      quando: `Revisão vencida · ${v.nextRevisionDate ?? ""}`,
    })),
  };
}

export async function getClientesVeiculosParaOS() {
  const [clientes, veiculos] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.vehicle.findMany({ include: { client: true }, orderBy: { plate: "asc" } }),
  ]);
  return {
    clientes: clientes.map((c) => ({ id: c.id, nome: c.name })),
    veiculos: veiculos.map((v) => ({ id: v.id, proprietario: v.client?.name ?? "—", modelo: `${v.brand} ${v.model}`, placa: v.plate })),
  };
}
