// Datas da oficina. Regra única: no banco toda data de agendamento é ISO
// "YYYY-MM-DD"; a formatação para o usuário acontece só na renderização.
// O servidor da Vercel roda em UTC, então tudo aqui é ancorado explicitamente
// no fuso de Curitiba — senão, depois das 21h a "data de hoje" viraria amanhã.

const TZ = "America/Sao_Paulo";
const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// Data civil de Curitiba "achatada" em um Date UTC, para poder somar dias sem
// que horário de verão ou offset mudem o resultado.
function civilSaoPaulo(now = new Date()): Date {
  const [dia, mes, ano] = new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
    .format(now)
    .split("/")
    .map(Number);
  return new Date(Date.UTC(ano, mes - 1, dia));
}

export function hojeISO(now = new Date()): string {
  return civilSaoPaulo(now).toISOString().slice(0, 10);
}

/** Data de hoje já formatada para exibição: "28/07/2026". */
export function hojeBR(now = new Date()): string {
  return dataBR(hojeISO(now));
}

/** Rótulo curto para escolha de data: "Seg · 28/07". */
export function rotuloDia(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${DIAS[d.getUTCDay()]} · ${dd}/${mm}`;
}

/** "YYYY-MM-DD" → "28/07/2026". Devolve a entrada intacta se não for ISO. */
export function dataBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

/**
 * Próximos dias em que a oficina atende, a partir de amanhã.
 * Pula domingo — a oficina não abre (ver business.hours).
 */
export function proximosDiasUteis(quantidade = 6, now = new Date()): { iso: string; rotulo: string }[] {
  const base = civilSaoPaulo(now);
  const dias: { iso: string; rotulo: string }[] = [];
  for (let offset = 1; dias.length < quantidade && offset <= quantidade * 3; offset++) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + offset);
    if (d.getUTCDay() === 0) continue; // domingo fechado
    const iso = d.toISOString().slice(0, 10);
    dias.push({ iso, rotulo: rotuloDia(iso) });
  }
  return dias;
}
