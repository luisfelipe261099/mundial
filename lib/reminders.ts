import { prisma } from "@/lib/prisma";
import {
  computeMaintenance,
  mesAno,
  MAINT_LABEL,
  type MaintType,
  type MaintInfo,
  type MaintStatus,
} from "@/lib/maintenance";
import { notificar } from "@/lib/notify";

function tituloLembrete(type: MaintType, status: MaintStatus): string {
  const venc = status === "vencido";
  if (type === "oleo") return venc ? "Troca de óleo vencida" : "Troca de óleo se aproximando";
  if (type === "revisao") return venc ? "Revisão vencida" : "Revisão se aproximando";
  return venc ? "Licenciamento vencido" : "IPVA / licenciamento se aproximando";
}

function meiaNoite(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Roda diariamente (via cron). Cria Reminder + Notification (+ push na Fase 3)
// para cada manutenção que está "próxima" ou "vencida" e ainda não foi avisada.
export async function runReminders(now = new Date()): Promise<{ criados: number; verificados: number }> {
  const s = await prisma.settings.findUnique({ where: { id: "default" } });
  const toggles = {
    notifOleo: s?.notifOleo ?? true,
    notifRevisao: s?.notifRevisao ?? true,
    notifIpva: s?.notifIpva ?? true,
  };

  const vehicles = await prisma.vehicle.findMany();
  let criados = 0;

  for (const v of vehicles) {
    if (!v.clientId) continue; // precisa de dono pra avisar
    const m = computeMaintenance(
      { plate: v.plate, lastOilChangeAt: v.lastOilChangeAt, lastRevisaoAt: v.lastRevisaoAt },
      toggles,
      now
    );
    const checks: [MaintType, MaintInfo | null][] = [
      ["oleo", m.oleo],
      ["revisao", m.revisao],
      ["ipva", m.ipva],
    ];

    for (const [type, info] of checks) {
      if (!info || info.status === "em_dia") continue; // só avisa próximo|vencido
      const dueDate = meiaNoite(info.dueDate);

      // dedup: um lembrete por (veículo, tipo, ciclo)
      const existing = await prisma.reminder.findUnique({
        where: { vehicleId_type_dueDate: { vehicleId: v.id, type, dueDate } },
      });
      if (existing) continue;

      await prisma.reminder.create({
        data: { vehicleId: v.id, clientId: v.clientId, type, dueDate, status: "avisado" },
      });
      const carro = `${v.brand} ${v.model} (${v.plate})`;
      const verbo = info.status === "vencido" ? "venceu" : "vence";
      await notificar(
        v.clientId,
        "manutencao",
        tituloLembrete(type, info.status),
        `${carro} — ${MAINT_LABEL[type]} ${verbo} em ${mesAno(info.dueDate)}.`,
        `/app/veiculos/${v.id}`
      );
      criados++;
    }
  }

  return { criados, verificados: vehicles.length };
}
