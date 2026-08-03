export type Papel = "admin" | "mecanico" | "cliente";

export interface PassoTutorial {
  titulo: string;
  texto: string;
  imagem: string; // caminho em /public, ex.: "/tutorial/admin/dashboard.png"
}

export const papelLabel: Record<Papel, string> = {
  admin: "Administrador",
  mecanico: "Mecânico",
  cliente: "Cliente",
};

/* ── O fluxo completo — a jornada de um carro pela oficina ─────────────── */

export interface EtapaFluxo {
  titulo: string;
  quem: Papel; // quem age nesta etapa (admin = equipe da oficina no painel)
  onde: string; // em que tela do sistema isso acontece
  texto: string;
  status?: string; // status da OS depois desta etapa, quando muda
}

export const quemLabel: Record<Papel, string> = {
  admin: "Oficina",
  mecanico: "Mecânico",
  cliente: "Cliente",
};

export const fluxoDoCarro: EtapaFluxo[] = [
  {
    titulo: "O cliente marca um horário (ou chega direto)",
    quem: "cliente",
    onde: "App do cliente · Agendar / Solicitar orçamento",
    texto:
      "Pelo app, o cliente agenda um horário ou descreve um problema e pede orçamento — tudo isso aparece para a oficina na Agenda e nas solicitações. Quem chega sem marcar também é atendido normalmente: nesse caso o fluxo começa direto na etapa seguinte, a entrada.",
  },
  {
    titulo: "Entrada do veículo (check-in + vistoria)",
    quem: "admin",
    onde: "Painel · Ordens de Serviço → botão \"Dar entrada\"",
    texto:
      "A recepção registra cliente, veículo, quilometragem, nível de combustível, a vistoria de entrada (checklist item a item: OK, Atenção ou Avaria), objetos deixados no carro e o que o cliente autorizou. Ao salvar, nasce a Ordem de Serviço — daqui até a entrega, tudo acontece dentro dela.",
    status: "Aberta",
  },
  {
    titulo: "Orçamento dentro da própria OS",
    quem: "admin",
    onde: "Painel · Ordens de Serviço → abrir a OS",
    texto:
      "Adicione as peças e os serviços com seus valores. Dica importante: ao adicionar uma peça, vincule-a a um produto do Estoque — é esse vínculo que faz a baixa automática acontecer lá na frente. Com o orçamento pronto, clique em \"Enviar para aprovação\": o cliente recebe na hora, no app.",
    status: "Aguardando aprovação",
  },
  {
    titulo: "O cliente aprova (ou recusa) pelo celular",
    quem: "cliente",
    onde: "App do cliente · Orçamentos",
    texto:
      "O cliente vê o detalhamento de peças e serviços e decide sem precisar ligar. Se aprovar, a OS avança sozinha para \"Em execução\". Se recusar, ela volta para \"Aberta\" — ajuste os itens e envie de novo. Cliente sem app? Sem problema: com a aprovação verbal, o administrador muda o status manualmente na OS.",
    status: "Em execução",
  },
  {
    titulo: "O mecânico executa o serviço",
    quem: "mecanico",
    onde: "Painel do mecânico",
    texto:
      "O mecânico entra no painel dele e já vê as ordens atribuídas a ele. Dentro da OS, preenche o checklist técnico conforme inspeciona e anexa fotos do antes, durante e depois, direto pelo celular. O cliente acompanha cada etapa em tempo real pelo app.",
  },
  {
    titulo: "Serviço finalizado — o estoque baixa sozinho",
    quem: "mecanico",
    onde: "Dentro da OS → \"Finalizar\"",
    texto:
      "Quando o serviço termina, a OS é marcada como Finalizada (pelo mecânico ou pelo administrador). Nesse momento o sistema dá baixa automática no Estoque de todas as peças que foram vinculadas a produtos no orçamento — ninguém precisa dar baixa manual.",
    status: "Finalizada",
  },
  {
    titulo: "Entrega (check-out) + pagamento",
    quem: "admin",
    onde: "Dentro da OS → \"Registrar entrega\"",
    texto:
      "Na retirada, registre a quilometragem de saída e o pagamento. Se estiver pago, a receita entra automaticamente no Financeiro, já ligada à OS. Gere o PDF da ordem — com vistoria, itens e valores — para imprimir ou mandar por WhatsApp ao cliente.",
    status: "Entregue",
  },
  {
    titulo: "Depois da entrega, o sistema continua trabalhando",
    quem: "cliente",
    onde: "App do cliente · Histórico / Notificações",
    texto:
      "O serviço fica registrado no histórico do cliente, com as fotos do mecânico. Os lembretes automáticos (troca de óleo, revisão, IPVA) avisam o cliente na hora certa de voltar — e a oficina acompanha o resultado em Relatórios e no Financeiro.",
  },
];

