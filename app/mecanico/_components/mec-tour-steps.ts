import type { TourStep } from "@/app/_components/welcome-tour";

export const mecTourSteps: TourStep[] = [
  { titulo: "Bem-vindo", texto: "Aqui você vê só as ordens de serviço atribuídas a você." },
  {
    titulo: "Abra uma ordem",
    texto: "Toque numa ordem pra registrar a vistoria técnica e anexar fotos do serviço.",
  },
  {
    titulo: "Finalize quando terminar",
    texto: "Ao marcar como finalizada, a baixa de estoque e o lançamento financeiro acontecem sozinhos.",
  },
];
