// Fonte única de verdade do PROTÓTIPO do app do cliente. Tudo aqui é fictício.
// Quando o backend chegar (TiDB + Prisma), troca-se este arquivo por queries
// e as telas seguem iguais, pois consomem por props/imports.

export type Categoria =
  | "oleo"
  | "freio"
  | "filtro"
  | "revisao"
  | "suspensao"
  | "eletrica"
  | "pneus"
  | "bateria"
  | "geral";

export type StatusAgendamento =
  | "Agendado"
  | "Confirmado"
  | "Em andamento"
  | "Finalizado";

export type StatusOrcamento = "pendente" | "aprovado" | "rejeitado";

export type StatusManutencao = "ok" | "proxima" | "vencida";

export interface Manutencao {
  item: string;
  quando: string;
  status: StatusManutencao;
}

export interface Veiculo {
  id: string;
  marca: string;
  marcaCurta: string;
  modelo: string;
  ano: number;
  versao: string;
  cor: string;
  placa: string;
  renavam: string;
  chassi: string;
  combustivel: string;
  km: number;
  proximaRevisao: { faltamKm: number; data: string; progresso: number };
  proximasManutencoes: Manutencao[];
  /** classe utilitária de gradiente p/ o card (sem asset de recorte do carro) */
  gradiente: string;
}

export interface Reparo {
  id: string;
  nome: string;
  data: string;
  valor: number;
  categoria: Categoria;
}

export interface OrdemServico {
  id: string;
  veiculoId: string;
  veiculoNome: string;
  servico: string;
  data: string;
  km: number;
  valor: number;
  garantia: string;
  responsavel: string;
  categoria: Categoria;
  status: "Entregue" | "Finalizada";
  fotos: { src: string; etapa: "Antes" | "Durante" | "Depois" }[];
}

export interface Agendamento {
  id: string;
  veiculoNome: string;
  servico: string;
  data: string;
  hora: string;
  status: StatusAgendamento;
}

export interface ItemOrcamento {
  nome: string;
  qtd: number;
  valor: number;
}

export interface Orcamento {
  id: string;
  veiculoNome: string;
  data: string;
  status: StatusOrcamento;
  pecas: ItemOrcamento[];
  servicos: { descricao: string; valor: number }[];
  subtotal: number;
  desconto: number;
  total: number;
}

export interface Notificacao {
  id: string;
  tipo: Categoria | "promo" | "ipva" | "licenciamento";
  titulo: string;
  texto: string;
  quando: string;
  lido: boolean;
}

export const cliente = {
  nome: "João Mendes",
  primeiroNome: "João",
  iniciais: "JM",
  cpf: "123.456.789-00",
  telefone: "(41) 99999-0000",
  whatsapp: "(41) 99999-0000",
  email: "joao.mendes@email.com",
  endereco: "Rua das Araucárias, 320 — Uberaba, Curitiba/PR",
};

export const veiculos: Veiculo[] = [
  {
    id: "golf",
    marca: "Volkswagen",
    marcaCurta: "VW",
    modelo: "Golf 1.4 TSI",
    ano: 2018,
    versao: "Comfortline",
    cor: "Cinza Platinum",
    placa: "ABC-1D23",
    renavam: "0123456789-0",
    chassi: "9BWZZZ377VT004251",
    combustivel: "Flex",
    km: 47250,
    proximaRevisao: { faltamKm: 3250, data: "25/07/2026", progresso: 0.62 },
    gradiente: "grad-blue",
    proximasManutencoes: [
      { item: "Troca de óleo", quando: "Em 3.250 km", status: "proxima" },
      { item: "Filtro de ar", quando: "Em 3.250 km", status: "proxima" },
      { item: "Freios dianteiros", quando: "Em 12.000 km", status: "ok" },
      { item: "Bateria", quando: "Trocada há 8 meses", status: "ok" },
      { item: "Correia dentada", quando: "Vencida — revisar", status: "vencida" },
      { item: "Pneus", quando: "Rodízio em 2.000 km", status: "proxima" },
    ],
  },
  {
    id: "onix",
    marca: "Chevrolet",
    marcaCurta: "Chevrolet",
    modelo: "Onix 1.0 Turbo",
    ano: 2021,
    versao: "LTZ",
    cor: "Branco Summit",
    placa: "DEF-2G45",
    renavam: "0987654321-0",
    chassi: "9BGKS48U0MG112233",
    combustivel: "Flex",
    km: 31800,
    proximaRevisao: { faltamKm: 8600, data: "12/11/2026", progresso: 0.3 },
    gradiente: "grad-steel",
    proximasManutencoes: [
      { item: "Troca de óleo", quando: "Em 8.600 km", status: "ok" },
      { item: "Filtro de cabine", quando: "Em 5.000 km", status: "ok" },
      { item: "Freios dianteiros", quando: "Em 4.000 km", status: "proxima" },
      { item: "Bateria", quando: "Em dia", status: "ok" },
      { item: "Alinhamento", quando: "Recomendado agora", status: "proxima" },
      { item: "Pneus", quando: "Em dia", status: "ok" },
    ],
  },
];

