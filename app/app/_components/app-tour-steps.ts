import type { TourStep } from "@/app/_components/welcome-tour";

export const appTourSteps: TourStep[] = [
  {
    titulo: "Bem-vindo ao app da Oficina Noturna",
    texto: "Vamos te mostrar rapidinho as 5 telas mais importantes.",
  },
  { titulo: "Início", texto: "Resumo do seu veículo e do serviço em andamento, se houver." },
  { titulo: "Solicitar orçamento", texto: "Descreva o que precisa e peça um orçamento antes de agendar." },
  { titulo: "Acompanhar", texto: "Enquanto seu carro está na oficina, acompanhe cada etapa por aqui." },
  { titulo: "Perfil", texto: "Seus dados e a opção de ativar avisos de manutenção no celular." },
];