/* ── Guia de implantação — primeiros passos, sem precisar de ajuda ─────── */

export interface PassoImplantacao {
  titulo: string;
  texto: string;
}

export const guiaImplantacao: PassoImplantacao[] = [
  {
    titulo: "Confira as Configurações",
    texto:
      "Em Configurações, revise os dados da oficina (nome, telefone, WhatsApp, endereço) e escolha quais lembretes automáticos ficam ativos para os clientes (óleo, revisão, IPVA, promoções).",
  },
  {
    titulo: "Crie o acesso de cada pessoa da equipe",
    texto:
      "Em Acessos, cadastre cada mecânico e administrador com e-mail e senha. A equipe entra na tela de login com e-mail + senha. Se alguém esquecer a senha, é nessa mesma tela que você redefine.",
  },
  {
    titulo: "Monte o Estoque",
    texto:
      "Cadastre as peças que você controla, com a quantidade atual e o mínimo desejado. Esse cadastro é o que permite a baixa automática quando uma OS é finalizada e o alerta de estoque baixo.",
  },
  {
    titulo: "Libere o acesso dos clientes já cadastrados",
    texto:
      "Clientes que já estão no sistema ativam a própria conta na página \"Primeiro acesso\" (link na tela de login): informam a placa e o telefone que está na ficha e criam a própria senha. Divulgue esse caminho por WhatsApp — ninguém precisa cadastrar os clientes de novo.",
  },
  {
    titulo: "Cliente sem telefone certo na ficha? Gere o acesso manualmente",
    texto:
      "Abra a ficha do cliente em Clientes e use \"Gerar acesso\": o sistema cria uma senha temporária que aparece uma única vez — repasse ao cliente, que entra com a placa + essa senha. O mesmo botão serve para redefinir a senha de quem esqueceu.",
  },
  {
    titulo: "Cliente totalmente novo usa o Cadastro",
    texto:
      "Quem nunca foi cliente se cadastra sozinho na página de Cadastro. O sistema barra duplicatas: se a placa ou o telefone já existem, ele orienta a pessoa a usar o Primeiro acesso — o histórico dela é preservado.",
  },
  {
    titulo: "Faça uma OS de teste do início ao fim",
    texto:
      "Antes do primeiro cliente real, rode o ciclo completo uma vez: dar entrada → montar orçamento → enviar para aprovação → aprovar → finalizar → registrar entrega. Em dez minutos a equipe inteira entende o fluxo.",
  },
];

/* ── Perguntas frequentes — as dúvidas do dia a dia ────────────────────── */

export interface PerguntaFrequente {
  pergunta: string;
  resposta: string;
}

