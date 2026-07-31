import { prisma } from "@/lib/prisma";
import type {
  Veiculo,
  Reparo,
  OrdemServico,
  Orcamento,
  Notificacao,
  Documento,
  Agendamento,
  Manutencao,
  Categoria,
} from "@/app/app/_data/mock";
import { computeMaintenance, maintList } from "@/lib/maintenance";
import { normalizarStatus } from "@/lib/agendamentos";
import { getSession, requireSession } from "@/lib/auth";
import { notFound } from "next/navigation";

// Guarda da DAL: nenhuma leitura do portal aceita um clientId que não seja o
// da sessão em curso. Sem isso, bastaria uma página esquecer o
// requireClientId() para expor os dados de outro cliente.
async function assertDono(clientId: string): Promise<void> {
  const session = await getSession();
  if (!session || session.kind !== "cliente" || session.id !== clientId) notFound();
}

// ── Mapeadores: linha do Prisma → tipo que os componentes já consomem ──────

type VehicleRow = Awaited<ReturnType<typeof prisma.vehicle.findFirst>>;
type OrderRow = NonNullable<Awaited<ReturnType<typeof prisma.serviceOrder.findFirst>>> & {
  items?: { type: string; description: string; qty: number; value: number }[];
};
type BudgetRow = NonNullable<Awaited<ReturnType<typeof prisma.budget.findFirst>>> & {
  items?: { kind: string; description: string; qty: number; value: number }[];
};

function mapVehicle(v: NonNullable<VehicleRow>, i = 0): Veiculo {
  const faltamKm = v.nextRevisionKm ?? 0;
  return {
    id: v.id,
    marca: v.brand,
    marcaCurta: v.brand,
    modelo: v.model,
    ano: v.year,
    versao: v.version ?? "—",
    cor: v.color ?? "—",
    placa: v.plate,
    renavam: v.renavam ?? "—",
    chassi: v.chassis ?? "—",
    combustivel: v.fuel ?? "—",
    km: v.km,
    proximaRevisao: {
      faltamKm,
      data: v.nextRevisionDate ?? "—",
      progresso: faltamKm ? Math.max(0.05, Math.min(1, 1 - faltamKm / 10000)) : 0.5,
    },
    proximasManutencoes: (v.maintenances as Manutencao[] | null) ?? [],
    gradiente: i % 2 === 0 ? "grad-blue" : "grad-steel",
  };
}

function servicoDe(o: OrderRow): string {
  return o.items?.[0]?.description ?? o.defect ?? "Serviço";
}

function mapOrder(o: OrderRow): OrdemServico {
  return {
    id: o.id,
    veiculoId: o.vehicleId ?? "",
    veiculoNome: o.vehicleName,
    servico: servicoDe(o),
    data: o.date,
    km: o.km,
    valor: o.total,
    garantia: o.warranty ?? "—",
    responsavel: o.responsible ?? "—",
    categoria: (o.category as OrdemServico["categoria"]) ?? "geral",
    status: o.status === "Finalizada" ? "Finalizada" : "Entregue",
    fotos: (o.photos as OrdemServico["fotos"] | null) ?? [],
  };
}

function mapBudget(b: BudgetRow): Orcamento {
  const items = b.items ?? [];
  return {
    id: b.id,
    veiculoNome: b.vehicleName,
    data: b.date,
    status: b.status as Orcamento["status"],
    pecas: items.filter((i) => i.kind === "peca").map((i) => ({ nome: i.description, qtd: i.qty, valor: i.value })),
    servicos: items.filter((i) => i.kind === "servico").map((i) => ({ descricao: i.description, valor: i.value })),
    subtotal: b.subtotal,
    desconto: b.discount,
    total: b.total,
  };
}

// ── Queries (escopadas ao cliente logado) ──────────────────────────────────

export async function getCliente(clientId: string) {
  await assertDono(clientId);
  const c = await prisma.client.findUnique({ where: { id: clientId } });
  if (!c) return null;
  const iniciais = c.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return {
    nome: c.name,
    primeiroNome: c.name.split(" ")[0],
    iniciais,
    cpf: c.cpf ?? "—",
    telefone: c.phone ?? "—",
    whatsapp: c.whatsapp ?? "—",
    email: c.email ?? "—",
    endereco: c.address ?? c.city ?? "—",
  };
}

export async function getVeiculos(clientId: string): Promise<Veiculo[]> {
  await assertDono(clientId);
  const rows = await prisma.vehicle.findMany({ where: { clientId }, orderBy: { plate: "asc" } });
  // As colunas nextRevisionKm/nextRevisionDate só eram preenchidas pelo seed;
  // a fonte real é o motor de manutenção (última troca de óleo/revisão + placa).
  const toggles = await togglesManutencao();
  const agora = new Date();
  return rows.map((v, i) => {
    const veiculo = mapVehicle(v, i);
    veiculo.proximasManutencoes = maintList(
      computeMaintenance(
        { plate: v.plate, lastOilChangeAt: v.lastOilChangeAt, lastRevisaoAt: v.lastRevisaoAt },
        toggles,
        agora
      )
    );
    return veiculo;
  });
}

// Toggles de lembrete (Settings), com defaults ligados.
async function togglesManutencao() {
  const s = await prisma.settings.findUnique({ where: { id: "default" } });
  return {
    notifOleo: s?.notifOleo ?? true,
    notifRevisao: s?.notifRevisao ?? true,
    notifIpva: s?.notifIpva ?? true,
  };
}

