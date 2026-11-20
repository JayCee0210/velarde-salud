import { describe, expect, it } from "vitest";
import { esquemaSolicitudCita, esquemaConsulta } from "./esquemas";

describe("validaciones públicas y clínicas", () => {
  it("rechaza solicitudes sin aviso de privacidad", () => {
    const resultado = esquemaSolicitudCita.safeParse({
      servicioSlug: "ginecologia",
      fechaPreferida: "2026-01-20",
      nombreSolicitante: "Ana Prueba",
      telefono: "76860839",
    });
    expect(resultado.success).toBe(false);
  });

  it("no acepta contenido clínico con identificador de paciente inválido", () => {
    const resultado = esquemaConsulta.safeParse({
      pacienteId: "paciente-de-prueba",
      tipo: "general",
      motivoConsulta: "Consulta sintética",
    });
    expect(resultado.success).toBe(false);
  });
});
