import { prisma } from "@/lib/prisma";
import type {
  Cliente,
  VeiculoAdmin,
  OrdemServicoAdmin,
  Produto,
  Agendamento,
} from "@/app/oficina/_data/mock";
import { computeMaintenance, maintList } from "@/lib/maintenance";
import { normalizarStatus, type StatusAgendamento } from "@/lib/agendamentos";
import { requireAdmin, requireStaff, requireSession } from "@/lib/auth";
import { hojeISO } from "@/lib/datas";

const MES_CURTO = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Primeiro instante do mês, no fuso da oficina (o servidor da Vercel roda UTC).
function inicioDoMes(offsetMeses = 0, now = new Date()): Date {
  const saoPaulo = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  return new Date(Date.UTC(saoPaulo.getFullYear(), saoPaulo.getMonth() + offsetMeses, 1, 3, 0, 0));
}

// Série real dos últimos 6 meses, a partir de Transaction.createdAt (timestamp
// de verdade — o campo `date` é texto livre e não serve para agrupar).
export async function getFaturamentoMensal(): Promise<{ mes: string; valor: number }[]> {
  await requireAdmin();
  const desde = inicioDoMes(-5);
  const rows = await prisma.transaction.findMany({
    where: { type: "receita", createdAt: { gte: desde } },
    select: { value: true, createdAt: true },
  });

  const baldes = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = inicioDoMes(-i);
    baldes.set(`${d.getUTCFullYear()}-${d.getUTCMonth()}`, 0);
  }
  for (const t of rows) {
    const d = new Date(t.createdAt.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
    const chave = `${d.getFullYear()}-${d.getMonth()}`;
    if (baldes.has(chave)) baldes.set(chave, (baldes.get(chave) ?? 0) + t.value);
  }
  return [...baldes.entries()].map(([chave, valor]) => ({
    mes: MES_CURTO[Number(chave.split("-")[1])],
    valor,
  }));
}

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
    marca: v.brand,
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

function mapCliente(c: ClientRow, veiculos: number, gastoTotal: number, placas: string[] = []): Cliente {
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
    placas,
  };
}

const ABERTAS = ["Aberta", "Aguardando aprovação", "Em execução"];
const CONCLUIDAS = ["Finalizada", "Entregue"];

