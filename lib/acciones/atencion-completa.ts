"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { mensajeDeError } from "@/lib/supabase/datos";
import { permisoParaAccion } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import type { ResultadoAccion } from "@/lib/validacion/esquemas";

const esquema = z.object({
  pacienteId: z.string().uuid(),
  tipo: z.enum(["ginecologia", "obstetricia", "prenatal", "general", "ecografia", "laboratorio"]),
  motivo: z.string().trim().min(3).max(4000),
  evaluacion: z.string().trim().max(6000).optional().default(""),
  plan: z.string().trim().max(6000).optional().default(""),
  medicamento: z.string().trim().max(200).optional().default(""),
  pauta: z.string().trim().max(300).optional().default(""),
});

export async function guardarAtencionCompleta(formData: FormData): Promise<ResultadoAccion> {
  const sesion = await permisoParaAccion(PERMISOS.clinicoEscribir);
  const resultado = esquema.safeParse({
    pacienteId: formData.get("pacienteId"),
    tipo: formData.get("tipo"),
    motivo: formData.get("motivo"),
    evaluacion: formData.get("evaluacion") ?? "",
    plan: formData.get("plan") ?? "",
    medicamento: formData.get("medicamento") ?? "",
    pauta: formData.get("pauta") ?? "",
  });
  if (!resultado.success || !sesion.profesionalId || !sesion.sucursalId) return { ok: false, mensaje: "Completa el tipo y el motivo de la atención." };
  const tieneRecetaNueva = Boolean(resultado.data.medicamento || resultado.data.pauta);
  if (tieneRecetaNueva && (!resultado.data.medicamento || !resultado.data.pauta)) return { ok: false, mensaje: "Completa medicamento y pauta, o deja la receta vacía." };

  try {
    const supabase = crearClienteAdminDatos();
    const { data: paciente } = await supabase.from("patients").select("id").eq("id", resultado.data.pacienteId).maybeSingle();
    if (!paciente) return { ok: false, mensaje: "Paciente no encontrado." };
    const { data: atencion, error: errorAtencion } = await supabase.from("clinical_encounters").insert({ patient_id: resultado.data.pacienteId, professional_id: sesion.profesionalId, location_id: sesion.sucursalId, consultation_type: resultado.data.tipo, status: "open", created_by: sesion.miembroId }).select("id").single();
    if (errorAtencion || !atencion) throw errorAtencion ?? new Error("No se pudo crear la atención.");
    const contenidoNota = [resultado.data.motivo, resultado.data.evaluacion, resultado.data.plan].join("\n");
    const { error: errorNota } = await supabase.from("clinical_notes").insert({ encounter_id: atencion.id, patient_id: resultado.data.pacienteId, chief_complaint: resultado.data.motivo, clinical_assessment: resultado.data.evaluacion || null, treatment_plan: resultado.data.plan || null, author_id: sesion.miembroId, status: "draft", content_hash: createHash("sha256").update(contenidoNota).digest("hex") });
    if (errorNota) throw errorNota;
    let recetaId: string | undefined;
    if (tieneRecetaNueva) {
      const partes = separarPauta(resultado.data.pauta);
      const { data: receta, error: errorReceta } = await supabase.from("clinical_prescriptions").insert({ encounter_id: atencion.id, patient_id: resultado.data.pacienteId, prescribing_professional_id: sesion.profesionalId, status: "draft", clinical_instructions: resultado.data.plan || null, created_by: sesion.miembroId }).select("id").single();
      if (errorReceta || !receta) throw errorReceta ?? new Error("No se pudo crear la receta.");
      recetaId = receta.id;
      const { error: errorItem } = await supabase.from("clinical_prescription_items").insert({ prescription_id: receta.id, medication_name: resultado.data.medicamento, dosage: partes.dosis, frequency: partes.frecuencia, duration: partes.duracion, route: partes.via, notes: resultado.data.pauta, display_order: 0 });
      if (errorItem) throw errorItem;
    }
    return { ok: true, mensaje: "Atención guardada como borrador.", id: atencion.id, referencia: recetaId };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error) || "No se pudo guardar la atención." };
  }
}

function separarPauta(pauta: string) {
  const texto = pauta.trim();
  const frecuencia = texto.match(/cada\s+([^por]+?)(?=\s+por\s+|\s+vía\s+|$)/i)?.[1]?.trim() || texto;
  const duracion = texto.match(/por\s+([^vía]+?)(?=\s+vía\s+|$)/i)?.[1]?.trim() || null;
  const via = texto.match(/vía\s+(.+)$/i)?.[1]?.trim() || null;
  const dosis = texto.split(/\s+cada\s+|\s+por\s+|\s+vía\s+/i)[0]?.trim() || texto;
  return { dosis, frecuencia, duracion, via };
}