export const perguntasFrequentes: PerguntaFrequente[] = [
  {
    pergunta: "Com o que cada um faz login?",
    resposta:
      "Todos entram pela mesma tela de login. Equipe (administrador e mecânico): e-mail + senha. Cliente: placa do carro + senha (ou e-mail + senha, se tiver cadastrado um e-mail).",
  },
  {
    pergunta: "O cliente esqueceu a senha. E agora?",
    resposta:
      "No painel, abra Clientes → ficha do cliente → \"Redefinir acesso\". O sistema gera uma senha temporária que aparece uma única vez — repasse ao cliente, que volta a entrar com a placa + essa senha.",
  },
  {
    pergunta: "Alguém da equipe esqueceu a senha.",
    resposta:
      "Em Acessos, localize a pessoa e redefina a senha dela. Precisa ser um administrador para fazer isso — e o sistema garante que sempre exista ao menos um administrador ativo.",
  },
  {
    pergunta: "No Primeiro acesso aparece que placa e telefone não conferem.",
    resposta:
      "O telefone digitado precisa ser o mesmo que está na ficha do cliente. Confira e corrija o telefone na ficha (Clientes → editar) e peça para tentar de novo — ou gere o acesso manualmente pela própria ficha.",
  },
  {
    pergunta: "Apareceu \"Muitas tentativas. Aguarde alguns minutos\".",
    resposta:
      "É uma proteção contra tentativas repetidas de senha errada. Basta aguardar alguns minutos e tentar novamente — não é preciso fazer nada no painel.",
  },
  {
    pergunta: "Finalizei a OS e o estoque não baixou.",
    resposta:
      "A baixa automática só acontece nas peças que foram vinculadas a um produto do Estoque na hora de montar o orçamento. Peça digitada solta (sem vínculo) não movimenta estoque — nesse caso, faça uma saída manual na tela de Estoque.",
  },
  {
    pergunta: "O cliente recusou o orçamento. Perdi a OS?",
    resposta:
      "Não. A OS volta para \"Aberta\" com tudo que já foi lançado. Ajuste itens ou valores e clique em \"Enviar para aprovação\" de novo.",
  },
  {
    pergunta: "E o cliente que não usa smartphone?",
    resposta:
      "Nada trava. Com a aprovação verbal do cliente, o administrador avança o status da OS manualmente e entrega o PDF impresso da ordem no final. O app é um extra, não uma exigência.",
  },
];