export async function getVeiculo(id: string, clientId: string): Promise<Veiculo | null> {
  await assertDono(clientId);
  const v = await prisma.vehicle.findFirst({ where: { id, clientId } });
  if (!v) return null;
  const veiculo = mapVehicle(v);
  veiculo.proximasManutencoes = maintList(
    computeMaintenance(
      { plate: v.plate, lastOilChangeAt: v.lastOilChangeAt, lastRevisaoAt: v.lastRevisaoAt },
      await togglesManutencao(),
      new Date()
    )
  );
  return veiculo;
}

// Histórico = só o que já foi concluído. Sem este filtro, uma OS "Aberta" ou
// "Em execução" caía no histórico rotulada como "Entregue" (ver mapOrder).
const CONCLUIDAS = ["Finalizada", "Entregue"];

export async function getOrdens(clientId: string): Promise<OrdemServico[]> {
  await assertDono(clientId);
  const rows = await prisma.serviceOrder.findMany({
    where: { clientId, status: { in: CONCLUIDAS } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrder);
}

export async function getOrdem(id: string, clientId: string): Promise<OrdemServico | null> {
  await assertDono(clientId);
  const o = await prisma.serviceOrder.findFirst({ where: { id, clientId }, include: { items: true } });
  return o ? mapOrder(o) : null;
}

export async function getOrdensVeiculo(vehicleId: string, clientId: string): Promise<OrdemServico[]> {
  await assertDono(clientId);
  const rows = await prisma.serviceOrder.findMany({
    where: { vehicleId, clientId, status: { in: CONCLUIDAS } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapOrder);
}

export async function getReparosRecentes(clientId: string): Promise<Reparo[]> {
  await assertDono(clientId);
  const rows = await prisma.serviceOrder.findMany({
    where: { clientId, status: { in: CONCLUIDAS } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });
  return rows.map((o) => ({
    id: o.id,
    nome: servicoDe(o),
    data: o.date,
    valor: o.total,
    categoria: (o.category as Reparo["categoria"]) ?? "geral",
  }));
}

export async function getOrcamentos(clientId: string): Promise<Orcamento[]> {
  await assertDono(clientId);
  const rows = await prisma.budget.findMany({
    where: { clientId },
    include: { items: true },
    orderBy: { date: "desc" },
  });
  return rows.map(mapBudget);
}

export async function getOrcamento(id: string, clientId: string): Promise<Orcamento | null> {
  await assertDono(clientId);
  const b = await prisma.budget.findFirst({ where: { id, clientId }, include: { items: true } });
  return b ? mapBudget(b) : null;
}

export async function getNotificacoes(clientId: string): Promise<Notificacao[]> {
  await assertDono(clientId);
  const rows = await prisma.notification.findMany({ where: { clientId }, orderBy: { id: "asc" } });
  return rows.map((n) => ({
    id: n.id,
    tipo: n.type as Notificacao["tipo"],
    titulo: n.title,
    texto: n.text ?? "",
    quando: n.when ?? "",
    lido: n.read,
  }));
}

export async function getNaoLidas(clientId: string): Promise<number> {
  await assertDono(clientId);
  return prisma.notification.count({ where: { clientId, read: false } });
}

// Cada documento aponta para onde ele realmente existe: a OS vira PDF, o
// orçamento vira a tela de aprovação. Sem isso os botões de download eram
// decorativos.
export type DocumentoLink = Documento & { href: string; formato: string };

// Documentos derivados dos dados REAIS do cliente (OS, orçamentos, comprovantes).
export async function getDocumentos(clientId: string): Promise<DocumentoLink[]> {
  await assertDono(clientId);
  const [ordens, budgets] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: { clientId, status: { in: ["Finalizada", "Entregue"] } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.budget.findMany({ where: { clientId }, orderBy: { date: "desc" } }),
  ]);
  const docs: DocumentoLink[] = [];
  for (const o of ordens) {
    const pdf = `/oficina/ordens/${o.id}/pdf`;
    docs.push({
      id: `os-${o.id}`,
      nome: `${o.id} — ${o.vehicleName}`,
      tipo: "Ordem de serviço",
      data: o.date,
      href: pdf,
      formato: "PDF",
    });
    if (o.paid) {
      docs.push({
        id: `cp-${o.id}`,
        nome: `Comprovante — ${o.id}`,
        tipo: "Comprovante",
        data: o.deliveredAt ?? o.date,
        href: pdf,
        formato: "PDF",
      });
    }
  }
  for (const b of budgets) {
    docs.push({
      id: `orc-${b.id}`,
      nome: `Orçamento ${b.id} — ${b.vehicleName}`,
      tipo: "Orçamento",
      data: b.date,
      href: `/app/orcamentos/${b.id}`,
      formato: "ver no app",
    });
  }
  return docs;
}

// OS ativas do cliente (para "acompanhar o carro"), com o status real.
export async function getOrdensAtivas(clientId: string) {
  await assertDono(clientId);
  const rows = await prisma.serviceOrder.findMany({
    where: { clientId, status: { not: "Entregue" } },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((o) => ({
    id: o.id,
    veiculo: o.vehicleName,
    status: o.status,
    data: o.date,
    total: o.total,
  }));
}

export async function getAgendamentos(clientId: string): Promise<Agendamento[]> {
  await assertDono(clientId);
  const rows = await prisma.appointment.findMany({ where: { clientId }, orderBy: { id: "desc" } });
  return rows.map((a) => ({
    id: a.id,
    veiculoNome: a.vehicleName,
    servico: a.service,
    data: a.date,
    hora: a.time,
    status: normalizarStatus(a.status),
  }));
}

export async function getCatalogoServicos(): Promise<{ nome: string; categoria: Categoria }[]> {
  await requireSession();
  const rows = await prisma.service.findMany({ orderBy: { id: "asc" } });
  return rows.map((s) => ({ nome: s.name, categoria: (s.category ?? "geral") as Categoria }));
}