export const reparosRecentes: Reparo[] = [
  { id: "r1", nome: "Troca de óleo do motor", data: "15/04/2026", valor: 180, categoria: "oleo" },
  { id: "r2", nome: "Pastilhas de freio dianteiras", data: "02/04/2026", valor: 320, categoria: "freio" },
  { id: "r3", nome: "Troca do filtro de ar", data: "02/04/2026", valor: 85, categoria: "filtro" },
];

export const ordensServico: OrdemServico[] = [
  {
    id: "OS-2041",
    veiculoId: "golf",
    veiculoNome: "Golf 1.4 TSI",
    servico: "Troca de óleo do motor + filtro de óleo",
    data: "15/04/2026",
    km: 44000,
    valor: 180,
    garantia: "6 meses",
    responsavel: "Carlos Andrade",
    categoria: "oleo",
    status: "Entregue",
    fotos: [
      { src: "/images/real-diagnostic.jpg", etapa: "Antes" },
      { src: "/images/real-garage.jpg", etapa: "Depois" },
    ],
  },
  {
    id: "OS-2032",
    veiculoId: "golf",
    veiculoNome: "Golf 1.4 TSI",
    servico: "Pastilhas de freio dianteiras + filtro de ar",
    data: "02/04/2026",
    km: 43200,
    valor: 405,
    garantia: "3 meses",
    responsavel: "André Lima",
    categoria: "freio",
    status: "Entregue",
    fotos: [
      { src: "/images/real-garage.jpg", etapa: "Antes" },
      { src: "/images/real-diagnostic.jpg", etapa: "Durante" },
    ],
  },
  {
    id: "OS-1998",
    veiculoId: "onix",
    veiculoNome: "Onix 1.0 Turbo",
    servico: "Alinhamento e balanceamento das 4 rodas",
    data: "20/02/2026",
    km: 28800,
    valor: 260,
    garantia: "1 ano",
    responsavel: "Carlos Andrade",
    categoria: "suspensao",
    status: "Entregue",
    fotos: [{ src: "/images/real-diagnostic.jpg", etapa: "Durante" }],
  },
  {
    id: "OS-1975",
    veiculoId: "golf",
    veiculoNome: "Golf 1.4 TSI",
    servico: "Diagnóstico eletrônico — luz de injeção",
    data: "08/01/2026",
    km: 41500,
    valor: 140,
    garantia: "—",
    responsavel: "André Lima",
    categoria: "eletrica",
    status: "Entregue",
    fotos: [{ src: "/images/real-diagnostic.jpg", etapa: "Durante" }],
  },
];

export const agendamentos: Agendamento[] = [
  { id: "a1", veiculoNome: "Golf 1.4 TSI", servico: "Revisão completa", data: "28/06/2026", hora: "09:00", status: "Confirmado" },
  { id: "a2", veiculoNome: "Onix 1.0 Turbo", servico: "Troca de óleo", data: "05/07/2026", hora: "14:30", status: "Agendado" },
  { id: "a3", veiculoNome: "Golf 1.4 TSI", servico: "Alinhamento", data: "10/06/2026", hora: "10:00", status: "Finalizado" },
];

