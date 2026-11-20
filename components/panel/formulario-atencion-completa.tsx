"use client";

import { useActionState } from "react";
import { FileDown } from "lucide-react";
import { Alerta, Boton, Campo, claseCampo } from "@/components/ui/base";
import { guardarAtencionCompleta } from "@/lib/acciones/atencion-completa";

export function FormularioAtencionCompleta({ pacienteId, locale = "es" }: { pacienteId: string; locale?: string }) {
  const [estado, accion, pendiente] = useActionState(async (_: Awaited<ReturnType<typeof guardarAtencionCompleta>> | null, formData: FormData) => guardarAtencionCompleta(formData), null);
  return (
    <section>
      <div className="flex items-start gap-3">
        <div>
          <h2 className="font-display text-xl text-petroleo-900">Nueva consulta para paciente</h2>
          <p className="mt-1 text-sm text-tinta-suave">Registra un nuevo encuentro médico en el expediente del paciente.</p>
        </div>
      </div>
      {estado && (
        <div className="mt-4">
          <Alerta tono={estado.ok ? "exito" : "peligro"}>
            {estado.mensaje}
            {estado.ok && estado.referencia && (
              <a className="ml-2 inline-flex items-center gap-1 font-semibold underline" href={`/${locale}/panel/receta?id=${encodeURIComponent(estado.referencia)}`}>
                <FileDown className="h-4 w-4" aria-hidden /> Ver receta médica
              </a>
            )}
          </Alerta>
        </div>
      )}
      <form action={accion} className="mt-5 space-y-4">
        <input type="hidden" name="pacienteId" value={pacienteId} />
        <Campo etiqueta="Tipo de atención" htmlFor="tipo" requerido>
          <select id="tipo" name="tipo" defaultValue="ginecologia" className={claseCampo}>
            <option value="ginecologia">Ginecología</option>
            <option value="obstetricia">Obstetricia</option>
            <option value="prenatal">Control prenatal</option>
            <option value="general">Medicina general</option>
            <option value="ecografia">Ecografía</option>
            <option value="laboratorio">Laboratorio</option>
          </select>
        </Campo>
        <Campo etiqueta="Motivo de consulta" htmlFor="motivo" requerido>
          <textarea id="motivo" name="motivo" required rows={3} className={claseCampo} placeholder="¿Por qué consulta hoy?" />
        </Campo>
        <details className="rounded-xl border border-borde bg-arena-50 p-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-petroleo-900">Más detalles clínicos</summary>
          <div className="mt-3 space-y-4">
            <Campo etiqueta="Evaluación" htmlFor="evaluacion">
              <textarea id="evaluacion" name="evaluacion" rows={3} className={claseCampo} placeholder="Hallazgos y evaluación clínica" />
            </Campo>
            <Campo etiqueta="Plan e indicaciones" htmlFor="plan">
              <textarea id="plan" name="plan" rows={3} className={claseCampo} placeholder="Plan, indicaciones y recomendaciones" />
            </Campo>
          </div>
        </details>
        <details className="rounded-xl border border-borde bg-arena-50 p-3">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-petroleo-900">Añadir receta rápida (opcional)</summary>
          <div className="mt-3 space-y-4">
            <Campo etiqueta="Medicamento" htmlFor="medicamento">
              <input id="medicamento" name="medicamento" className={claseCampo} placeholder="Ej. Amoxicilina 500 mg" />
            </Campo>
            <Campo etiqueta="Pauta completa" htmlFor="pauta" ayuda="Ejemplo: 500 mg cada 8 horas por 7 días vía oral">
              <input id="pauta" name="pauta" className={claseCampo} placeholder="Dosis, frecuencia, duración y vía" />
            </Campo>
          </div>
        </details>
        <Boton type="submit" tamano="lg" disabled={pendiente} className="w-full sm:w-auto">
          {pendiente ? "Guardando…" : "Guardar consulta"}
        </Boton>
      </form>
    </section>
  );
}
