// Passos dos tutoriais guiados de cada área. Um tour por página.
// `sel` aponta para um elemento real na tela (spotlight); sem `sel`, o passo
// vira um cartão central explicando a função/fluxo. Vários seletores = usa o
// primeiro que estiver visível.
//
// Os IDs terminam em "-v2": ao mudar o conteúdo, mudamos o ID para que o
// tutorial melhorado abra de novo automaticamente na próxima visita.

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
      id: "oficina-dashboard-v2",
      label: "Painel da oficina",
      steps: [
        {
          title: "Bem-vindo ao Painel da Oficina 👋",
          body: "Este é o computador de bordo do negócio. Se você nunca usou, comece por aqui: em 1 minuto eu explico COMO o sistema funciona por inteiro. Use 'Voltar' e 'Próximo' para navegar.",
        },
        {
          title: "Primeiro, entenda o fluxo 🔄",
          body: "Todo serviço percorre sempre o mesmo caminho. Guarde estas 7 etapas — o resto do sistema é só isto na prática:",
        },
        {
          title: "Etapa 1 e 2 — Cadastro e entrada",
          body: "1) O cliente e o carro dele ficam cadastrados (menu Clientes e Veículos). 2) Quando o carro chega, você 'dá entrada': faz a vistoria e o sistema já abre a Ordem de Serviço (OS).",
        },
        {
          title: "Etapa 3 e 4 — Orçamento e aprovação",
          body: "3) Na OS você lança as peças e serviços. 4) Envia o orçamento; o cliente recebe no app dele e aprova (ou recusa). Você vê a resposta na hora, dentro da OS.",
        },
        {
          title: "Etapa 5, 6 e 7 — Executar, finalizar, entregar",
          body: "5) O mecânico executa. 6) Você finaliza — e o estoque das peças baixa SOZINHO. 7) Registra a entrega e o pagamento — e a receita entra no financeiro SOZINHA. Pronto, ciclo completo.",
        },
        {
          title: "O menu é o seu mapa",
          body: "Cada etapa do fluxo tem sua tela aqui no menu: Clientes, Veículos, Ordens de Serviço, Agenda, Estoque, Financeiro, Relatórios e Configurações. E cada tela tem o próprio tutorial.",
          sel: ['[data-tour="adm-nav"]', '[data-tour="adm-menu"]'],
        },
        {
          title: "Os números do dia",
          body: "No topo, um resumo instantâneo: quantos clientes e veículos você tem, quantas OS estão abertas e quanto já faturou no mês.",
          sel: '[data-tour="adm-kpis"]',
        },
        {
          title: "Faturamento mês a mês",
          body: "O gráfico mostra a evolução do faturamento. Serve pra ver se o mês está melhor ou pior que os anteriores, de relance.",
          sel: '[data-tour="adm-chart"]',
        },
        {
          title: "Comece por aqui na prática 👇",
          body: "Recebeu um carro? Clique em 'Dar entrada de veículo'. Ele faz a vistoria e já abre a OS — é o ponto de partida do fluxo que acabei de explicar.",
          sel: 'a[href="/oficina/entrada"]',
        },
        {
          title: "Dica: reabrir este tutorial",
          body: "Sempre que quiser rever o passo a passo de QUALQUER tela, clique em 'Tutorial desta tela' no menu à esquerda (ou no botão flutuante). Bons serviços! 🔧",
        },
      ],
    },
  },
  {
    path: "/oficina/clientes/novo",
    tour: {
      id: "oficina-clientes-novo-v2",
      label: "Novo cliente",
      steps: [
        {
          title: "Cadastrando um cliente",
          body: "Este é o passo 1 do fluxo. Só o nome é obrigatório, mas preencha telefone/WhatsApp e e-mail: é por eles que o cliente recebe avisos e acessa o app.",
          sel: '[data-tour="adm-form"]',
        },
        {
          title: "Depois de salvar",
          body: "Ao salvar, o cliente aparece na lista. O próximo passo é cadastrar o carro dele em 'Veículos' — aí você já pode dar entrada e abrir ordens.",
          sel: '[data-tour="adm-form"]',
        },
      ],
    },
  },
  {
    path: "/oficina/clientes",
    tour: {
      id: "oficina-clientes-v2",
      label: "Clientes",
      steps: [
        {
          title: "Sua carteira de clientes",
          body: "Aqui ficam todas as pessoas que já atendeu. Cada linha mostra telefone, cidade, quantos carros tem e quanto já gastou na oficina.",
        },
        {
          title: "Abrir a ficha de um cliente",
          body: "Clique em qualquer linha para ver tudo sobre a pessoa: contato, os carros dela e o histórico completo de ordens de serviço.",
        },
        {
          title: "Cadastrar cliente novo",
          body: "Chegou um cliente que ainda não existe no sistema? Comece por este botão. É sempre o primeiro passo antes de atender um carro.",
          sel: 'a[href="/oficina/clientes/novo"]',
        },
      ],
    },
  },
  {
    path: "/oficina/veiculos/novo",
    tour: {
      id: "oficina-veiculos-novo-v2",
      label: "Novo veículo",
      steps: [
        {
          title: "Cadastrando um veículo",
          body: "Escolha o dono (precisa já estar cadastrado em Clientes) e informe modelo, placa, ano e km. A placa é a identidade do carro no sistema.",
          sel: '[data-tour="adm-form"]',
        },
        {
          title: "Por que isto importa",
          body: "Com o carro cadastrado, o sistema calcula sozinho as próximas revisões e o IPVA, e passa a avisar o cliente. Ele também é usado em agendamentos e ordens.",
          sel: '[data-tour="adm-form"]',
        },
      ],
    },
  },
  {
    path: "/oficina/veiculos",
    tour: {
      id: "oficina-veiculos-v2",
      label: "Veículos",
      steps: [
        {
          title: "Todos os carros",
          body: "A garagem completa da oficina: cada veículo com dono, placa, ano, km e a próxima revisão. Os que estão com revisão vencida aparecem em destaque.",
        },
        {
          title: "Abrir a ficha do carro",
          body: "Clique num veículo para ver as próximas manutenções (com semáforo verde/amarelo/vermelho) e o histórico de serviços dele.",
        },
        {
          title: "O segredo dos lembretes",
          body: "Dentro da ficha você define a data da última troca de óleo e da última revisão. É isso que liga os avisos automáticos que o cliente recebe. Vale a pena preencher.",
        },
        {
          title: "Cadastrar veículo novo",
          body: "Novo carro de um cliente existente? Cadastre aqui, sempre vinculado ao dono.",
          sel: 'a[href="/oficina/veiculos/novo"]',
        },
      ],
    },
  },
  {
    path: "/oficina/ordens/nova",
    tour: {
      id: "oficina-ordens-nova-v2",
      label: "Nova OS",
      steps: [
        {
          title: "Criando uma Ordem de Serviço",
          body: "Use esta tela quando quiser abrir a OS direto, sem vistoria de entrada. (Se o carro está chegando agora, prefira 'Dar entrada'.)",
          sel: '[data-tour="adm-neworder"]',
        },
        {
          title: "Preencha de cima pra baixo",
          body: "1) Escolha o cliente e o veículo. 2) Informe o km atual e o defeito relatado. 3) Adicione as peças e serviços com quantidade e valor.",
          sel: '[data-tour="adm-neworder"]',
        },
        {
          title: "O total é automático",
          body: "Conforme você adiciona itens, o sistema soma tudo sozinho. Ao salvar, a OS entra na lista com status 'Aberta', pronta para virar orçamento.",
          sel: '[data-tour="adm-neworder"]',
        },
      ],
    },
  },
  {
    // Detalhe/controle de uma OS específica — a tela mais importante da operação.
    path: "/oficina/ordens/",
    tour: {
      id: "oficina-os-controle-v2",
      label: "Controle da OS",
      steps: [
        {
          title: "Esta é a tela que comanda o serviço",
          body: "Tudo que acontece com este carro é feito aqui, de cima pra baixo. Vou mostrar cada parte na ordem em que você vai usar.",
        },
        {
          title: "A régua de etapas",
          body: "Esta barra mostra em que ponto o serviço está: Aberta → Aguardando aprovação → Em execução → Finalizada → Entregue. O botão que aparece embaixo dela muda conforme a etapa atual.",
          sel: '[data-tour="os-stepper"]',
        },
        {
          title: "Avançar o serviço",
          body: "É sempre o mesmo lugar: 'Enviar orçamento' manda pro cliente aprovar; 'Finalizar' encerra o serviço e BAIXA O ESTOQUE das peças; 'Registrar entrega' pede o km de saída e o pagamento — e LANÇA A RECEITA no financeiro.",
          sel: '[data-tour="os-stepper"]',
        },
        {
          title: "Peças e serviços (o orçamento)",
          body: "Aqui você monta a conta: adicione cada peça e serviço com valor. Ao vincular uma peça ao estoque, é ela que vai baixar quando você finalizar. Este total é o que o cliente aprova.",
          sel: '[data-tour="os-itens"]',
        },
        {
          title: "Avisar o cliente e imprimir",
          body: "No rodapé: 'Avisar no WhatsApp' abre uma mensagem pronta pro cliente, e 'Gerar PDF' baixa a ordem de serviço com a marca da oficina, pra imprimir ou anexar.",
          sel: '[data-tour="os-footer"]',
        },
      ],
    },
  },
  {
    path: "/oficina/ordens",
    tour: {
      id: "oficina-ordens-v2",
      label: "Ordens de Serviço",
      steps: [
        {
          title: "O coração da oficina",
          body: "Cada carro que entra vira uma Ordem de Serviço (OS). Esta lista mostra todas, com o status atual (a etapa em que estão) e o valor.",
        },
        {
          title: "Entenda os status",
          body: "Uma OS caminha por: Aberta (recém-criada) → Aguardando aprovação (orçamento enviado) → Em execução (mecânico trabalhando) → Finalizada → Entregue. A cor do selo indica a etapa.",
        },
        {
          title: "Abrir uma OS",
          body: "Clique numa ordem para entrar na tela de controle — é lá que você envia orçamento, finaliza, entrega, atribui mecânico e gera o PDF.",
        },
        {
          title: "Dois jeitos de começar",
          body: "'Nova OS' cria a ordem direto. 'Dar entrada' recebe o carro com vistoria e abre a OS a partir dela. Para o dia a dia, 'Dar entrada' é o mais completo.",
          sel: ['a[href="/oficina/ordens/nova"]', 'a[href="/oficina/entrada"]'],
        },
      ],
    },
  },
  {
    path: "/oficina/entrada",
    tour: {
      id: "oficina-entrada-v2",
      label: "Entrada de veículo",
      steps: [
        {
          title: "Recebendo o carro (check-in)",
          body: "Esta é a porta de entrada do fluxo. Preencha de cima pra baixo — no fim, o sistema abre a Ordem de Serviço já com tudo registrado.",
          sel: '[data-tour="adm-entrada"]',
        },
        {
          title: "1) Quem e qual carro",
          body: "Selecione o cliente e o veículo. Depois informe o km de entrada e o nível de combustível — isso protege você e o cliente contra dúvidas depois.",
          sel: '[data-tour="adm-entrada"]',
        },
        {
          title: "2) O defeito relatado",
          body: "Escreva com as palavras do cliente o que ele está sentindo no carro. É o ponto de partida do diagnóstico do mecânico.",
          sel: '[data-tour="adm-entrada"]',
        },
        {
          title: "3) A vistoria",
          body: "Marque a condição de cada item como OK, Atenção ou Avaria, e anote arranhados/avarias e objetos deixados no carro. Isso vira o registro oficial do estado na entrada.",
          sel: '[data-tour="adm-entrada"]',
        },
        {
          title: "4) Autorização e confirmar",
          body: "Marque que o cliente autorizou e confirme. A OS nasce com status 'Aberta' e essa vistoria anexada — pronta para virar orçamento.",
          sel: '[data-tour="adm-entrada"]',
        },
      ],
    },
  },
  {
    path: "/oficina/agenda",
    tour: {
      id: "oficina-agenda-v2",
      label: "Agenda",
      steps: [
        {
          title: "A agenda da oficina",
          body: "Aqui você vê e organiza os horários. Aparecem tanto os agendamentos feitos pelos clientes no app quanto os que você mesmo criar.",
        },
        {
          title: "Criar um agendamento",
          body: "Informe data, hora, o cliente, o veículo e o serviço, e defina se está Confirmado ou Aguardando. Bom para encaixar quem liga ou passa na oficina.",
          sel: '[data-tour="adm-agenda"]',
        },
      ],
    },
  },
  {
    path: "/oficina/estoque",
    tour: {
      id: "oficina-estoque-v2",
      label: "Estoque",
      steps: [
        {
          title: "Controle de peças",
          body: "A prateleira digital da oficina: cada produto com a quantidade atual e o mínimo desejado. Quando algo fica abaixo do mínimo, ganha um alerta pra você repor.",
          sel: '[data-tour="adm-stock"]',
        },
        {
          title: "Dar entrada e saída",
          body: "Recebeu mercadoria? Use o + pra somar. Saída manual (quebra, uso interno)? Use o −. Também dá pra cadastrar um produto novo. Cada movimento é registrado.",
          sel: '[data-tour="adm-stock"]',
        },
        {
          title: "A mágica: baixa automática",
          body: "Você NÃO precisa dar baixa das peças usadas num serviço. Quando você finaliza uma OS, o sistema desconta do estoque sozinho as peças vinculadas àquela ordem.",
          sel: '[data-tour="adm-stock"]',
        },
        {
          title: "Tudo fica registrado",
          body: "Este histórico mostra cada entrada e saída — inclusive as baixas por OS — com motivo, quantidade e quem fez. É a sua auditoria de estoque.",
          sel: '[data-tour="adm-stock-history"]',
        },
      ],
    },
  },
  {
    path: "/oficina/financeiro",
    tour: {
      id: "oficina-financeiro-v2",
      label: "Financeiro",
      steps: [
        {
          title: "O caixa da oficina",
          body: "Aqui você vê quanto entrou (receitas), quanto saiu (despesas) e o saldo. Filtre por período: este mês, últimos 30 dias ou tudo.",
          sel: '[data-tour="adm-finance"]',
        },
        {
          title: "Receitas entram sozinhas",
          body: "Cada OS entregue e paga vira uma receita aqui automaticamente — você não lança de novo. Isso mantém o caixa fiel ao que aconteceu nos serviços.",
          sel: '[data-tour="adm-finance"]',
        },
        {
          title: "Lançar despesas (e receitas avulsas)",
          body: "Pagou aluguel, salário, compras, imposto? Registre como despesa, com categoria e valor. Assim o saldo reflete a realidade do negócio, não só os serviços.",
          sel: '[data-tour="adm-finance"]',
        },
      ],
    },
  },
  {
    path: "/oficina/relatorios",
    tour: {
      id: "oficina-relatorios-v2",
      label: "Relatórios",
      steps: [
        {
          title: "Para decidir com dados",
          body: "Esta tela responde perguntas do negócio sem você fazer conta na mão.",
        },
        {
          title: "O que você descobre aqui",
          body: "Quais serviços mais vendem (onde está seu dinheiro), quais clientes mais voltam (quem fidelizar) e quais carros estão com revisão vencida (quem chamar de volta).",
        },
      ],
    },
  },
  {
    path: "/oficina/configuracoes",
    tour: {
      id: "oficina-configuracoes-v2",
      label: "Configurações",
      steps: [
        {
          title: "Os dados da sua oficina",
          body: "Nome, endereço, telefone e WhatsApp. Eles aparecem no PDF das ordens, no app do cliente e nas mensagens — mantenha atualizado.",
          sel: '[data-tour="adm-settings"]',
        },
        {
          title: "Avisos automáticos",
          body: "Aqui você liga/desliga os lembretes que o sistema envia sozinho aos clientes: troca de óleo, revisão, IPVA e promoções. Deixe ligados os que fazem sentido.",
          sel: '[data-tour="adm-settings"]',
        },
        {
          title: "Sua equipe",
          body: "Mais abaixo você vê os usuários do sistema e o papel de cada um (administrador ou mecânico). É por aqui que você sabe quem tem acesso.",
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
      id: "app-inicio-v2",
      label: "Início",
      steps: [
        {
          title: "Bem-vindo ao seu app 🚗",
          body: "Aqui você resolve tudo com a oficina pelo celular, sem precisar ligar. Deixa eu te mostrar como funciona em poucos passos.",
        },
        {
          title: "Como funciona, resumido",
          body: "O caminho é simples: você AGENDA um serviço ou PEDE um orçamento → ACOMPANHA o carro na oficina → APROVA o orçamento → retira o carro → e fica com o HISTÓRICO e os documentos guardados.",
        },
        {
          title: "Seu carro na oficina",
          body: "Quando seu veículo estiver em serviço, o status dele aparece bem aqui no topo — de 'recebido' até 'pronto para retirada'. Sem precisar perguntar.",
        },
        {
          title: "Ações rápidas",
          body: "Os atalhos mais usados: agendar um serviço, pedir um orçamento e marcar troca de pneus ou bateria. É por aqui que a maioria das coisas começa.",
          sel: '[data-tour="app-quick"]',
        },
        {
          title: "Como navegar",
          body: "A barra de baixo tem as 4 telas principais (Início, Veículos, Serviços, Perfil). E o menu ☰ no topo abre TODAS as opções, incluindo orçamentos, histórico e documentos.",
          sel: ['[data-tour="app-bottomnav"]', '[data-tour="app-menu"]'],
        },
      ],
    },
  },
  {
    path: "/app/veiculos",
    tour: {
      id: "app-veiculos-v2",
      label: "Meus veículos",
      steps: [
        {
          title: "Seus carros",
          body: "Todos os veículos que você tem na oficina ficam aqui. Toque em um para abrir a ficha dele.",
        },
        {
          title: "O que tem na ficha",
          body: "Dados do carro, as próximas manutenções com um semáforo (verde = em dia, amarelo = chegando, vermelho = vencida) e o histórico de tudo que já foi feito nele.",
        },
      ],
    },
  },
  {
    path: "/app/agendar",
    tour: {
      id: "app-agendar-v2",
      label: "Agendar",
      steps: [
        {
          title: "Marcar um serviço",
          body: "Aqui você escolhe o melhor dia e horário, no seu tempo.",
          sel: '[data-tour="app-booking"]',
        },
        {
          title: "É só seguir os passos",
          body: "1) Escolha o carro. 2) O serviço. 3) A data. 4) O horário. Ao confirmar, a oficina recebe o pedido e te manda a confirmação pelo WhatsApp.",
          sel: '[data-tour="app-booking"]',
        },
      ],
    },
  },
  {
    path: "/app/solicitar",
    tour: {
      id: "app-solicitar-v2",
      label: "Solicitar orçamento",
      steps: [
        {
          title: "Pedir um orçamento",
          body: "Não sabe quanto vai custar? Descreva o problema e a oficina prepara um orçamento pra você, sem compromisso.",
          sel: '[data-tour="app-solicitar"]',
        },
        {
          title: "Como pedir",
          body: "Escolha o carro e conte com suas palavras o que está acontecendo. A oficina recebe na hora e, quando o orçamento ficar pronto, você é avisado e pode aprovar pelo app.",
          sel: '[data-tour="app-solicitar"]',
        },
      ],
    },
  },
  {
    path: "/app/orcamentos",
    tour: {
      id: "app-orcamentos-v2",
      label: "Orçamentos",
      steps: [
        {
          title: "Seus orçamentos",
          body: "Toda proposta que a oficina te enviar aparece aqui, com o valor total e o status (pendente, aprovado ou recusado).",
        },
        {
          title: "Aprovar ou recusar",
          body: "Toque num orçamento pendente para ver as peças e serviços detalhados. Se concordar, é só APROVAR — a oficina é avisada na hora e começa o serviço. Se não, você pode recusar.",
        },
      ],
    },
  },
  {
    path: "/app/acompanhar",
    tour: {
      id: "app-acompanhar-v2",
      label: "Acompanhar",
      steps: [
        {
          title: "Onde está meu carro?",
          body: "Uma barra de progresso mostra a etapa exata do serviço: recebido → orçamento → em serviço → pronto → entregue. Assim você sabe quando buscar, sem precisar ligar.",
        },
      ],
    },
  },
  {
    path: "/app/historico",
    tour: {
      id: "app-historico-v2",
      label: "Histórico",
      steps: [
        {
          title: "Tudo que já foi feito",
          body: "O prontuário dos seus carros: cada serviço com data, valor, garantia e até fotos. Ótimo na hora de vender o carro ou tirar uma dúvida do que já foi trocado.",
        },
      ],
    },
  },
  {
    path: "/app/documentos",
    tour: {
      id: "app-documentos-v2",
      label: "Documentos",
      steps: [
        {
          title: "Seus papéis, organizados",
          body: "Notas fiscais, garantias, orçamentos e ordens de serviço reunidos por tipo. Ficam sempre à mão, sem risco de perder aquele comprovante.",
        },
      ],
    },
  },
  {
    path: "/app/notificacoes",
    tour: {
      id: "app-notificacoes-v2",
      label: "Notificações",
      steps: [
        {
          title: "Seus avisos",
          body: "Recados da oficina e lembretes automáticos do seu carro: hora da troca de óleo, revisão chegando, IPVA. Toque para marcar como lida, ou use 'Marcar todas'.",
        },
      ],
    },
  },
  {
    path: "/app/servicos",
    tour: {
      id: "app-servicos-v2",
      label: "Serviços",
      steps: [
        {
          title: "O que a oficina faz",
          body: "A lista dos serviços oferecidos. Tocou num que precisa? O app já te leva direto para o agendamento daquele serviço.",
        },
      ],
    },
  },
  {
    path: "/app/perfil",
    tour: {
      id: "app-perfil-v2",
      label: "Perfil",
      steps: [
        {
          title: "Seus dados",
          body: "Aqui você confere e edita suas informações e pode instalar o app na tela inicial do celular, pra abrir com um toque.",
        },
        {
          title: "Ligue as notificações",
          body: "Ative para receber no celular os lembretes de manutenção do seu carro. Assim você nunca perde a hora da revisão ou do óleo.",
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
      id: "mec-lista-v2",
      label: "Minhas ordens",
      steps: [
        {
          title: "Área do mecânico 🔧",
          body: "Esta é a sua fila de trabalho: aparecem só as ordens de serviço que foram atribuídas a você. Simples assim.",
        },
        {
          title: "Cada card é um carro",
          body: "Mostra o veículo, o cliente, a placa e o defeito relatado. Toque no card para abrir a ordem e começar a trabalhar nela.",
        },
        {
          title: "Seu trabalho, resumido",
          body: "Dentro da OS você vai: fazer a vistoria técnica → lançar as peças e serviços → tirar fotos → escrever o que fez → e avançar o status. Vou te mostrar isso na próxima tela.",
        },
      ],
    },
  },
  {
    path: "/mecanico/",
    tour: {
      id: "mec-os-v2",
      label: "Ordem de serviço",
      steps: [
        {
          title: "Trabalhando na ordem",
          body: "Esta tela é o seu registro do serviço. Vá de cima pra baixo — eu mostro cada parte na ordem de uso.",
        },
        {
          title: "1) O status",
          body: "Conforme o trabalho anda, avance o status por aqui (ex.: de 'Em execução' para 'Finalizada'). Assim a oficina e o cliente acompanham o progresso em tempo real.",
          sel: '[data-tour="mec-status"]',
        },
        {
          title: "2) A vistoria técnica",
          body: "Seu diagnóstico item por item — motor, freios, suspensão, pneus, óleo, elétrica... Marque cada um como OK, Atenção ou Avaria e salve. É o que mostra ao cliente o estado real do carro.",
          sel: '[data-tour="mec-vistoria"]',
        },
        {
          title: "3) Peças e serviços",
          body: "Registre o que usou e o que fez, com o valor. Ao vincular uma peça ao estoque, ela baixa sozinha quando a OS for finalizada. Isso alimenta o orçamento da ordem.",
          sel: '[data-tour="mec-itens"]',
        },
        {
          title: "4) Fotos",
          body: "Tire fotos direto do celular — antes e depois, a peça trocada, uma avaria. Elas ficam anexadas à ordem e o cliente vê no app. Vale muito pra evitar discussão.",
          sel: '[data-tour="mec-fotos"]',
        },
        {
          title: "5) Observações",
          body: "Por fim, escreva em texto o que foi feito, o que trocou e o que recomenda pro futuro. Salve — e o serviço fica documentado por completo.",
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
