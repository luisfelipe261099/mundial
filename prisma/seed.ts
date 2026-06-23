import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Prisma } from "../lib/generated/prisma/client";
import {
  clientes,
  veiculosAdmin,
  ordens as adminOrdens,
  estoque,
  agendaHoje,
} from "../app/oficina/_data/mock";
import {
  veiculos as appVeiculos,
  ordensServico as appOrdens,
  orcamentos,
  agendamentos as appAgendamentos,
  notificacoes,
  documentos,
  catalogoServicos,
} from "../app/app/_data/mock";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

function split(full: string) {
  const [brand, ...rest] = full.split(" ");
  return { brand, model: rest.join(" ") || full };
}

async function main() {
  // limpa (idempotente) — filhos antes dos pais
  await prisma.user.deleteMany();
  await prisma.serviceOrderItem.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.serviceOrder.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.client.deleteMany();
  await prisma.product.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.service.deleteMany();

  const senhaCliente = await bcrypt.hash("cliente123", 10);
  const senhaAdmin = await bcrypt.hash("admin123", 10);

  // clientes
  const clientByName = new Map<string, string>();
  for (const c of clientes) {
    const created = await prisma.client.create({
      data: {
        name: c.nome,
        cpf: c.cpf,
        phone: c.telefone,
        whatsapp: c.whatsapp,
        email: c.email,
        city: c.cidade,
        since: c.desde,
        password: senhaCliente,
      },
    });
    clientByName.set(c.nome, created.id);
  }

  // cliente Luis Felipe — login por placa RHD1G41 ou e-mail
  const luis = await prisma.client.create({
    data: {
      name: "Luis Felipe",
      email: "luis.felipe@email.com",
      city: "Curitiba/PR",
      since: "2026",
      password: senhaCliente,
    },
  });
  clientByName.set("Luis Felipe", luis.id);

  // veículos — enriquece Golf/Onix do João com dados do app (manutenções)
  const appByPlate = new Map(appVeiculos.map((v) => [v.placa, v]));
  const vehicleByPlate = new Map<string, string>();
  const vehiclesByClient = new Map<string, { id: string; model: string }[]>();
  for (const v of veiculosAdmin) {
    const { brand, model } = split(v.modelo);
    const rich = appByPlate.get(v.placa);
    const clientId = clientByName.get(v.proprietario)!;
    const created = await prisma.vehicle.create({
      data: {
        clientId,
        brand,
        model,
        year: v.ano,
        plate: v.placa,
        km: v.km,
        version: rich?.versao,
        color: rich?.cor,
        renavam: rich?.renavam,
        chassis: rich?.chassi,
        fuel: rich?.combustivel,
        nextRevisionDate: v.proximaRevisao,
        nextRevisionKm: rich?.proximaRevisao.faltamKm,
        revisionOverdue: v.revisaoVencida,
        maintenances: (rich?.proximasManutencoes ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
    vehicleByPlate.set(v.placa, created.id);
    const list = vehiclesByClient.get(clientId) ?? [];
    list.push({ id: created.id, model });
    vehiclesByClient.set(clientId, list);
  }

  // Voyage do Luis Felipe — com revisão e próximas manutenções
  const voyage = await prisma.vehicle.create({
    data: {
      clientId: luis.id,
      brand: "Volkswagen",
      model: "Voyage 1.6 MB5",
      year: 2022,
      color: "Preta",
      plate: "RHD1G41",
      fuel: "Flex",
      km: 59254,
      nextRevisionDate: "15/08/2026",
      nextRevisionKm: 746,
      maintenances: [
        { item: "Troca de óleo", quando: "Em 746 km (60.000 km)", status: "proxima" },
        { item: "Filtro de óleo", quando: "Em 746 km", status: "proxima" },
        { item: "Filtro de ar", quando: "Em 5.000 km", status: "ok" },
        { item: "Freios dianteiros", quando: "Verificar no próximo serviço", status: "proxima" },
        { item: "Correia dentada", quando: "Em 20.000 km", status: "ok" },
        { item: "Pneus", quando: "Rodízio recomendado", status: "proxima" },
      ] as Prisma.InputJsonValue,
    },
  });
  vehicleByPlate.set(voyage.plate, voyage.id);

  function findVehicle(clientId: string | undefined, keyword: string) {
    if (!clientId) return undefined;
    return vehiclesByClient.get(clientId)?.find((v) => v.model.includes(keyword))?.id;
  }

  // ordens de serviço — admin (itemizadas)
  for (const o of adminOrdens) {
    await prisma.serviceOrder.create({
      data: {
        id: o.id,
        clientId: clientByName.get(o.cliente),
        vehicleId: vehicleByPlate.get(o.placa),
        clientName: o.cliente,
        vehicleName: o.veiculo,
        plate: o.placa,
        date: o.data,
        km: o.km,
        defect: o.defeito,
        status: o.status,
        mechanic: o.mecanico,
        total: o.total,
        observations: o.observacoes,
        items: {
          create: o.itens.map((it) => ({
            type: it.tipo,
            description: it.descricao,
            qty: it.qtd,
            value: it.valor,
          })),
        },
      },
    });
  }

  // ordens de serviço — app (João: garantia/responsável/fotos)
  for (const o of appOrdens) {
    const clientId = clientByName.get("João Mendes");
    const keyword = o.veiculoNome.includes("Golf") ? "Golf" : "Onix";
    await prisma.serviceOrder.create({
      data: {
        id: o.id,
        clientId,
        vehicleId: findVehicle(clientId, keyword),
        clientName: "João Mendes",
        vehicleName: o.veiculoNome,
        date: o.data,
        km: o.km,
        status: "Entregue",
        category: o.categoria,
        total: o.valor,
        warranty: o.garantia,
        responsible: o.responsavel,
        photos: o.fotos as Prisma.InputJsonValue,
        items: {
          create: [{ type: "Serviço", description: o.servico, qty: 1, value: o.valor }],
        },
      },
    });
  }

  // orçamentos (João) + itens (peças e serviços)
  for (const orc of orcamentos) {
    await prisma.budget.create({
      data: {
        id: orc.id,
        clientId: clientByName.get("João Mendes"),
        vehicleName: orc.veiculoNome,
        date: orc.data,
        status: orc.status,
        subtotal: orc.subtotal,
        discount: orc.desconto,
        total: orc.total,
        items: {
          create: [
            ...orc.pecas.map((p) => ({ kind: "peca", description: p.nome, qty: p.qtd, value: p.valor })),
            ...orc.servicos.map((s) => ({ kind: "servico", description: s.descricao, qty: 1, value: s.valor })),
          ],
        },
      },
    });
  }

  // agendamentos: do app (João) + da agenda de hoje (oficina)
  for (const a of appAgendamentos) {
    await prisma.appointment.create({
      data: {
        clientId: clientByName.get("João Mendes"),
        vehicleName: a.veiculoNome,
        service: a.servico,
        date: a.data,
        time: a.hora,
        status: a.status,
      },
    });
  }
  for (const a of agendaHoje) {
    await prisma.appointment.create({
      data: {
        clientId: clientByName.get(a.cliente),
        vehicleName: a.veiculo,
        service: a.servico,
        date: "Hoje",
        time: a.hora,
        status: a.status,
      },
    });
  }

  // produtos (estoque)
  for (const p of estoque) {
    await prisma.product.create({
      data: { name: p.produto, brand: p.marca, code: p.codigo, qty: p.qtd, min: p.minimo },
    });
  }

  // notificações + documentos (João)
  const joao = clientByName.get("João Mendes");
  for (const n of notificacoes) {
    await prisma.notification.create({
      data: { clientId: joao, type: n.tipo, title: n.titulo, text: n.texto, when: n.quando, read: n.lido },
    });
  }
  for (const d of documentos) {
    await prisma.document.create({
      data: { clientId: joao, name: d.nome, type: d.tipo, date: d.data },
    });
  }

  // catálogo de serviços
  for (const s of catalogoServicos) {
    await prisma.service.create({ data: { name: s.nome, category: s.categoria } });
  }

  // usuário administrador
  await prisma.user.create({
    data: {
      name: "Administrador",
      email: "admin@mundial.com.br",
      role: "admin",
      password: senhaAdmin,
    },
  });

  // financeiro — lançamentos
  const transacoes = [
    { type: "receita", description: "OS-2092 — Freios Golf", category: "Serviços", value: 860, date: "20/06" },
    { type: "receita", description: "Venda de óleo + filtros", category: "Peças", value: 540, date: "19/06" },
    { type: "receita", description: "OS-2088 — Troca de óleo", category: "Serviços", value: 300, date: "18/06" },
    { type: "despesa", description: "Compra de pastilhas (Bosch)", category: "Compras", value: 1200, date: "18/06" },
    { type: "despesa", description: "Folha de pagamento", category: "Salários", value: 18600, date: "05/06" },
    { type: "despesa", description: "Aluguel do galpão", category: "Aluguel", value: 6500, date: "05/06" },
  ];
  for (const t of transacoes) await prisma.transaction.create({ data: t });

  const counts = {
    clientes: await prisma.client.count(),
    veiculos: await prisma.vehicle.count(),
    ordens: await prisma.serviceOrder.count(),
    itensOS: await prisma.serviceOrderItem.count(),
    orcamentos: await prisma.budget.count(),
    agendamentos: await prisma.appointment.count(),
    produtos: await prisma.product.count(),
    notificacoes: await prisma.notification.count(),
    documentos: await prisma.document.count(),
    transacoes: await prisma.transaction.count(),
    servicos: await prisma.service.count(),
    usuarios: await prisma.user.count(),
  };
  console.log("✅ Seed concluído:", JSON.stringify(counts, null, 2));
}

main()
  .catch((e) => {
    console.error("❌ Seed falhou:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
