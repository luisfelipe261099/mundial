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