// A coluna Vehicle.revisionOverdue nunca é escrita por nenhuma ação — só o seed
// a preenchia. O número honesto vem do motor de manutenção.
async function contarRevisoesVencidas(): Promise<number> {
  const [veiculos, s] = await Promise.all([
    prisma.vehicle.findMany({
      select: { plate: true, lastOilChangeAt: true, lastRevisaoAt: true },
    }),
    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);
  const toggles = {
    notifOleo: s?.notifOleo ?? true,
    notifRevisao: s?.notifRevisao ?? true,
    notifIpva: s?.notifIpva ?? true,
  };
  const agora = new Date();
  return veiculos.filter((v) => {
    const m = computeMaintenance(v, toggles, agora);
    return m.oleo?.status === "vencido" || m.revisao?.status === "vencido";
  }).length;
}

export async function getKpis() {
  await requireAdmin();
  const [clientes, veiculos, osAbertas, osConcluidasMes, osAguardando, revisoesVencidas, receita, faturamentoAnoAgg] =
    await Promise.all([
      prisma.client.count(),
      prisma.vehicle.count(),
      prisma.serviceOrder.count({ where: { status: { in: ABERTAS } } }),
      prisma.serviceOrder.count({ where: { status: { in: CONCLUIDAS } } }),
      prisma.serviceOrder.count({ where: { status: "Aguardando aprovação" } }),
      contarRevisoesVencidas(),
      prisma.transaction.aggregate({
        where: { type: "receita", createdAt: { gte: inicioDoMes(0) } },
        _sum: { value: true },
      }),
      prisma.serviceOrder.aggregate({ _sum: { total: true }, _count: true }),
    ]);
  const faturamentoAno = faturamentoAnoAgg._sum.total ?? 0;
  const osTotal = faturamentoAnoAgg._count || 1;
  return {
    clientes,
    veiculos,
    osAbertas,
    osConcluidasMes,
    osAguardando,
    revisoesVencidas,
    osTotal: faturamentoAnoAgg._count,
    faturamentoMes: receita._sum.value ?? 0,
    faturamentoAno,
    ticketMedio: Math.round(faturamentoAno / osTotal),
  };
}

export async function getClientes(): Promise<Cliente[]> {
  await requireAdmin();
  const [clients, gastos] = await Promise.all([
    prisma.client.findMany({
      include: { vehicles: { select: { plate: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.serviceOrder.groupBy({ by: ["clientId"], _sum: { total: true } }),
  ]);
  const gastoMap = new Map(gastos.map((g) => [g.clientId, g._sum.total ?? 0]));
  return clients.map((c) =>
    mapCliente(c, c.vehicles.length, gastoMap.get(c.id) ?? 0, c.vehicles.map((v) => v.plate))
  );
}

export async function getClienteDetalhe(id: string) {
  await requireAdmin();
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
    temAcesso: !!c.password,
  };
}

export async function getVeiculos(): Promise<VeiculoAdmin[]> {
  await requireAdmin();
  const rows = await prisma.vehicle.findMany({ include: { client: true }, orderBy: { plate: "asc" } });
  return rows.map(mapVeiculo);
}

export async function getVeiculoDetalhe(id: string) {
  await requireAdmin();
  const v = await prisma.vehicle.findUnique({ where: { id }, include: { client: true } });
  if (!v) return null;
  const ordens = await prisma.serviceOrder.findMany({ where: { vehicleId: id }, include: { items: true }, orderBy: { createdAt: "desc" } });
  const s = await prisma.settings.findUnique({ where: { id: "default" } });
  const manutencoes = maintList(
    computeMaintenance(
      { plate: v.plate, lastOilChangeAt: v.lastOilChangeAt, lastRevisaoAt: v.lastRevisaoAt },
      { notifOleo: s?.notifOleo ?? true, notifRevisao: s?.notifRevisao ?? true, notifIpva: s?.notifIpva ?? true },
      new Date()
    )
  );
  const base = {
    oleo: v.lastOilChangeAt ? v.lastOilChangeAt.toISOString().slice(0, 10) : "",
    revisao: v.lastRevisaoAt ? v.lastRevisaoAt.toISOString().slice(0, 10) : "",
  };
  return { veiculo: mapVeiculo(v), ordens: ordens.map(mapOrdem), manutencoes, base };
}

export async function getOrdens(): Promise<OrdemServicoAdmin[]> {
  await requireStaff();
  const rows = await prisma.serviceOrder.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });
  return rows.map(mapOrdem);
}

export async function getOrdem(id: string): Promise<OrdemServicoAdmin | null> {
  await requireAdmin();
  const o = await prisma.serviceOrder.findUnique({ where: { id }, include: { items: true } });
  return o ? mapOrdem(o) : null;
}

// OS + dados de contato do cliente e detalhes do veículo, para o PDF "completo".
// Faz fallback aos campos denormalizados quando a OS não tem vínculo (client/vehicle nulos).
export type OrdemPdf = OrdemServicoAdmin & {
  clienteInfo: { cpf: string; telefone: string; cidade: string };
  veiculoInfo: { ano: string; cor: string; combustivel: string };
};

// Única leitura aberta ao cliente: a rota do PDF confere a posse da OS antes
// de chamar (equipe baixa qualquer uma, cliente só as próprias).
export async function getOrdemParaPdf(id: string): Promise<OrdemPdf | null> {
  await requireSession();
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
// wa.me exige só dígitos com DDI. Números salvos como "(41) 99770-4359"
// viravam um link sem destinatário, que abria o seletor de contatos.
function normWhats(v: string | null | undefined): string | null {
  if (!v) return null;
  const d = v.replace(/\D/g, "");
  if (d.length < 10) return null;
  return d.startsWith("55") ? d : `55${d}`;
}

export async function getOrdemControle(id: string) {
  await requireStaff();
  const o = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { items: true, client: { select: { whatsapp: true, phone: true } } },
  });
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
    // Só dígitos com DDI, no formato que o wa.me espera.
    clienteWhats: normWhats(o.client?.whatsapp ?? o.client?.phone),
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
    fotos: (o.photos ?? []) as string[],
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
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: "mecanico" },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getOrdensMecanico(mechanicId: string): Promise<OrdemServicoAdmin[]> {
  await requireStaff();
  const rows = await prisma.serviceOrder.findMany({
    where: { mechanicId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrdem);
}

export async function getAgendaHoje(): Promise<Agendamento[]> {
  await requireAdmin();
  // Data real de hoje em ISO. Antes comparava com o literal "Hoje", então
  // nenhum agendamento feito pelo cliente (que grava ISO) aparecia aqui.
  const rows = await prisma.appointment.findMany({
    where: { date: hojeISO() },
    include: { client: true },
    orderBy: { time: "asc" },
  });
  return rows.map((a) => ({
    hora: a.time,
    cliente: a.clientName ?? a.client?.name ?? "—",
    veiculo: a.vehicleName,
    servico: a.service,
    status: normalizarStatus(a.status),
  }));
}

export async function getEstoque(): Promise<Produto[]> {
  await requireStaff();
  const rows = await prisma.product.findMany({
    include: { _count: { select: { movements: true } } },
    orderBy: { name: "asc" },
  });
  return rows.map((p) => ({
    id: p.id,
    produto: p.name,
    marca: p.brand ?? "—",
    codigo: p.code,
    qtd: p.qty,
    minimo: p.min,
    preco: p.price,
    movs: p._count.movements,
  }));
}

export type Movimentacao = {
  id: string;
  produto: string;
  delta: number;
  motivo: string;
  osId: string | null;
  autor: string | null;
  quando: string;
};

// Trilha de auditoria do estoque (entradas/saídas), mais recentes primeiro.
export async function getMovimentacoes(): Promise<Movimentacao[]> {
  await requireAdmin();
  const rows = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { product: true },
  });
  return rows.map((m) => ({
    id: m.id,
    produto: m.product?.name ?? "—",
    delta: m.delta,
    motivo: m.reason,
    osId: m.serviceOrderId,
    autor: m.actor,
    quando: m.createdAt.toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));
}

export type AgendaItem = {
  id: string;
  data: string;
  hora: string;
  clienteId: string | null;
  cliente: string;
  veiculoId: string | null;
  veiculo: string;
  placa: string | null;
  servico: string;
  status: StatusAgendamento;
};

export async function getAgendaAdmin(): Promise<AgendaItem[]> {
  await requireAdmin();
  const rows = await prisma.appointment.findMany({
    include: { client: true, vehicle: true },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });
  return rows.map((a) => ({
    id: a.id,
    data: a.date,
    hora: a.time,
    clienteId: a.clientId,
    // clientName só é preenchido para cliente avulso; com vínculo, o nome vem
    // da relação e acompanha renomeações.
    cliente: a.clientName ?? a.client?.name ?? "—",
    veiculoId: a.vehicleId,
    veiculo: a.vehicle ? `${a.vehicle.brand} ${a.vehicle.model}` : a.vehicleName,
    placa: a.vehicle?.plate ?? null,
    servico: a.service,
    status: normalizarStatus(a.status),
  }));
}

export async function getFinanceiroResumo() {
  await requireAdmin();
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
  await requireAdmin();
  const rows = await prisma.transaction.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map((t) => ({
    id: t.id,
    tipo: t.type as "receita" | "despesa",
    descricao: t.description,
    categoria: t.category ?? "Outros",
    valor: t.value,
    data: t.date ?? "Hoje",
    iso: t.createdAt.toISOString(), // p/ filtro por período no cliente
  }));
}

export async function getSettings() {
  await requireAdmin();
  return prisma.settings.findUnique({ where: { id: "default" } });
}

// Equipe real: usuários cadastrados (admin/mecânico).
export async function getEquipe() {
  await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return users.map((u) => ({
    nome: u.name,
    papel: u.role === "mecanico" ? "Mecânico" : u.role === "cliente" ? "Cliente" : "Administrador",
  }));
}

export async function getRelatorios() {
  await requireAdmin();
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
  await requireAdmin();
  const [clientes, veiculos] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.vehicle.findMany({ include: { client: true }, orderBy: { plate: "asc" } }),
  ]);
  return {
    clientes: clientes.map((c) => ({ id: c.id, nome: c.name })),
    veiculos: veiculos.map((v) => ({
      id: v.id,
      clienteId: v.clientId,
      proprietario: v.client?.name ?? "—",
      modelo: `${v.brand} ${v.model}`,
      placa: v.plate,
    })),
  };
}

// ── Acessos da equipe (model User) ──────────────────────────────────────
export async function getUsers() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    hasPassword: !!u.password,
    since: u.createdAt.toLocaleDateString("pt-BR"),
  }));
}
export type UserRow = Awaited<ReturnType<typeof getUsers>>[number];
