"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  MessageCircle,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { whatsappUrl } from "../_data/business";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00",
  "13:00", "14:00", "15:00", "16:00", "17:00",
];
const SERVICES = [
  "Diagnóstico eletrônico",
  "Veículos híbridos",
  "Câmbio automático / CVT",
  "Troca de óleo e filtros",
  "Freios e suspensão",
  "Revisão completa",
  "Outro serviço",
];

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date | null) =>
  !!a && !!b && startOfDay(a).getTime() === startOfDay(b).getTime();

export function Booking() {
  const reduce = useReducedMotion();
  // A data "hoje" depende do relógio do cliente. Renderizamos o calendário só
  // após montar, evitando hydration mismatch entre o HTML pré-renderizado
  // (data do build) e a data real do visitante.
  const [mounted, setMounted] = useState(false);
  // setState no efeito é intencional: marca a montagem no cliente para evitar
  // o hydration mismatch da data (build vs. relógio do visitante).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const today = startOfDay(new Date());

  const [view, setView] = useState({ y: today.getFullYear(), m: today.getMonth() });
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [service, setService] = useState(SERVICES[0]);
  const [name, setName] = useState("");
  const [car, setCar] = useState("");

  const firstDay = new Date(view.y, view.m, 1);
  const lead = firstDay.getDay();
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(view.y, view.m, d));

  const prevDisabled =
    view.y < today.getFullYear() ||
    (view.y === today.getFullYear() && view.m <= today.getMonth());

  // Bloqueia datas passadas, sábado (6) e domingo (0).
  const dayDisabled = (d: Date) => {
    const wd = d.getDay();
    return d < today || wd === 0 || wd === 6;
  };
  const slotDisabled = (slot: string) => {
    if (!date) return true;
    if (sameDay(date, today)) {
      const [h, mm] = slot.split(":").map(Number);
      const now = new Date();
      return h < now.getHours() || (h === now.getHours() && mm <= now.getMinutes());
    }
    return false;
  };

  const goPrev = () =>
    !prevDisabled &&
    setView((v) => (v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 }));
  const goNext = () =>
    setView((v) => (v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 }));

  const canConfirm = !!date && !!time;
  const dateLabel = date
    ? date.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const message = useMemo(() => {
    if (!date || !time) return "";
    const lines = [
      "Olá! Quero agendar um horário na Auto Mecânica Mundial.",
      "",
      `🗓️ Data: ${dateLabel}`,
      `⏰ Horário: ${time}`,
      `🔧 Serviço: ${service}`,
    ];
    if (car.trim()) lines.push(`🚗 Veículo: ${car.trim()}`);
    if (name.trim()) lines.push(`👤 Nome: ${name.trim()}`);
    lines.push("", "Aguardo a confirmação. Obrigado!");
    return lines.join("\n");
  }, [date, time, service, car, name, dateLabel]);

  if (!mounted) {
    return (
      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="h-[560px] animate-pulse rounded-3xl border border-line bg-surface shadow-card" />
          <div className="h-[560px] animate-pulse rounded-3xl border border-line bg-surface shadow-card" />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Calendário + horários */}
        <div className="rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold text-ink">
              <CalendarDays size={20} className="text-brand" />
              Escolha a data
            </h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={goPrev}
                disabled={prevDisabled}
                aria-label="Mês anterior"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink transition-colors enabled:hover:border-brand enabled:hover:text-brand disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Próximo mês"
                className="grid h-9 w-9 place-items-center rounded-lg border border-line text-ink transition-colors hover:border-brand hover:text-brand"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mb-4 text-center font-display font-semibold text-ink">
            {MONTHS[view.m]} {view.y}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((w) => (
              <div key={w} className="py-1 text-xs font-semibold text-muted">
                {w}
              </div>
            ))}
            {cells.map((d, i) => {
              if (!d) return <div key={`b${i}`} />;
              const disabled = dayDisabled(d);
              const selected = sameDay(d, date);
              const isToday = sameDay(d, today);
              return (
                <button
                  key={d.toISOString()}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected}
                  onClick={() => {
                    setDate(d);
                    setTime(null);
                  }}
                  className={[
                    "aspect-square rounded-lg text-sm font-medium transition-colors",
                    selected
                      ? "bg-brand text-white shadow-card"
                      : disabled
                        ? "cursor-not-allowed text-slate-300"
                        : "text-ink hover:bg-brand-soft",
                    isToday && !selected ? "ring-1 ring-brand/40" : "",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-muted">
            Atendemos de segunda a sexta. Sábados, domingos e feriados não
            disponíveis para agendamento online.
          </p>

          {/* Horários */}
          <AnimatePresence initial={false}>
            {date && (
              <motion.div
                initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="mt-6 border-t border-line pt-6">
                  <h3 className="mb-4 flex items-center gap-2 font-display text-base font-bold text-ink">
                    <Clock size={18} className="text-brand" />
                    Escolha o horário
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const disabled = slotDisabled(slot);
                      const selected = slot === time;
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={disabled}
                          aria-pressed={selected}
                          onClick={() => setTime(slot)}
                          className={[
                            "rounded-lg border py-3 text-sm font-semibold transition-colors",
                            selected
                              ? "border-brand bg-brand text-white"
                              : disabled
                                ? "cursor-not-allowed border-line text-slate-300"
                                : "border-line text-ink hover:border-brand hover:text-brand",
                          ].join(" ")}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resumo + dados + confirmação */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-7">
            <h2 className="font-display text-lg font-bold text-ink">
              Resumo do agendamento
            </h2>

            <dl className="mt-4 space-y-3 text-sm">
              <SummaryRow label="Data">
                {date ? (
                  // Só a 1ª letra maiúscula: "Quinta-feira, 11 de junho…"
                  // (capitalize do CSS deixaria "De Junho De", errado em PT-BR).
                  <span>{dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}</span>
                ) : (
                  <span className="text-muted">Selecione uma data</span>
                )}
              </SummaryRow>
              <SummaryRow label="Horário">
                {time || <span className="text-muted">Selecione um horário</span>}
              </SummaryRow>
            </dl>

            <div className="mt-5 space-y-4">
              <Field label="Serviço">
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full rounded-xl border border-line bg-bg px-3.5 py-3 text-ink outline-none focus:border-brand"
                >
                  {SERVICES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="Seu nome">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="w-full rounded-xl border border-line bg-bg px-3.5 py-3 text-ink outline-none placeholder:text-muted focus:border-brand"
                />
              </Field>

              <Field label="Veículo (modelo / ano)">
                <input
                  value={car}
                  onChange={(e) => setCar(e.target.value)}
                  placeholder="Ex.: Corolla 2021"
                  className="w-full rounded-xl border border-line bg-bg px-3.5 py-3 text-ink outline-none placeholder:text-muted focus:border-brand"
                />
              </Field>
            </div>

            {canConfirm ? (
              <a
                href={whatsappUrl(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-accent px-6 py-4 font-semibold text-white shadow-accent transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-strong"
              >
                <MessageCircle size={20} />
                Confirmar no WhatsApp
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mt-6 flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-full bg-slate-200 px-6 py-4 font-semibold text-slate-400"
              >
                <MessageCircle size={20} />
                Confirmar no WhatsApp
              </button>
            )}

            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <Check size={14} className="text-brand" />
              Sem custo. A confirmação final é feita pelo WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SummaryRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
      <dt className="font-medium text-muted">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
