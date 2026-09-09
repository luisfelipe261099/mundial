import { prisma } from "@/lib/prisma";
import type {
  Cliente,
  VeiculoAdmin,
  OrdemServicoAdmin,
  Produto,
  Agendamento,
} from "@/app/oficina/_data/mock";
import { computeMaintenance, maintList } from "@/lib/maintenance";

// Trend de 6 meses é ilustrativo (o banco não guarda histórico mensal).
const MESES_CURTOS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** Faturamento real dos últimos 6 meses (receitas lançadas no financeiro). */
export async function getFaturamentoMensal(): Promise<{ mes: string; valor: number }[]> {
  const hoje = new Date();
  const inicio = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - 5, 1));
  const rows = await prisma.transaction.findMany({
    where: { type: "receita", occurredAt: { gte: inicio } },
    select: { value: true, occurredAt: true },
  });

  const buckets: { mes: string; valor: number }[] = [];
  const indice = new Map<string, number>();
  for (let i = 0; i < 6; i++) {
    const d = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - 5 + i, 1));
    const chave = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    indice.set(chave, buckets.length);
    buckets.push({ mes: MESES_CURTOS[d.getUTCMonth()], valor: 0 });
  }
  for (const t of rows) {
    if (!t.occurredAt) continue;
    const chave = `${t.occurredAt.getUTCFullYear()}-${t.occurredAt.getUTCMonth()}`;
    const i = indice.get(chave);
    if (i !== undefined) buckets[i].valor += t.value;
  }
  return buckets;
}

type ClientRow = { id: string; name: string; phone: string | null; cpf: string | null; whatsapp: string | null; email: string | null; city: string | null; address: string | null; since: string | null };

function mapVeiculo(v: { id: string; brand: string; model: string; year: number; plate: string; km: number; engine?: string | null; nextRevisionDate: string | null; revisionOverdue: boolean; client?: { name: string } | null }): VeiculoAdmin {
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
    motor: v.engine ?? "",
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
  paid?: boolean;
  items?: { type: string; description: string; qty: number; value: number }[];
}): OrdemServicoAdmin {
  return {
    id: o.id,
    cliente: o.clientName,
    veiculo: o.vehicleName,
    placa: o.plate ?? "—",
    data: o.date,
    iso: agendaISO(o.date, hojeISO()),
    paga: o.paid ?? false,
    km: o.km,
    defeito: o.defect ?? "—",
    status: o.status as OrdemServicoAdmin["status"],
    mecanico: o.mechanic ?? "—",
    itens: (o.items ?? []).map((i) => ({ tipo: i.type as "Peça" | "Serviço", descricao: i.description, qtd: i.qty, valor: i.value })),
    total: o.total,
    observacoes: o.observations ?? "—",
  };
}

function mapCliente(
  c: ClientRow,
  veiculos: number,
  gastoTotal: number,
  placas: string[] = [],
  carros: { id: string; modelo: string; placa: string }[] = [],
  ordens = 0
): Cliente {
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
    carros,
    ordens,
  };
}

const ABERTAS = ["Aberta", "Aguardando aprovação", "Em execução"];
const CONCLUIDAS = ["Finalizada", "Entregue"];

