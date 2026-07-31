import { describe, expect, it } from "vitest";
import { agruparPorDia, normalizarStatus, rotuloDoDia } from "./agendamentos";

describe("normalizarStatus", () => {
  it("mantem os status canonicos", () => {
    expect(normalizarStatus("Agendado")).toBe("Agendado");
    expect(normalizarStatus("Confirmado")).toBe("Confirmado");
    expect(normalizarStatus("Compareceu")).toBe("Compareceu");
    expect(normalizarStatus("Faltou")).toBe("Faltou");
    expect(normalizarStatus("Cancelado")).toBe("Cancelado");
  });

  it("traduz o legado 'Aguardando' para 'Agendado'", () => {
    expect(normalizarStatus("Aguardando")).toBe("Agendado");
  });

  it("cai em 'Agendado' para valor desconhecido, nulo ou vazio", () => {
    expect(normalizarStatus("Em andamento")).toBe("Agendado");
    expect(normalizarStatus("qualquer coisa")).toBe("Agendado");
    expect(normalizarStatus("")).toBe("Agendado");
    expect(normalizarStatus(null)).toBe("Agendado");
    expect(normalizarStatus(undefined)).toBe("Agendado");
  });
});

describe("rotuloDoDia", () => {
  it("chama de Hoje a propria data", () => {
    expect(rotuloDoDia("2026-07-31", "2026-07-31")).toBe("Hoje");
  });

  it("chama de Amanha o dia seguinte", () => {
    expect(rotuloDoDia("2026-08-01", "2026-07-31")).toBe("Amanhã");
  });

  it("atravessa a virada do ano", () => {
    expect(rotuloDoDia("2027-01-01", "2026-12-31")).toBe("Amanhã");
  });

  it("usa dia da semana e data nas demais", () => {
    // 2026-08-03 é uma segunda-feira.
    expect(rotuloDoDia("2026-08-03", "2026-07-31")).toBe("Seg · 03/08");
  });
});

describe("agruparPorDia", () => {
  const itens = [
    { id: "a", data: "2026-07-29" },
    { id: "b", data: "2026-08-02" },
    { id: "c", data: "2026-07-31" },
    { id: "d", data: "2026-07-31" },
    { id: "e", data: "2026-07-20" },
  ];

  it("separa futuros de passados usando o hoje recebido", () => {
    const { futuros, passados } = agruparPorDia(itens, "2026-07-31");
    expect(futuros.map((g) => g.iso)).toEqual(["2026-07-31", "2026-08-02"]);
    expect(passados.map((g) => g.iso)).toEqual(["2026-07-29", "2026-07-20"]);
  });

  it("trata o proprio dia de hoje como futuro", () => {
    const { futuros } = agruparPorDia([{ id: "x", data: "2026-07-31" }], "2026-07-31");
    expect(futuros[0].rotulo).toBe("Hoje");
  });

  it("junta itens do mesmo dia num grupo so", () => {
    const { futuros } = agruparPorDia(itens, "2026-07-31");
    expect(futuros[0].itens.map((i) => i.id)).toEqual(["c", "d"]);
  });

  it("ordena passados do mais recente para o mais antigo", () => {
    const { passados } = agruparPorDia(itens, "2026-07-31");
    expect(passados[0].iso).toBe("2026-07-29");
  });

  it("devolve listas vazias sem itens", () => {
    expect(agruparPorDia([], "2026-07-31")).toEqual({ futuros: [], passados: [] });
  });
});
