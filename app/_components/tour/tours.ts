// Passos dos tutoriais guiados de cada área. Um tour por página.
// `sel` aponta para um elemento real na tela (spotlight); sem `sel`, o passo
// vira um cartão central explicando a função. Vários seletores = usa o
// primeiro que estiver visível.

export type TourTheme = "app" | "oficina" | "mecanico";

export interface TourStep {
  title: string;
  body: string;
  sel?: string | string[];
}

export interface Tour {
  id: string;
  label: string;
  steps: TourStep[];
}

interface Entry {
  path: string; // prefixo da rota
  exact?: boolean; // casa só a rota exata (ex.: raiz da área)
  tour: Tour;
}

// ————————————————————————————————————————————————————————————
// OFICINA (Administrador)
// ————————————————————————————————————————————————————————————
const oficina: Entry[] = [
  {
    path: "/oficina",
    exact: true,
    tour: {
      id: "oficina-dashboard",
      label: "Painel da oficina",
      steps: [
        {
          title: "Bem-vindo ao Painel da Oficina 👋",
          body: "Este é o centro de controle do negócio. Vou te mostrar rapidinho o que cada parte faz. Você pode reabrir este tutorial a qualquer momento no botão 'Tutorial'.",
        },
        {
          title: "Menu de navegação",
          body: "Por aqui você acessa todas as áreas: Clientes, Veículos, Ordens de Serviço, Agenda, Estoque, Financeiro, Relatórios e Configurações.",
          sel: ['[data-tour="adm-nav"]', '[data-tour="adm-menu"]'],
        },
        {
          title: "Indicadores do negócio",
          body: "No topo você vê os números do momento: total de clientes, veículos, ordens abertas e o faturamento do mês.",
          sel: '[data-tour="adm-kpis"]',
        },
        {
          title: "Faturamento por mês",
          body: "O gráfico mostra a evolução do faturamento nos últimos meses, pra você acompanhar o crescimento.",
          sel: '[data-tour="adm-chart"]',
        },
        {
          title: "Dar entrada de veículo",
          body: "Atalho rápido para receber um carro na oficina: faz a vistoria de entrada e já abre a ordem de serviço.",
          sel: 'a[href="/oficina/entrada"]',
        },
      ],
    },
  },
  {
    path: "/oficina/clientes/novo",
    tour: {
      id: "oficina-clientes-novo",
      label: "Novo cliente",
      steps: [
        {
          title: "Cadastrar cliente",
          body: "Preencha os dados do cliente (nome, CPF, contato, cidade e endereço) e salve. Ele passa a aparecer na lista e pode ter veículos e ordens vinculados.",
          sel: '[data-tour="adm-form"]',
        },
      ],
    },
  },
  {
    path: "/oficina/clientes",
    tour: {
      id: "oficina-clientes",
      label: "Clientes",
      steps: [
        {
          title: "Sua carteira de clientes",
          body: "Aqui ficam todos os clientes cadastrados, com telefone, cidade, quantos veículos têm e quanto já gastaram.",
        },
        {
          title: "Abrir um cliente",
          body: "Clique em qualquer cliente para ver a ficha completa: contato, veículos e histórico de ordens de serviço.",
        },
        {
          title: "Novo cliente",
          body: "Use este botão para cadastrar um cliente novo.",
          sel: 'a[href="/oficina/clientes/novo"]',
        },
      ],
    },
  },
  {
    path: "/oficina/veiculos/novo",
    tour: {
      id: "oficina-veiculos-novo",
      label: "Novo veículo",
      steps: [
        {
          title: "Cadastrar veículo",
          body: "Escolha o proprietário e informe modelo, placa, ano, km, combustível e cor. O veículo fica vinculado ao cliente para agendamentos, ordens e lembretes.",
          sel: '[data-tour="adm-form"]',
        },
      ],
    },
  },
  {
    path: "/oficina/veiculos",
    tour: {
      id: "oficina-veiculos",
      label: "Veículos",
      steps: [
        {
          title: "Todos os veículos",
          body: "Lista dos carros cadastrados com proprietário, placa, ano, km e a próxima revisão. Revisões vencidas aparecem em destaque.",
        },
        {
          title: "Ficha do veículo",
          body: "Ao abrir um veículo você vê as próximas manutenções (com semáforo) e pode definir a data-base de óleo/revisão, que liga os lembretes automáticos.",
        },
        {
          title: "Novo veículo",
          body: "Cadastre um carro novo por aqui, sempre vinculado a um cliente.",
          sel: 'a[href="/oficina/veiculos/novo"]',
        },
      ],
    },
  },
  {
    path: "/oficina/ordens/nova",
    tour: {
      id: "oficina-ordens-nova",
      label: "Nova OS",
      steps: [
        {
          title: "Criar ordem de serviço",
          body: "Escolha cliente e veículo, informe km e o defeito relatado, e adicione os itens (peças e serviços) com quantidade e valor — o total é calculado automaticamente.",
          sel: '[data-tour="adm-neworder"]',
        },
      ],
    },
  },
  {
    path: "/oficina/ordens",
    tour: {
      id: "oficina-ordens",
      label: "Ordens de Serviço",
      steps: [
        {
          title: "Ordens de Serviço",
          body: "O coração da oficina. Aqui ficam todas as OS, com status, cliente, veículo e valor.",
        },
        {
          title: "Abrir uma OS",
          body: "Ao abrir uma ordem você controla o ciclo completo: enviar orçamento, iniciar execução, finalizar (dá baixa no estoque), registrar entrega e pagamento, atribuir mecânico e gerar o PDF.",
        },
        {
          title: "Nova OS",
          body: "Cria uma ordem manualmente.",
          sel: 'a[href="/oficina/ordens/nova"]',
        },
        {
          title: "Dar entrada",
          body: "Prefere receber o carro com vistoria? Use 'Dar entrada' para abrir a OS já com o check-in completo.",
          sel: 'a[href="/oficina/entrada"]',
        },
      ],
    },
  },
  {
    path: "/oficina/entrada",
    tour: {
      id: "oficina-entrada",
      label: "Entrada de veículo",
      steps: [
        {
          title: "Check-in do veículo",
          body: "Selecione cliente e veículo, informe o km e o nível de combustível na entrada e descreva o defeito relatado.",
          sel: '[data-tour="adm-entrada"]',
        },
        {
          title: "Vistoria de entrada",
          body: "Marque a condição dos itens (OK / Atenção / Avaria), registre avarias e objetos deixados no carro, e a autorização do cliente. Ao confirmar, a OS é aberta com essa vistoria.",
          sel: '[data-tour="adm-entrada"]',
        },
      ],
    },
  },
  {
    path: "/oficina/agenda",
    tour: {
      id: "oficina-agenda",
      label: "Agenda",
      steps: [
        {
          title: "Agenda da oficina",
          body: "Veja todos os agendamentos por data e horário.",
        },
        {
          title: "Novo agendamento",
          body: "Crie um agendamento informando data, hora, status, cliente, veículo e o serviço.",
          sel: '[data-tour="adm-agenda"]',
        },
      ],
    },
  },
  {
    path: "/oficina/estoque",
    tour: {
      id: "oficina-estoque",
      label: "Estoque",
      steps: [
        {
          title: "Controle de estoque",
          body: "Lista de peças e produtos com quantidade e estoque mínimo. Itens abaixo do mínimo ganham alerta.",
          sel: '[data-tour="adm-stock"]',
        },
        {
          title: "Entradas e saídas",
          body: "Use os botões + e − para dar entrada ou saída manual, e cadastre novos produtos. Quando uma OS é finalizada, a baixa das peças é automática.",
          sel: '[data-tour="adm-stock"]',
        },
        {
          title: "Histórico de movimentações",
          body: "Toda entrada e saída fica registrada aqui (inclusive as baixas por OS), com motivo, quantidade e quem movimentou.",
          sel: '[data-tour="adm-stock-history"]',
        },
      ],
    },
  },
  {
    path: "/oficina/financeiro",
    tour: {
      id: "oficina-financeiro",
      label: "Financeiro",
      steps: [
        {
          title: "Financeiro",
          body: "Acompanhe receitas, despesas e saldo por período (este mês, 30 dias ou tudo).",
          sel: '[data-tour="adm-finance"]',
        },
        {
          title: "Novo lançamento",
          body: "Registre uma receita ou despesa, com categoria e valor. As receitas de OS entregues e pagas entram aqui automaticamente.",
          sel: '[data-tour="adm-finance"]',
        },
      ],
    },
  },
  {
    path: "/oficina/relatorios",
    tour: {
      id: "oficina-relatorios",
      label: "Relatórios",
      steps: [
        {
          title: "Relatórios",
          body: "Visão gerencial: serviços mais vendidos, clientes mais ativos e revisões pendentes — para decidir com base em dados.",
        },
      ],
    },
  },
  {
    path: "/oficina/configuracoes",
    tour: {
      id: "oficina-configuracoes",
      label: "Configurações",
      steps: [
        {
          title: "Configurações",
          body: "Edite os dados da oficina (nome, endereço, telefone, WhatsApp) e ligue/desligue os avisos automáticos: troca de óleo, revisão, IPVA e promoções.",
          sel: '[data-tour="adm-settings"]',
        },
        {
          title: "Equipe",
          body: "Aqui você também vê os usuários do sistema e seus papéis (administrador, mecânico).",
        },
      ],
    },
  },
];