export const conteudoPorPapel: Record<Papel, PassoTutorial[]> = {
  admin: [
    {
      titulo: "Dashboard",
      texto:
        "Assim que você entra, o Dashboard mostra o resumo do dia: ordens em andamento, agenda do dia e os números principais da oficina. É o ponto de partida — os cartões de KPI no topo dão uma visão rápida antes de entrar em qualquer tela específica.",
      imagem: "/tutorial/admin/dashboard.png",
    },
    {
      titulo: "Clientes",
      texto:
        "Em Clientes você vê todos os clientes cadastrados, pode abrir a ficha de qualquer um (veículos, histórico de OS, contato) ou cadastrar um novo pelo botão \"Novo cliente\". A ficha do cliente é o mesmo lugar onde você confere veículos vinculados a ele.",
      imagem: "/tutorial/admin/clientes.png",
    },
    {
      titulo: "Veículos",
      texto:
        "Lista todos os veículos já atendidos, com placa, modelo e o cliente dono. Clique em um veículo para ver o histórico completo de serviços e o estado de manutenção (óleo, revisão, IPVA).",
      imagem: "/tutorial/admin/veiculos.png",
    },
    {
      titulo: "Ordens de Serviço",
      texto:
        "O coração do sistema. Uma OS nasce na Entrada — a vistoria de entrada registra o que o cliente autorizou, o nível de combustível, avarias e o km. Dali ela avança: mecânico executa, você lança peças/serviços, marca como finalizada e gera o PDF da ordem para o cliente. O status de cada OS (Agendado → Em andamento → Finalizado → Entregue) aparece sempre visível na lista.",
      imagem: "/tutorial/admin/ordens.png",
    },
    {
      titulo: "Agenda",
      texto:
        "Mostra os agendamentos do dia e dos próximos dias — tanto os que o cliente marcou pelo app quanto os que você cadastrar manualmente. Use para organizar quem chega e quando.",
      imagem: "/tutorial/admin/agenda.png",
    },
    {
      titulo: "Estoque",
      texto:
        "Controle de peças: quantidade atual, mínimo desejado e o histórico de movimentações (entradas manuais, saídas manuais e baixas automáticas quando uma OS é finalizada com peças). Produtos abaixo do mínimo aparecem sinalizados.",
      imagem: "/tutorial/admin/estoque.png",
    },
    {
      titulo: "Financeiro",
      texto:
        "Receitas e despesas da oficina. Toda OS finalizada e paga gera uma receita automaticamente aqui — você também pode lançar despesas manuais (aluguel, fornecedor, etc.).",
      imagem: "/tutorial/admin/financeiro.png",
    },
    {
      titulo: "Relatórios",
      texto:
        "Visão consolidada do desempenho da oficina — volume de ordens, faturamento e outros indicadores para acompanhar a operação ao longo do tempo.",
      imagem: "/tutorial/admin/relatorios.png",
    },
    {
      titulo: "Acessos",
      texto:
        "Só o administrador vê esta tela. Aqui você cria os logins da equipe (mecânicos e outros administradores), reseta senha de quem esqueceu, e remove acesso de quem não trabalha mais na oficina. Sempre precisa existir ao menos um administrador ativo.",
      imagem: "/tutorial/admin/acessos.png",
    },
    {
      titulo: "Configurações",
      texto:
        "Dados da oficina (nome, telefone, WhatsApp, endereço) e quais tipos de lembrete automático ficam ativos para os clientes (troca de óleo, revisão, IPVA, promoções).",
      imagem: "/tutorial/admin/configuracoes.png",
    },
  ],
  mecanico: [
    {
      titulo: "Suas ordens atribuídas",
      texto:
        "Ao entrar, você já vê a lista das ordens de serviço atribuídas a você, com placa, veículo, cliente e o defeito relatado. Toque em qualquer uma para abrir.",
      imagem: "/tutorial/mecanico/lista.png",
    },
    {
      titulo: "Abrir uma OS",
      texto:
        "Dentro da ordem você vê todos os dados do veículo e do problema relatado, e preenche a vistoria técnica/checklist conforme vai inspecionando o carro.",
      imagem: "/tutorial/mecanico/ordem.png",
    },
    {
      titulo: "Fotos do serviço",
      texto:
        "Anexe fotos em cada etapa do serviço (antes, durante, depois) direto pelo celular — elas ficam disponíveis depois para o cliente ver no histórico dele.",
      imagem: "/tutorial/mecanico/fotos.png",
    },
    {
      titulo: "Finalizar o serviço",
      texto:
        "Quando o serviço termina, marque a ordem como finalizada. Isso libera a baixa de estoque das peças usadas e o lançamento financeiro para o administrador — não precisa fazer nada além de finalizar.",
      imagem: "/tutorial/mecanico/finalizar.png",
    },
  ],
  cliente: [
    {
      titulo: "Início",
      texto:
        "A tela inicial resume o essencial: o estado do seu veículo, o serviço em andamento (se houver) e os próximos lembretes de manutenção.",
      imagem: "/tutorial/cliente/inicio.png",
    },
    {
      titulo: "Acompanhar",
      texto:
        "Quando seu carro está na oficina, aqui você acompanha em tempo real cada etapa do serviço, sem precisar ligar para perguntar.",
      imagem: "/tutorial/cliente/acompanhar.png",
    },
    {
      titulo: "Meus veículos",
      texto:
        "Lista dos seus veículos cadastrados, com quilometragem e o estado de cada manutenção (em dia, próxima ou vencida).",
      imagem: "/tutorial/cliente/veiculos.png",
    },
    {
      titulo: "Agendamentos",
      texto:
        "Marque um horário para levar o carro na oficina, escolhendo o serviço e a data que preferir.",
      imagem: "/tutorial/cliente/agendar.png",
    },
    {
      titulo: "Solicitar orçamento",
      texto:
        "Descreva o problema ou o serviço que precisa e peça um orçamento antes mesmo de agendar.",
      imagem: "/tutorial/cliente/solicitar.png",
    },
    {
      titulo: "Orçamentos",
      texto:
        "Veja os orçamentos recebidos, com o detalhamento de peças e serviços, e aprove ou recuse direto pelo app.",
      imagem: "/tutorial/cliente/orcamentos.png",
    },
    {
      titulo: "Histórico",
      texto:
        "Todo serviço já feito no seu carro fica registrado aqui, incluindo as fotos que o mecânico tirou durante o atendimento.",
      imagem: "/tutorial/cliente/historico.png",
    },
    {
      titulo: "Documentos",
      texto:
        "Notas fiscais e outros documentos relacionados aos seus serviços, sempre à mão.",
      imagem: "/tutorial/cliente/documentos.png",
    },
    {
      titulo: "Notificações",
      texto:
        "Avisos sobre o andamento do seu serviço e lembretes de manutenção chegam aqui — e, se você ativar em Perfil, também no seu celular.",
      imagem: "/tutorial/cliente/notificacoes.png",
    },
    {
      titulo: "Perfil",
      texto:
        "Seus dados de contato e a opção de ativar avisos no celular (troca de óleo, revisão, IPVA) direto pelo navegador, sem precisar instalar nada.",
      imagem: "/tutorial/cliente/perfil.png",
    },
  ],
};
