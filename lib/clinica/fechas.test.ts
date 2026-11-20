import { describe, expect, it } from "vitest";
import { edadGestacional, fechaHoraZonaAIso, solapamientos } from "./fechas";

describe("fechas clínicas", () => {
  it("convierte una hora de La Paz a ISO", () => {
    expect(fechaHoraZonaAIso("2026-01-15", "08:30", "America/La_Paz")).toBe("2026-01-15T12:30:00.000Z");
  }, 15000);

  it("detecta solapamientos sin considerar límites contiguos", () => {
    expect(solapamientos("2026-01-15T12:00:00Z", "2026-01-15T13:00:00Z", "2026-01-15T13:00:00Z", "2026-01-15T14:00:00Z")).toBe(false);
    expect(solapamientos("2026-01-15T12:00:00Z", "2026-01-15T13:00:00Z", "2026-01-15T12:30:00Z", "2026-01-15T14:00:00Z")).toBe(true);
  });

  it("calcula edad gestacional con semanas y días", () => {
    expect(edadGestacional("2026-01-01", "2026-01-15")).toEqual({ semanas: 2, dias: 0 });
    expect(edadGestacional("2026-01-15", "2026-01-01")).toBeNull();
  });
});