export async function getKpis() {
  const [clientes, veiculos, osAbertas, osConcluidasMes, osAguardando, revisoesVencidas, receita, faturamentoAnoAgg] =
    await Promise.all([
      prisma.client.count(),
      prisma.vehicle.count(),
      prisma.serviceOrder.count({ where: { status: { in: ABERTAS } } }),
      prisma.serviceOrder.count({ where: { status: { in: CONCLUIDAS } } }),
      prisma.serviceOrder.count({ where: { status: "Aguardando aprovação" } }),
      prisma.vehicle.count({ where: { revisionOverdue: true } }),
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
    osAguardando,
    revisoesVencidas,
    osTotal: faturamentoAnoAgg._count,
    faturamentoMes: receita._sum.value ?? 0,
    faturamentoAno,
    ticketMedio: Math.round(faturamentoAno / osTotal),
  };
}

export async function getClientes(): Promise<Cliente[]> {
  const [clients, gastos] = await Promise.all([
    prisma.client.findMany({
      include: {
        vehicles: { select: { id: true, brand: true, model: true, plate: true }, orderBy: { plate: "asc" } },
        _count: { select: { serviceOrders: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.serviceOrder.groupBy({ by: ["clientId"], _sum: { total: true } }),
  ]);
  const gastoMap = new Map(gastos.map((g) => [g.clientId, g._sum.total ?? 0]));
  return clients.map((c) =>
    mapCliente(
      c,
      c.vehicles.length,
      gastoMap.get(c.id) ?? 0,
      c.vehicles.map((v) => v.plate),
      c.vehicles.map((v) => ({ id: v.id, modelo: `${v.brand} ${v.model}`, placa: v.plate })),
      c._count.serviceOrders
    )
  );
}

export async function getClienteDetalhe(id: string) {
  const c = await prisma.client.findUnique({ where: { id } });
  if (!c) return null;
  const [veiculos, ordens, gasto] = await Promise.all([
    prisma.vehicle.findMany({ where: { clientId: id }, include: { client: true } }),
    prisma.serviceOrder.findMany({ where: { clientId: id }, include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } }, orderBy: { createdAt: "desc" } }),
    prisma.serviceOrder.aggregate({ where: { clientId: id }, _sum: { total: true } }),
  ]);
  return {
    cliente: mapCliente(
      c,
      veiculos.length,
      gasto._sum.total ?? 0,
      veiculos.map((v) => v.plate),
      veiculos.map((v) => ({ id: v.id, modelo: `${v.brand} ${v.model}`, placa: v.plate })),
      ordens.length
    ),
    veiculos: veiculos.map(mapVeiculo),
    ordens: ordens.map(mapOrdem),
    temAcesso: !!c.password,
    // Campos crus para o formulário de edição (sem os "—" de exibição).
    ficha: {
      nome: c.name,
      cpf: c.cpf ?? "",
      telefone: c.phone ?? "",
      whatsapp: c.whatsapp ?? "",
      email: c.email ?? "",
      cidade: c.city ?? "",
      endereco: c.address ?? "",
    },
  };
}

export async function getVeiculos(): Promise<VeiculoAdmin[]> {
  const rows = await prisma.vehicle.findMany({ include: { client: true }, orderBy: { plate: "asc" } });
  return rows.map(mapVeiculo);
}

export async function getVeiculoDetalhe(id: string) {
  const v = await prisma.vehicle.findUnique({ where: { id }, include: { client: true } });
  if (!v) return null;
  const ordens = await prisma.serviceOrder.findMany({ where: { vehicleId: id }, include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } }, orderBy: { createdAt: "desc" } });
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
  // Campos crus para o formulário de edição (o mapVeiculo junta marca+modelo
  // e formata, o que não serve para editar).
  const ficha = {
    modelo: `${v.brand} ${v.model}`,
    placa: v.plate,
    motor: v.engine ?? "",
    ano: v.year,
    km: v.km,
    cor: v.color ?? "",
    combustivel: v.fuel ?? "",
    clienteId: v.clientId,
  };
  return { veiculo: mapVeiculo(v), ordens: ordens.map(mapOrdem), manutencoes, base, ficha };
}

export async function getOrdens(): Promise<OrdemServicoAdmin[]> {
  const rows = await prisma.serviceOrder.findMany({ include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } }, orderBy: { createdAt: "desc" } });
  return rows.map(mapOrdem);
}

export async function getOrdem(id: string): Promise<OrdemServicoAdmin | null> {
  const o = await prisma.serviceOrder.findUnique({ where: { id }, include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } } });
  return o ? mapOrdem(o) : null;
}

// OS + dados de contato do cliente e detalhes do veículo, para o PDF "completo".
// Faz fallback aos campos denormalizados quando a OS não tem vínculo (client/vehicle nulos).
export type OrdemPdf = OrdemServicoAdmin & {
  clienteInfo: { cpf: string; telefone: string; cidade: string };
  veiculoInfo: { ano: string; cor: string; combustivel: string };
  horaEntrada: string | null;
  dataSaida: string | null;
  horaSaida: string | null;
};

export async function getOrdemParaPdf(id: string): Promise<OrdemPdf | null> {
  const o = await prisma.serviceOrder.findUnique({
    where: { id },
    include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] }, client: true, vehicle: true },
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
    horaEntrada: o.entryTime,
    dataSaida: o.deliveredAt,
    horaSaida: o.exitTime,
  };
}

