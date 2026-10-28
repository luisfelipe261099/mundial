// Itens e estados da vistoria de entrada — usados no "Dar entrada" e na
// própria OS (onde dá pra corrigir ou preencher depois).

export const CHECKLIST_ITENS = [
  "Pneus",
  "Estepe",
  "Freios",
  "Luzes / faróis",
  "Lataria / pintura",
  "Vidros / retrovisores",
  "Interior / bancos",
  "Documentos",
  "Nível de óleo",
  "Palhetas",
  "Bateria",
  "Ar-condicionado",
];

export const VISTORIA_STATUS: { key: string; label: string; on: string }[] = [
  { key: "ok", label: "OK", on: "bg-emerald-600 text-white" },
  { key: "atencao", label: "Atenção", on: "bg-amber-500 text-white" },
  { key: "avaria", label: "Avaria", on: "bg-rose-600 text-white" },
];

export const VISTORIA_COR: Record<string, string> = {
  ok: "text-emerald-400",
  atencao: "text-amber-400",
  avaria: "text-rose-400",
};

export const VISTORIA_LABEL: Record<string, string> = {
  ok: "OK",
  atencao: "Atenção",
  avaria: "Avaria",
};
