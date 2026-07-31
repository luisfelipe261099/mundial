// Vocabulário único de status de agendamento. Antes existiam quatro: o form do
// admin gravava "Confirmado"/"Aguardando", o portal do cliente grava "Agendado",
// e cada lado tinha seu próprio tipo — com um cast sem verificação no meio.
import { rotuloDia } from "./datas";

export const STATUS_AGENDAMENTO = [
  "Agendado",
  "Confirmado",
  "Compareceu",
  "Faltou",
  "Cancelado",
] as const;

export type StatusAgendamento = (typeof STATUS_AGENDAMENTO)[number];

/** Status que não contam como compromisso ativo — aparecem esmaecidos. */
export const STATUS_INATIVOS: readonly StatusAgendamento[] = ["Faltou", "Cancelado"];

/**
 * Converte o que veio do banco (String livre) num status conhecido.
 * "Aguardando" é o valor legado do form antigo do admin. Qualquer valor
 * desconhecido cai em "Agendado" — nunca devolve undefined, que viraria
 * `class={undefined}` no mapa de badge.
 */
export function normalizarStatus(bruto: string | null | undefined): StatusAgendamento {
  if (bruto === "Aguardando") return "Agendado";
  return (STATUS_AGENDAMENTO as readonly string[]).includes(bruto ?? "")
    ? (bruto as StatusAgendamento)
    : "Agendado";
}

export const badgeAdmin: Record<StatusAgendamento, string> = {
  Agendado: "osb osb-aberta",
  Confirmado: "osb osb-finalizada",
  Compareceu: "osb osb-execucao",
  Faltou: "osb osb-cancelada",
  Cancelado: "osb osb-entregue",
};

export const badgePortal: Record<StatusAgendamento, string> = {
  Agendado: "badge badge-agendado",
  Confirmado: "badge badge-confirmado",
  Compareceu: "badge badge-finalizado",
  Faltou: "badge badge-rejeitado",
  Cancelado: "badge badge-rejeitado",
};

// Meio-dia UTC para somar dias sem que fuso ou horário de verão mudem a data —
// mesmo truque que `rotuloDia` já usa em lib/datas.ts.
function diaSeguinte(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** "Hoje", "Amanhã" ou "Seg · 03/08". `hoje` vem do servidor via hojeISO(). */
export function rotuloDoDia(iso: string, hoje: string): string {
  if (iso === hoje) return "Hoje";
  if (iso === diaSeguinte(hoje)) return "Amanhã";
  return rotuloDia(iso);
}

export type GrupoDia<T> = { iso: string; rotulo: string; itens: T[] };

/**
 * Agrupa por data ISO em blocos de dia. Futuros (inclusive hoje) em ordem
 * crescente; passados em ordem decrescente, o mais recente primeiro.
 * Datas ISO "YYYY-MM-DD" comparam corretamente como string.
 */
export function agruparPorDia<T extends { data: string }>(
  itens: T[],
  hoje: string
): { futuros: GrupoDia<T>[]; passados: GrupoDia<T>[] } {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const lista = mapa.get(item.data);
    if (lista) lista.push(item);
    else mapa.set(item.data, [item]);
  }
  const grupos = [...mapa.entries()].map(([iso, lista]) => ({
    iso,
    rotulo: rotuloDoDia(iso, hoje),
    itens: lista,
  }));
  return {
    futuros: grupos.filter((g) => g.iso >= hoje).sort((a, b) => a.iso.localeCompare(b.iso)),
    passados: grupos.filter((g) => g.iso < hoje).sort((a, b) => b.iso.localeCompare(a.iso)),
  };
}
