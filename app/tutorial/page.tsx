import type { Papel } from "./_data/conteudo";
import { TutorialView } from "./tutorial-view";

const PAPEIS: Papel[] = ["admin", "mecanico", "cliente"];

export default async function TutorialPage({
  searchParams,
}: {
  searchParams: Promise<{ papel?: string }>;
}) {
  const { papel } = await searchParams;
  const inicial: Papel = PAPEIS.includes(papel as Papel) ? (papel as Papel) : "admin";
  return <TutorialView papelInicial={inicial} />;
}
