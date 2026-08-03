import { TutorialView, type Aba } from "./tutorial-view";

const ABAS: Aba[] = ["fluxo", "admin", "mecanico", "cliente"];

export default async function TutorialPage({
  searchParams,
}: {
  searchParams: Promise<{ papel?: string }>;
}) {
  const { papel } = await searchParams;
  // Sem parâmetro (ou inválido), abre em "O fluxo" — a visão de como tudo se
  // conecta. Os links "Como usar" dos painéis passam ?papel= e caem na aba certa.
  const inicial: Aba = ABAS.includes(papel as Aba) ? (papel as Aba) : "fluxo";
  return <TutorialView abaInicial={inicial} />;
}