// ————————————————————————————————————————————————————————————
// APP DO CLIENTE
// ————————————————————————————————————————————————————————————
const app: Entry[] = [
  {
    path: "/app",
    exact: true,
    tour: {
      id: "app-inicio",
      label: "Início",
      steps: [
        {
          title: "Bem-vindo ao seu app 🚗",
          body: "Aqui você acompanha seu carro, agenda serviços e fala com a oficina. Vou te mostrar o essencial — dá pra rever no botão 'Tutorial' quando quiser.",
        },
        {
          title: "Seu carro na oficina",
          body: "Quando seu veículo estiver em serviço, o status aparece aqui no topo (recebido, orçamento, em serviço, pronto).",
        },
        {
          title: "Ações rápidas",
          body: "Atalhos para agendar serviço, pedir orçamento e marcar troca de pneus ou bateria.",
          sel: '[data-tour="app-quick"]',
        },
        {
          title: "Menu de baixo",
          body: "Use a barra de baixo para navegar entre Início, Veículos, Serviços e Perfil. O menu ☰ no topo abre todas as opções.",
          sel: ['[data-tour="app-bottomnav"]', '[data-tour="app-menu"]'],
        },
      ],
    },
  },
  {
    path: "/app/veiculos",
    tour: {
      id: "app-veiculos",
      label: "Meus veículos",
      steps: [
        {
          title: "Meus veículos",
          body: "Todos os seus carros ficam aqui. Toque em um para ver a ficha completa, as próximas manutenções (com semáforo) e o histórico de serviços.",
        },
      ],
    },
  },
  {
    path: "/app/agendar",
    tour: {
      id: "app-agendar",
      label: "Agendar",
      steps: [
        {
          title: "Agendar um serviço",
          body: "Em poucos passos você escolhe o veículo, o serviço, a data e o horário. A confirmação chega pelo WhatsApp.",
          sel: '[data-tour="app-booking"]',
        },
      ],
    },
  },
  {
    path: "/app/solicitar",
    tour: {
      id: "app-solicitar",
      label: "Solicitar orçamento",
      steps: [
        {
          title: "Pedir um orçamento",
          body: "Escolha o veículo e descreva o que precisa. A oficina recebe o pedido na hora e te retorna com o orçamento.",
          sel: '[data-tour="app-solicitar"]',
        },
      ],
    },
  },
  {
    path: "/app/orcamentos",
    tour: {
      id: "app-orcamentos",
      label: "Orçamentos",
      steps: [
        {
          title: "Seus orçamentos",
          body: "Veja os orçamentos recebidos com peças, serviços e valor total. Ao abrir um orçamento pendente, você pode aprovar ou recusar direto pelo app.",
        },
      ],
    },
  },
  {
    path: "/app/acompanhar",
    tour: {
      id: "app-acompanhar",
      label: "Acompanhar",
      steps: [
        {
          title: "Acompanhar o serviço",
          body: "Uma barra de progresso mostra em que etapa seu carro está: recebido → orçamento → em serviço → pronto → entregue.",
        },
      ],
    },
  },
  {
    path: "/app/historico",
    tour: {
      id: "app-historico",
      label: "Histórico",
      steps: [
        {
          title: "Histórico de serviços",
          body: "Tudo que já foi feito nos seus carros, com data, valor, garantia e fotos do serviço. Filtre por veículo se tiver mais de um.",
        },
      ],
    },
  },
  {
    path: "/app/documentos",
    tour: {
      id: "app-documentos",
      label: "Documentos",
      steps: [
        {
          title: "Seus documentos",
          body: "Notas fiscais, garantias, orçamentos e ordens de serviço reunidos por tipo, prontos para consultar.",
        },
      ],
    },
  },
  {
    path: "/app/notificacoes",
    tour: {
      id: "app-notificacoes",
      label: "Notificações",
      steps: [
        {
          title: "Notificações",
          body: "Avisos da oficina e lembretes automáticos de troca de óleo, revisão e IPVA. Toque para marcar como lida ou use 'Marcar todas'.",
        },
      ],
    },
  },
  {
    path: "/app/servicos",
    tour: {
      id: "app-servicos",
      label: "Serviços",
      steps: [
        {
          title: "Catálogo de serviços",
          body: "Veja os serviços que a oficina oferece. Tocar em um serviço já te leva para o agendamento.",
        },
      ],
    },
  },
  {
    path: "/app/perfil",
    tour: {
      id: "app-perfil",
      label: "Perfil",
      steps: [
        {
          title: "Seu perfil",
          body: "Aqui ficam seus dados. Você pode editá-los e instalar o app na tela inicial do celular.",
        },
        {
          title: "Ativar notificações",
          body: "Ligue as notificações para receber no celular os lembretes de manutenção do seu carro.",
          sel: '[data-tour="app-push"]',
        },
      ],
    },
  },
];

