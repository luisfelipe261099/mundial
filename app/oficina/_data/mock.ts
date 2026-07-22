// Fonte única de verdade do PROTÓTIPO do painel da oficina (admin). Fictício.
// Quando o banco chegar, troca-se por queries Prisma.

export type StatusOS =
  | "Aberta"
  | "Aguardando aprovação"
  | "Em execução"
  | "Finalizada"
  | "Entregue";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const kpis = {
  clientes: 312,
  veiculos: 418,
  osAbertas: 14,
  osConcluidasMes: 86,
  faturamentoMes: 78450,
  faturamentoAno: 624300,
  ticketMedio: 412,
};

// Faturamento dos últimos 6 meses (para o "gráfico" de barras em CSS).
export const faturamentoMensal = [
  { mes: "Jan", valor: 52300 },
  { mes: "Fev", valor: 47800 },
  { mes: "Mar", valor: 61200 },
  { mes: "Abr", valor: 58900 },
  { mes: "Mai", valor: 69400 },
  { mes: "Jun", valor: 78450 },
];

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  telefone: string;
  whatsapp: string;
  email: string;
  cidade: string;
  veiculos: number;
  gastoTotal: number;
  desde: string;
  placas?: string[];
}

export const clientes: Cliente[] = [
  { id: "c1", nome: "João Mendes", cpf: "123.456.789-00", telefone: "(41) 99999-0000", whatsapp: "(41) 99999-0000", email: "joao.mendes@email.com", cidade: "Curitiba/PR", veiculos: 2, gastoTotal: 4820, desde: "2021" },
  { id: "c2", nome: "Marina Schmidt", cpf: "234.567.890-11", telefone: "(41) 98888-1122", whatsapp: "(41) 98888-1122", email: "marina.s@email.com", cidade: "Curitiba/PR", veiculos: 1, gastoTotal: 2310, desde: "2022" },
  { id: "c3", nome: "Rafael Antunes", cpf: "345.678.901-22", telefone: "(41) 97777-3344", whatsapp: "(41) 97777-3344", email: "rafael.antunes@email.com", cidade: "Pinhais/PR", veiculos: 3, gastoTotal: 9140, desde: "2019" },
  { id: "c4", nome: "Cláudia Pereira", cpf: "456.789.012-33", telefone: "(41) 96666-5566", whatsapp: "(41) 96666-5566", email: "claudia.p@email.com", cidade: "Curitiba/PR", veiculos: 1, gastoTotal: 1580, desde: "2023" },
  { id: "c5", nome: "Eduardo Nakamura", cpf: "567.890.123-44", telefone: "(41) 95555-7788", whatsapp: "(41) 95555-7788", email: "edu.nakamura@email.com", cidade: "São José dos Pinhais/PR", veiculos: 2, gastoTotal: 6720, desde: "2020" },
  { id: "c6", nome: "Patrícia Lopes", cpf: "678.901.234-55", telefone: "(41) 94444-9900", whatsapp: "(41) 94444-9900", email: "patricia.lopes@email.com", cidade: "Curitiba/PR", veiculos: 1, gastoTotal: 980, desde: "2024" },
];

export interface VeiculoAdmin {
  id: string;
  proprietario: string;
  modelo: string;
  placa: string;
  ano: number;
  km: number;
  proximaRevisao: string;
  revisaoVencida: boolean;
  marca?: string;
}

export const veiculosAdmin: VeiculoAdmin[] = [
  { id: "v1", proprietario: "João Mendes", modelo: "VW Golf 1.4 TSI", placa: "ABC-1D23", ano: 2018, km: 47250, proximaRevisao: "25/07/2026", revisaoVencida: false },
  { id: "v2", proprietario: "João Mendes", modelo: "Chevrolet Onix 1.0", placa: "DEF-2G45", ano: 2021, km: 31800, proximaRevisao: "12/11/2026", revisaoVencida: false },
  { id: "v3", proprietario: "Rafael Antunes", modelo: "Toyota Corolla 2.0", placa: "GHI-3J67", ano: 2020, km: 68200, proximaRevisao: "30/05/2026", revisaoVencida: true },
  { id: "v4", proprietario: "Marina Schmidt", modelo: "Hyundai HB20 1.0", placa: "JKL-4M89", ano: 2019, km: 54100, proximaRevisao: "08/08/2026", revisaoVencida: false },
  { id: "v5", proprietario: "Eduardo Nakamura", modelo: "Honda Civic 1.5T", placa: "MNO-5P01", ano: 2022, km: 22900, proximaRevisao: "19/06/2026", revisaoVencida: true },
  { id: "v6", proprietario: "Cláudia Pereira", modelo: "Fiat Argo 1.3", placa: "PQR-6S23", ano: 2021, km: 39400, proximaRevisao: "02/09/2026", revisaoVencida: false },
];

