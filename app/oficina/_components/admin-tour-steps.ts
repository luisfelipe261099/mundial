import type { TourStep } from "@/app/_components/welcome-tour";

export const adminTourSteps: TourStep[] = [
  {
    titulo: "Bem-vindo à Oficina Noturna",
    texto:
      "Este é o painel administrativo. Vamos mostrar rapidinho os 5 lugares que você mais vai usar no dia a dia.",
  },
  { titulo: "Dashboard", texto: "É a tela inicial — resumo do dia, ordens em andamento e a agenda." },
  {
    titulo: "Ordens de Serviço",
    texto: "Onde toda a operação acontece: da entrada do veículo até a OS finalizada e o PDF pro cliente.",
  },
  { titulo: "Agenda", texto: "Os agendamentos do dia, feitos por você ou pelo cliente no app." },
  {
    titulo: "Acessos",
    texto: "Só o administrador vê essa tela — é onde você cria e gerencia os logins da equipe.",
  },
];