// ————————————————————————————————————————————————————————————
// MECÂNICO
// ————————————————————————————————————————————————————————————
const mecanico: Entry[] = [
  {
    path: "/mecanico",
    exact: true,
    tour: {
      id: "mec-lista",
      label: "Minhas ordens",
      steps: [
        {
          title: "Área do mecânico 🔧",
          body: "Aqui aparecem só as ordens de serviço atribuídas a você. Toque em uma para abrir e trabalhar nela.",
        },
        {
          title: "Cada card é uma OS",
          body: "Mostra o veículo, o cliente, a placa e o defeito relatado. Abra para registrar o serviço.",
        },
      ],
    },
  },
  {
    path: "/mecanico/",
    tour: {
      id: "mec-os",
      label: "Ordem de serviço",
      steps: [
        {
          title: "Ordem de serviço",
          body: "Esta é a tela onde você registra tudo do serviço. Vou mostrar cada parte.",
        },
        {
          title: "Status do serviço",
          body: "Avance o status conforme o trabalho anda (aberta → em execução → finalizada).",
          sel: '[data-tour="mec-status"]',
        },
        {
          title: "Vistoria técnica",
          body: "Marque a condição de cada item (motor, freios, suspensão, pneus, óleo, elétrica…) como OK, Atenção ou Avaria, e salve.",
          sel: '[data-tour="mec-vistoria"]',
        },
        {
          title: "Peças e serviços",
          body: "Adicione as peças trocadas e os serviços feitos, com valor. Dá para vincular a peça ao estoque.",
          sel: '[data-tour="mec-itens"]',
        },
        {
          title: "Fotos da OS",
          body: "Tire ou envie fotos do serviço direto do celular — elas ficam registradas na ordem.",
          sel: '[data-tour="mec-fotos"]',
        },
        {
          title: "Observações",
          body: "Escreva o que foi feito, peças trocadas e recomendações. Depois é só salvar.",
          sel: '[data-tour="mec-obs"]',
        },
      ],
    },
  },
];

const REGISTRY: Record<TourTheme, Entry[]> = { app, oficina, mecanico };

// Escolhe o tour cujo prefixo casa e é o mais específico (mais longo).
export function resolveTour(theme: TourTheme, path: string): Tour | null {
  const entries = REGISTRY[theme];
  let best: Entry | null = null;
  for (const e of entries) {
    const ok = e.exact ? path === e.path : path.startsWith(e.path);
    if (!ok) continue;
    if (!best || e.path.length > best.path.length) best = e;
  }
  return best?.tour ?? null;
}