// OS completa para o "centro de controle" (vistoria + itens com id + status do orçamento).
export async function getOrdemControle(id: string) {
  const o = await prisma.serviceOrder.findUnique({ where: { id }, include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } } });
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
    horaEntrada: o.entryTime,
    horaSaida: o.exitTime,
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
    // Fotos são URLs (upload do mecânico). Dados antigos de demonstração
    // guardavam objetos {src, etapa} — ignora o que não for string, senão o
    // <Image> derruba a página inteira da OS.
    fotos: ((o.photos ?? []) as unknown[]).filter((f): f is string => typeof f === "string"),
    itens: o.items.map((i) => ({
      id: i.id,
      tipo: i.type,
      descricao: i.description,
      qtd: i.qty,
      valor: i.value,
      productId: i.productId,
    })),
    budgetStatus: budget?.status ?? null,
    // Vínculos e efeitos colaterais já aplicados — a edição e a exclusão da OS
    // precisam saber o que já mexeu em estoque e financeiro.
    clientId: o.clientId,
    vehicleId: o.vehicleId,
    fuelLevelRaw: o.fuelLevel ?? "",
    stockApplied: o.stockApplied,
    financeApplied: o.financeApplied,
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

// ── Painel de mecânicos ─────────────────────────────────────────────────
// Junta o cadastro da equipe (User role=mecanico) com a carga de trabalho de
// cada um, para a tela onde o admin cadastra e vincula mecânico às OS.
export type OrdemAtribuivel = {
  id: string;
  cliente: string;
  veiculo: string;
  placa: string;
  data: string;
  status: OrdemServicoAdmin["status"];
  mechanicId: string | null;
  mecanico: string | null;
};

export type MecanicoRow = {
  id: string;
  name: string;
  email: string;
  hasPassword: boolean;
  desde: string;
  emAndamento: number;
  finalizadas: number;
  entregues: number;
  ordens: OrdemAtribuivel[];
};

export async function getMecanicosPainel(): Promise<{
  mecanicos: MecanicoRow[];
  ordensAtivas: OrdemAtribuivel[];
  semMecanico: number;
}> {
  const [users, rows] = await Promise.all([
    prisma.user.findMany({ where: { role: "mecanico" }, orderBy: { name: "asc" } }),
    prisma.serviceOrder.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        clientName: true,
        vehicleName: true,
        plate: true,
        date: true,
        status: true,
        mechanicId: true,
        mechanic: true,
      },
    }),
  ]);

  const paraAtribuir = (o: (typeof rows)[number]): OrdemAtribuivel => ({
    id: o.id,
    cliente: o.clientName,
    veiculo: o.vehicleName,
    placa: o.plate ?? "—",
    data: o.date,
    status: o.status as OrdemServicoAdmin["status"],
    mechanicId: o.mechanicId,
    mecanico: o.mechanic,
  });

  const ativas = rows.filter((o) => o.status !== "Entregue");

  const mecanicos = users.map((u) => {
    const suas = rows.filter((o) => o.mechanicId === u.id);
    return {
      id: u.id,
      name: u.name,
      email: u.email ?? "",
      hasPassword: !!u.password,
      desde: u.createdAt.toLocaleDateString("pt-BR"),
      emAndamento: suas.filter((o) => ABERTAS.includes(o.status)).length,
      finalizadas: suas.filter((o) => o.status === "Finalizada").length,
      entregues: suas.filter((o) => o.status === "Entregue").length,
      ordens: suas.filter((o) => o.status !== "Entregue").map(paraAtribuir),
    };
  });

  return {
    mecanicos,
    ordensAtivas: ativas.map(paraAtribuir),
    semMecanico: ativas.filter((o) => !o.mechanicId).length,
  };
}

