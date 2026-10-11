import { describe, expect, it } from "vitest";
import { normalizeBrazilianPhone, timeOptions, validSlots } from "./scheduler";

describe("agendador", () => {
  it("aceita DDD e código do país sem duplicá-lo", () => {
    expect(normalizeBrazilianPhone("(43) 99106-5129")).toBe("5543991065129");
    expect(normalizeBrazilianPhone("+55 (43) 99106-5129")).toBe("5543991065129");
    expect(normalizeBrazilianPhone("(55) 99999-1234")).toBe("5555999991234");
    expect(normalizeBrazilianPhone("123")).toBeNull();
  });
  it("respeita minutos, fim exclusivo e remove horários duplicados", () => {
    expect(timeOptions([{ start: "09:30", end: "10:30" }, { start: "10:00", end: "10:30" }])).toEqual(["09:30", "10:00"]);
    expect(timeOptions([{ start: "09:15", end: "10:00" }])).toEqual(["09:15", "09:45"]);
  });
  it("rejeita períodos invertidos e horas inválidas", () => {
    expect(validSlots([{ start: "18:00", end: "09:00" }])).toBe(false);
    expect(validSlots([{ start: "25:00", end: "26:00" }])).toBe(false);
    expect(validSlots([])).toBe(false);
    expect(timeOptions([{ start: "invalid", end: "10:00" }])).toEqual([]);
  });
});