export const orcamentos: Orcamento[] = [
  {
    id: "ORC-318",
    veiculoNome: "Golf 1.4 TSI",
    data: "20/06/2026",
    status: "pendente",
    pecas: [
      { nome: "Kit pastilhas dianteiras", qtd: 1, valor: 240 },
      { nome: "Disco de freio ventilado (par)", qtd: 1, valor: 380 },
      { nome: "Fluido de freio DOT4", qtd: 1, valor: 45 },
    ],
    servicos: [
      { descricao: "Mão de obra — troca de freios", valor: 180 },
      { descricao: "Sangria do sistema de freio", valor: 60 },
    ],
    subtotal: 905,
    desconto: 55,
    total: 850,
  },
  {
    id: "ORC-309",
    veiculoNome: "Onix 1.0 Turbo",
    data: "08/06/2026",
    status: "aprovado",
    pecas: [
      { nome: "Óleo 5W30 sintético (4 L)", qtd: 1, valor: 160 },
      { nome: "Filtro de óleo", qtd: 1, valor: 35 },
    ],
    servicos: [{ descricao: "Mão de obra — troca de óleo", valor: 80 }],
    subtotal: 275,
    desconto: 0,
    total: 275,
  },
  {
    id: "ORC-298",
    veiculoNome: "Golf 1.4 TSI",
    data: "21/05/2026",
    status: "rejeitado",
    pecas: [{ nome: "Amortecedor dianteiro (par)", qtd: 1, valor: 760 }],
    servicos: [{ descricao: "Mão de obra — suspensão dianteira", valor: 240 }],
    subtotal: 1000,
    desconto: 0,
    total: 1000,
  },
];

export const notificacoes: Notificacao[] = [
  { id: "n1", tipo: "oleo", titulo: "Troca de óleo próxima", texto: "Seu Golf está a 3.250 km da próxima troca de óleo.", quando: "há 2 h", lido: false },
  { id: "n2", tipo: "revisao", titulo: "Revisão em 30 dias", texto: "Faltam 30 dias para a revisão recomendada do Golf 1.4 TSI.", quando: "ontem", lido: false },
  { id: "n3", tipo: "promo", titulo: "Troca de óleo com 10% OFF", texto: "Promoção válida até 30/06. Agende direto pelo app.", quando: "há 3 dias", lido: true },
  { id: "n4", tipo: "ipva", titulo: "IPVA 2026", texto: "Lembrete: 3ª parcela do IPVA vence em 10/07.", quando: "há 5 dias", lido: true },
  { id: "n5", tipo: "licenciamento", titulo: "Licenciamento", texto: "O licenciamento do Onix vence neste mês.", quando: "há 1 semana", lido: true },
];

export const catalogoServicos: { nome: string; categoria: Categoria }[] = [
  { nome: "Troca de óleo", categoria: "oleo" },
  { nome: "Revisão completa", categoria: "revisao" },
  { nome: "Freios", categoria: "freio" },
  { nome: "Suspensão", categoria: "suspensao" },
  { nome: "Elétrica", categoria: "eletrica" },
  { nome: "Alinhamento", categoria: "suspensao" },
  { nome: "Balanceamento", categoria: "pneus" },
  { nome: "Diagnóstico", categoria: "geral" },
];

// horários fictícios para o passo "horário" do agendamento
export const horariosDisponiveis = ["08:00", "09:00", "10:30", "13:30", "15:00", "16:30"];

export type TipoDocumento =
  | "Nota fiscal"
  | "Garantia"
  | "Orçamento"
  | "Ordem de serviço"
  | "Comprovante";

export interface Documento {
  id: string;
  nome: string;
  tipo: TipoDocumento;
  data: string;
}

export const documentos: Documento[] = [
  { id: "d1", nome: "NF-e 2041 — Troca de óleo do motor", tipo: "Nota fiscal", data: "15/04/2026" },
  { id: "d6", nome: "NF-e 2032 — Freios + filtro de ar", tipo: "Nota fiscal", data: "02/04/2026" },
  { id: "d2", nome: "Garantia — Pastilhas de freio (3 meses)", tipo: "Garantia", data: "02/04/2026" },
  { id: "d7", nome: "Garantia — Alinhamento (1 ano)", tipo: "Garantia", data: "20/02/2026" },
  { id: "d3", nome: "Orçamento ORC-318 — Freios", tipo: "Orçamento", data: "20/06/2026" },
  { id: "d4", nome: "OS-2041 — Relatório do serviço", tipo: "Ordem de serviço", data: "15/04/2026" },
  { id: "d5", nome: "Comprovante de pagamento — PIX", tipo: "Comprovante", data: "15/04/2026" },
];

export function getVeiculo(id: string) {
  return veiculos.find((v) => v.id === id);
}
export function getOrcamento(id: string) {
  return orcamentos.find((o) => o.id === id);
}
export function getOrdemServico(id: string) {
  return ordensServico.find((o) => o.id === id);
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
