// Núcleo de manutenção proativa — puro, sem I/O.
// Usado pelo prontuário (Fase 1) e pelo motor de lembretes (Fase 2).

export type MaintType = "oleo" | "revisao" | "ipva";
export type MaintStatus = "em_dia" | "proximo" | "vencido";

export const MAINT_LABEL: Record<MaintType, string> = {
  oleo: "Troca de óleo",
  revisao: "Revisão",
  ipva: "IPVA / licenciamento",
};

// Intervalos padrão (configuráveis no futuro).
export const INTERVALO_MESES: Record<"oleo" | "revisao", number> = {
  oleo: 12,
  revisao: 12,
};

// Avisa este tanto de dias antes do vencimento.
export const JANELA_DIAS = 15;

const DIA_MS = 86_400_000;

// Calendário Detran-PR: mês do licenciamento pelo final da placa.
// Padrão típico mar–dez; confira o calendário do ano vigente.
const IPVA_MES_POR_FINAL: Record<string, number> = {
  "1": 3, "2": 4, "3": 5, "4": 6, "5": 7,
  "6": 8, "7": 9, "8": 10, "9": 11, "0": 12,
};

export function finalDaPlaca(plate: string): string | null {
  const digits = plate.replace(/\D/g, "");
  return digits.length ? digits[digits.length - 1] : null;
}

export function ipvaMonthPR(plate: string): number | null {
  const f = finalDaPlaca(plate);
  return f ? IPVA_MES_POR_FINAL[f] ?? null : null;
}

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function statusDe(due: Date, now: Date): MaintStatus {
  const ms = due.getTime() - now.getTime();
  if (ms < 0) return "vencido";
  if (ms <= JANELA_DIAS * DIA_MS) return "proximo";
  return "em_dia";
}

export interface MaintInfo {
  dueDate: Date;
  status: MaintStatus;
}

export interface MaintInput {
  plate: string;
  lastOilChangeAt: Date | null;
  lastRevisaoAt: Date | null;
}

export interface MaintToggles {
  notifOleo: boolean;
  notifRevisao: boolean;
  notifIpva: boolean;
}

function computeIpva(plate: string, now: Date): MaintInfo | null {
  const mes = ipvaMonthPR(plate);
  if (!mes) return null;
  // dia 1 do mês do IPVA no ano corrente; se já passou > ~1 mês, rola pro ano seguinte
  let due = new Date(now.getFullYear(), mes - 1, 1);
  if (due.getTime() < now.getTime() - 31 * DIA_MS) {
    due = new Date(now.getFullYear() + 1, mes - 1, 1);
  }
  return { dueDate: due, status: statusDe(due, now) };
}

export interface MaintResult {
  oleo: MaintInfo | null;
  revisao: MaintInfo | null;
  ipva: MaintInfo | null;
}

function maintFrom(due: Date, now: Date): MaintInfo {
  return { dueDate: due, status: statusDe(due, now) };
}

export function computeMaintenance(v: MaintInput, toggles: MaintToggles, now: Date): MaintResult {
  return {
    oleo:
      toggles.notifOleo && v.lastOilChangeAt
        ? maintFrom(addMonths(v.lastOilChangeAt, INTERVALO_MESES.oleo), now)
        : null,
    revisao:
      toggles.notifRevisao && v.lastRevisaoAt
        ? maintFrom(addMonths(v.lastRevisaoAt, INTERVALO_MESES.revisao), now)
        : null,
    ipva: toggles.notifIpva ? computeIpva(v.plate, now) : null,
  };
}

// ── Helpers de apresentação (puros) ────────────────────────────────────────

const MES_ABREV = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export function mesAno(d: Date): string {
  return `${MES_ABREV[d.getMonth()]}/${d.getFullYear()}`;
}

// mapeia p/ o vocabulário de status que os componentes já usam
export function statusToUi(s: MaintStatus): "ok" | "proxima" | "vencida" {
  return s === "em_dia" ? "ok" : s === "proximo" ? "proxima" : "vencida";
}

export function quandoLabel(info: MaintInfo): string {
  const ma = mesAno(info.dueDate);
  if (info.status === "vencido") return `venceu em ${ma}`;
  if (info.status === "proximo") return `vence em ${ma}`;
  return `prevista p/ ${ma}`;
}

export interface MaintListItem {
  item: string;
  quando: string;
  status: "ok" | "proxima" | "vencida";
}

export function maintList(r: MaintResult): MaintListItem[] {
  const out: MaintListItem[] = [];
  const add = (type: MaintType, info: MaintInfo | null) => {
    if (info) out.push({ item: MAINT_LABEL[type], quando: quandoLabel(info), status: statusToUi(info.status) });
  };
  add("oleo", r.oleo);
  add("revisao", r.revisao);
  add("ipva", r.ipva);
  return out;
}
