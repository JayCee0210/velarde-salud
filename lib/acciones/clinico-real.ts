"use server";

import { createHash } from "node:crypto";
import { z } from "zod";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { mensajeDeError } from "@/lib/supabase/datos";
import { permisoParaAccion } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import type { ResultadoAccion } from "@/lib/validacion/esquemas";

const esquemaAtencion = z.object({
  pacienteId: z.string().uuid(),
  tipo: z.enum(["ginecologia", "obstetricia", "prenatal", "general", "ecografia", "laboratorio"]),
  motivo: z.string().trim().min(3).max(4000),
  evaluacion: z.string().trim().max(6000).optional().default(""),
  plan: z.string().trim().max(6000).optional().default(""),
  finalizar: z.enum(["0", "1"]).default("0"),
});

export async function crearAtencionClinica(formData: FormData): Promise<ResultadoAccion> {
  const sesion = await permisoParaAccion(PERMISOS.clinicoEscribir);
  const resultado = esquemaAtencion.safeParse({
    pacienteId: formData.get("pacienteId"),
    tipo: formData.get("tipo"),
    motivo: formData.get("motivo"),
    evaluacion: formData.get("evaluacion") ?? "",
    plan: formData.get("plan") ?? "",
    finalizar: formData.get("finalizar") === "on" ? "1" : "0",
  });
  if (!resultado.success) return { ok: false, mensaje: "Completa el motivo de la atención." };
  if (!sesion.profesionalId || !sesion.sucursalId) return { ok: false, mensaje: "Falta configurar el profesional o la sede." };

  try {
    const supabase = crearClienteAdminDatos();
    const { data: paciente } = await supabase.from("patients").select("id").eq("id", resultado.data.pacienteId).maybeSingle();
    if (!paciente) return { ok: false, mensaje: "Paciente no encontrado o no autorizado." };

    const { data: atencion, error: errorAtencion } = await supabase
      .from("clinical_encounters")
      .insert({
        patient_id: resultado.data.pacienteId,
        professional_id: sesion.profesionalId,
        location_id: sesion.sucursalId,
        consultation_type: resultado.data.tipo,
        status: resultado.data.finalizar === "1" ? "completed" : "open",
        created_by: sesion.miembroId,
      })
      .select("id")
      .single();
    if (errorAtencion || !atencion) throw errorAtencion ?? new Error("No se creó la atención.");

    const contenido = [resultado.data.motivo, resultado.data.evaluacion, resultado.data.plan].join("\n");
    const firmado = resultado.data.finalizar === "1";
    const { error: errorNota } = await supabase.from("clinical_notes").insert({
      encounter_id: atencion.id,
      patient_id: resultado.data.pacienteId,
      chief_complaint: resultado.data.motivo,
      clinical_assessment: resultado.data.evaluacion || null,
      treatment_plan: resultado.data.plan || null,
      author_id: sesion.miembroId,
      status: firmado ? "signed" : "draft",
      signed_at: firmado ? new Date().toISOString() : null,
      signed_by: firmado ? sesion.miembroId : null,
      content_hash: firmado ? createHash("sha256").update(contenido).digest("hex") : null,
    });
    if (errorNota) throw errorNota;
    return { ok: true, mensaje: firmado ? "Atención finalizada y nota firmada." : "Borrador guardado.", id: atencion.id };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error) || "No se pudo guardar la atención." };
  }
}