export interface ItemOS {
  tipo: "Peça" | "Serviço";
  descricao: string;
  qtd: number;
  valor: number;
}

export interface OrdemServicoAdmin {
  id: string;
  cliente: string;
  veiculo: string;
  placa: string;
  data: string;
  km: number;
  defeito: string;
  status: StatusOS;
  mecanico: string;
  itens: ItemOS[];
  total: number;
  observacoes: string;
}

export const ordens: OrdemServicoAdmin[] = [
  {
    id: "OS-2098",
    cliente: "Rafael Antunes",
    veiculo: "Toyota Corolla 2.0",
    placa: "GHI-3J67",
    data: "23/06/2026",
    km: 68200,
    defeito: "Barulho na suspensão dianteira e vibração ao frear.",
    status: "Em execução",
    mecanico: "Carlos Andrade",
    itens: [
      { tipo: "Peça", descricao: "Amortecedor dianteiro (par)", qtd: 1, valor: 760 },
      { tipo: "Peça", descricao: "Pastilha de freio dianteira", qtd: 1, valor: 240 },
      { tipo: "Serviço", descricao: "Mão de obra — suspensão e freios", qtd: 1, valor: 420 },
    ],
    total: 1420,
    observacoes: "Cliente aprovou orçamento por WhatsApp. Peças em estoque.",
  },
  {
    id: "OS-2097",
    cliente: "Marina Schmidt",
    veiculo: "Hyundai HB20 1.0",
    placa: "JKL-4M89",
    data: "23/06/2026",
    km: 54100,
    defeito: "Revisão de 50.000 km.",
    status: "Aguardando aprovação",
    mecanico: "André Lima",
    itens: [
      { tipo: "Peça", descricao: "Kit revisão 50k (óleo, filtros, velas)", qtd: 1, valor: 540 },
      { tipo: "Serviço", descricao: "Mão de obra — revisão completa", qtd: 1, valor: 320 },
    ],
    total: 860,
    observacoes: "Orçamento enviado, aguardando resposta do cliente.",
  },
  {
    id: "OS-2095",
    cliente: "Eduardo Nakamura",
    veiculo: "Honda Civic 1.5T",
    placa: "MNO-5P01",
    data: "22/06/2026",
    km: 22900,
    defeito: "Luz de injeção acesa.",
    status: "Aberta",
    mecanico: "—",
    itens: [{ tipo: "Serviço", descricao: "Diagnóstico eletrônico", qtd: 1, valor: 140 }],
    total: 140,
    observacoes: "Veículo na fila para diagnóstico.",
  },
  {
    id: "OS-2092",
    cliente: "João Mendes",
    veiculo: "VW Golf 1.4 TSI",
    placa: "ABC-1D23",
    data: "20/06/2026",
    km: 47000,
    defeito: "Troca de freios dianteiros.",
    status: "Finalizada",
    mecanico: "André Lima",
    itens: [
      { tipo: "Peça", descricao: "Kit pastilhas + discos", qtd: 1, valor: 620 },
      { tipo: "Serviço", descricao: "Mão de obra", qtd: 1, valor: 240 },
    ],
    total: 860,
    observacoes: "Pronto para retirada. Cliente avisado.",
  },
  {
    id: "OS-2088",
    cliente: "Cláudia Pereira",
    veiculo: "Fiat Argo 1.3",
    placa: "PQR-6S23",
    data: "18/06/2026",
    km: 39400,
    defeito: "Troca de óleo e filtros.",
    status: "Entregue",
    mecanico: "Carlos Andrade",
    itens: [
      { tipo: "Peça", descricao: "Óleo 5W30 + filtros", qtd: 1, valor: 210 },
      { tipo: "Serviço", descricao: "Mão de obra", qtd: 1, valor: 90 },
    ],
    total: 300,
    observacoes: "Entregue em 19/06.",
  },
];