export async function getOrdensMecanico(mechanicId: string): Promise<OrdemServicoAdmin[]> {
  const rows = await prisma.serviceOrder.findMany({
    where: { mechanicId },
    include: { items: { orderBy: [{ position: "asc" }, { id: "asc" }] } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrdem);
}

export async function getAgendaHoje(): Promise<Agendamento[]> {
  // Não dá pra filtrar no banco: a coluna `date` mistura "Hoje", DD/MM/AAAA e
  // AAAA-MM-DD. Normaliza e compara com o hoje da oficina.
  const todas = await prisma.appointment.findMany({ include: { client: true }, orderBy: { time: "asc" } });
  const hoje = hojeISO();
  const rows = todas.filter(
    (a) => agendaISO(a.date, hoje) === hoje && !["Concluído", "Concluido", "Finalizado", "Cancelado"].includes(a.status)
  );
  return rows.map((a) => ({
    hora: a.time,
    cliente: a.client?.name ?? "—",
    veiculo: a.vehicleName,
    servico: a.service,
    status: a.status === "Confirmado" ? "Confirmado" : "Aguardando",
  }));
}

export async function getEstoque(): Promise<Produto[]> {
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
  /** Data normalizada em AAAA-MM-DD. Vazio quando não dá pra interpretar. */
  iso: string;
  hora: string;
  cliente: string;
  veiculo: string;
  servico: string;
  status: string;
};

// Fuso da oficina — "hoje" tem que ser o hoje de Curitiba, não o do servidor.
export function hojeISO(agora = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
}

// A coluna `date` é texto livre e acumulou três formatos: AAAA-MM-DD (input
// date), DD/MM/AAAA (app do cliente e seed) e rótulos como "Hoje"/"Amanhã".
// Normaliza tudo para poder ordenar e saber o que já passou.
function agendaISO(valor: string, hoje: string): string {
  const s = (valor ?? "").trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (br) return `${br[3]}-${br[2]}-${br[1]}`;
  const rotulo = s.toLowerCase();
  if (rotulo === "hoje") return hoje;
  if (rotulo === "amanhã" || rotulo === "amanha") {
    const d = new Date(`${hoje}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + 1);
    return d.toISOString().slice(0, 10);
  }
  return "";
}

export async function getAgendaAdmin(): Promise<AgendaItem[]> {
  const rows = await prisma.appointment.findMany({ include: { client: true } });
  const hoje = hojeISO();
  return rows
    .map((a) => ({
      id: a.id,
      data: a.date,
      iso: agendaISO(a.date, hoje),
      hora: a.time,
      cliente: a.clientName ?? a.client?.name ?? "—",
      veiculo: a.vehicleName,
      servico: a.service,
      status: a.status,
    }))
    // Sem data legível vai pro fim; o resto em ordem cronológica de verdade
    // (o orderBy do banco ordenava texto, misturando os formatos).
    .sort((a, b) => {
      if (!a.iso !== !b.iso) return a.iso ? -1 : 1;
      return a.iso.localeCompare(b.iso) || a.hora.localeCompare(b.hora);
    });
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
  const rows = await prisma.transaction.findMany({
    orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
  });
  return rows.map((t) => {
    const quando = t.occurredAt ?? t.createdAt;
    return {
      id: t.id,
      tipo: t.type as "receita" | "despesa",
      descricao: t.description,
      categoria: t.category ?? "Outros",
      valor: t.value,
      data: quando.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      /** AAAA-MM-DD — usado nos filtros de período e no campo de data. */
      dia: new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Sao_Paulo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(quando),
      iso: quando.toISOString(),
      forma: t.method ?? "",
      observacoes: t.notes ?? "",
      /** Receita gerada pela entrega de uma OS (não foi digitada à mão). */
      osId: t.serviceOrderId,
    };
  });
}

export async function getSettings() {
  return prisma.settings.findUnique({ where: { id: "default" } });
}

// Equipe real: usuários cadastrados (admin/mecânico).
export async function getEquipe() {
  const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
  return users.map((u) => ({
    nome: u.name,
    papel: u.role === "mecanico" ? "Mecânico" : u.role === "cliente" ? "Cliente" : "Administrador",
  }));
}

/** Converte AAAA-MM-DD em instante UTC; fim de dia quando `fim` é true. */
function limiteData(dia: string | undefined, fim = false): Date | undefined {
  if (!dia || !/^\d{4}-\d{2}-\d{2}$/.test(dia)) return undefined;
  return new Date(`${dia}T${fim ? "23:59:59.999" : "00:00:00.000"}Z`);
}

export async function getRelatorios(de?: string, ate?: string) {
  const gte = limiteData(de);
  const lte = limiteData(ate, true);
  const janela = gte || lte ? { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } : undefined;
  const ondeOS = janela ? { createdAt: janela } : {};
  const ondeTx = janela ? { occurredAt: janela } : {};

  const [itens, ordens, vencidas, transacoes] = await Promise.all([
    // Agrega em JS porque o total do item é value × qty — o groupBy do Prisma
    // não multiplica colunas e somava só o valor unitário (contava errado).
    prisma.serviceOrderItem.findMany({
      where: janela ? { serviceOrder: { createdAt: janela } } : {},
      select: { type: true, description: true, qty: true, value: true },
    }),
    prisma.serviceOrder.findMany({
      where: ondeOS,
      select: { clientName: true, status: true, total: true, mechanic: true },
    }),
    prisma.vehicle.findMany({ where: { revisionOverdue: true }, include: { client: true } }),
    prisma.transaction.findMany({
      where: ondeTx,
      select: { type: true, value: true, category: true, method: true },
    }),
  ]);

  // ── Rankings de itens (peça e serviço separados) ──
  type Acc = { qtd: number; receita: number };
  const rank = (tipo: string) => {
    const mapa = new Map<string, Acc>();
    for (const i of itens) {
      if (i.type !== tipo) continue;
      const chave = i.description.trim();
      const a = mapa.get(chave) ?? { qtd: 0, receita: 0 };
      a.qtd += i.qty;
      a.receita += i.value * i.qty;
      mapa.set(chave, a);
    }
    return [...mapa.entries()]
      .map(([nome, a]) => ({ servico: nome, qtd: a.qtd, receita: a.receita }))
      .sort((x, y) => y.receita - x.receita)
      .slice(0, 6);
  };

  // ── Clientes ──
  const porCliente = new Map<string, { os: number; gasto: number }>();
  for (const o of ordens) {
    const a = porCliente.get(o.clientName) ?? { os: 0, gasto: 0 };
    a.os += 1;
    a.gasto += o.total;
    porCliente.set(o.clientName, a);
  }
  const clientesMaisAtivos = [...porCliente.entries()]
    .map(([nome, a]) => ({ nome, os: a.os, gasto: a.gasto }))
    .sort((x, y) => y.gasto - x.gasto)
    .slice(0, 6);

  // ── OS por status e por mecânico ──
  const porStatus = new Map<string, number>();
  const porMecanico = new Map<string, { os: number; valor: number }>();
  for (const o of ordens) {
    porStatus.set(o.status, (porStatus.get(o.status) ?? 0) + 1);
    const nome = o.mechanic?.trim() || "Sem mecânico";
    const a = porMecanico.get(nome) ?? { os: 0, valor: 0 };
    a.os += 1;
    a.valor += o.total;
    porMecanico.set(nome, a);
  }

  // ── Financeiro do período ──
  const receitas = transacoes.filter((t) => t.type === "receita").reduce((s, t) => s + t.value, 0);
  const despesas = transacoes.filter((t) => t.type === "despesa").reduce((s, t) => s + t.value, 0);
  const porCategoria = new Map<string, { receita: number; despesa: number }>();
  for (const t of transacoes) {
    const chave = t.category?.trim() || "Outros";
    const a = porCategoria.get(chave) ?? { receita: 0, despesa: 0 };
    if (t.type === "receita") a.receita += t.value;
    else a.despesa += t.value;
    porCategoria.set(chave, a);
  }
  const porForma = new Map<string, number>();
  for (const t of transacoes) {
    if (t.type !== "receita") continue;
    porForma.set(t.method?.trim() || "Não informado", (porForma.get(t.method?.trim() || "Não informado") ?? 0) + t.value);
  }

  const totalOS = ordens.length;
  const faturadoOS = ordens.reduce((s, o) => s + o.total, 0);

  return {
    servicosMaisVendidos: rank("Serviço"),
    pecasMaisUsadas: rank("Peça"),
    clientesMaisAtivos,
    revisoesPendentes: vencidas.map((v) => ({
      modelo: `${v.brand} ${v.model}`,
      placa: v.plate,
      proprietario: v.client?.name ?? "—",
      quando: `Revisão vencida · ${v.nextRevisionDate ?? ""}`,
    })),
    resumo: {
      receitas,
      despesas,
      lucro: receitas - despesas,
      totalOS,
      faturadoOS,
      ticketMedio: totalOS > 0 ? Math.round(faturadoOS / totalOS) : 0,
    },
    ordensPorStatus: [...porStatus.entries()]
      .map(([status, qtd]) => ({ status, qtd }))
      .sort((a, b) => b.qtd - a.qtd),
    porMecanico: [...porMecanico.entries()]
      .map(([nome, a]) => ({ nome, os: a.os, valor: a.valor }))
      .sort((x, y) => y.valor - x.valor),
    porCategoria: [...porCategoria.entries()]
      .map(([nome, a]) => ({ nome, receita: a.receita, despesa: a.despesa }))
      .sort((x, y) => y.receita + y.despesa - (x.receita + x.despesa)),
    formasPagamento: [...porForma.entries()]
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((x, y) => y.valor - x.valor),
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

// ── Acessos da equipe (model User) ──────────────────────────────────────
export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email ?? "",
    role: u.role,
    hasPassword: !!u.password,
    since: u.createdAt.toLocaleDateString("pt-BR"),
  }));
}
export type UserRow = Awaited<ReturnType<typeof getUsers>>[number];