export interface Agendamento {
  hora: string;
  cliente: string;
  veiculo: string;
  servico: string;
  status: "Confirmado" | "Aguardando";
}

export const agendaHoje: Agendamento[] = [
  { hora: "08:00", cliente: "Patrícia Lopes", veiculo: "Fiat Argo", servico: "Troca de óleo", status: "Confirmado" },
  { hora: "09:30", cliente: "Rafael Antunes", veiculo: "Corolla", servico: "Revisão", status: "Confirmado" },
  { hora: "11:00", cliente: "Marina Schmidt", veiculo: "HB20", servico: "Diagnóstico", status: "Aguardando" },
  { hora: "14:00", cliente: "Eduardo Nakamura", veiculo: "Civic", servico: "Alinhamento", status: "Confirmado" },
  { hora: "16:30", cliente: "João Mendes", veiculo: "Golf", servico: "Revisão", status: "Aguardando" },
];

export interface Produto {
  id: string;
  produto: string;
  marca: string;
  codigo: string;
  qtd: number;
  minimo: number;
  preco?: number | null;
  movs?: number; // nº de movimentações (para o confirm de exclusão)
}

export const estoque: Produto[] = [
  { id: "p1", produto: "Óleo 5W30 sintético", marca: "Motul", codigo: "OL-5W30", qtd: 28, minimo: 10 },
  { id: "p2", produto: "Filtro de óleo", marca: "Tecfil", codigo: "FO-220", qtd: 6, minimo: 12 },
  { id: "p3", produto: "Pastilha de freio dianteira", marca: "Bosch", codigo: "PF-D14", qtd: 9, minimo: 8 },
  { id: "p4", produto: "Filtro de ar", marca: "Mann", codigo: "FA-118", qtd: 4, minimo: 10 },
  { id: "p5", produto: "Vela de ignição", marca: "NGK", codigo: "VL-IRI", qtd: 40, minimo: 16 },
  { id: "p6", produto: "Fluido de freio DOT4", marca: "Bosch", codigo: "FF-DOT4", qtd: 7, minimo: 6 },
  { id: "p7", produto: "Correia dentada", marca: "Gates", codigo: "CD-099", qtd: 3, minimo: 5 },
];

export const financeiro = {
  receitas: [
    { fonte: "Serviços (mão de obra)", valor: 48200 },
    { fonte: "Venda de peças", valor: 30250 },
  ],
  despesas: [
    { fonte: "Compra de peças", valor: 21400 },
    { fonte: "Salários", valor: 18600 },
    { fonte: "Aluguel", valor: 6500 },
    { fonte: "Impostos", valor: 7200 },
  ],
};

export const relatorios = {
  servicosMaisVendidos: [
    { servico: "Troca de óleo", qtd: 142, receita: 25560 },
    { servico: "Revisão completa", qtd: 64, receita: 41600 },
    { servico: "Freios", qtd: 51, receita: 30600 },
    { servico: "Alinhamento", qtd: 88, receita: 13200 },
    { servico: "Diagnóstico", qtd: 73, receita: 10220 },
  ],
  clientesMaisAtivos: [
    { nome: "Rafael Antunes", os: 14, gasto: 9140 },
    { nome: "Eduardo Nakamura", os: 9, gasto: 6720 },
    { nome: "João Mendes", os: 8, gasto: 4820 },
    { nome: "Marina Schmidt", os: 5, gasto: 2310 },
  ],
  revisoesPendentes: [
    { modelo: "Toyota Corolla 2.0", placa: "GHI-3J67", proprietario: "Rafael Antunes", quando: "Vencida há 24 dias" },
    { modelo: "Honda Civic 1.5T", placa: "MNO-5P01", proprietario: "Eduardo Nakamura", quando: "Vencida há 4 dias" },
  ],
};

export function getOrdem(id: string) {
  return ordens.find((o) => o.id === id);
}
export function getCliente(id: string) {
  return clientes.find((c) => c.id === id);
}
export function getVeiculoAdmin(id: string) {
  return veiculosAdmin.find((v) => v.id === id);
}

export const osBadgeClass: Record<StatusOS, string> = {
  Aberta: "osb osb-aberta",
  "Aguardando aprovação": "osb osb-aguardando",
  "Em execução": "osb osb-execucao",
  Finalizada: "osb osb-finalizada",
  Entregue: "osb osb-entregue",
};
