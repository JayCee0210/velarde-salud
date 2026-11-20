"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { mensajeDeError } from "@/lib/supabase/datos";
import { permisoParaAccion } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import type { ResultadoAccion } from "@/lib/validacion/esquemas";

const esquema = z.object({
  pacienteId: z.string().uuid(),
  indicaciones: z.string().trim().max(2000).optional().default(""),
  finalizar: z.enum(["0", "1"]).default("0"),
  items: z.array(z.object({
    medicamento: z.string().trim().min(2).max(200),
    dosis: z.string().trim().min(1).max(120),
    frecuencia: z.string().trim().min(1).max(120),
    duracion: z.string().trim().max(120).optional().default(""),
    via: z.string().trim().max(80).optional().default(""),
    notas: z.string().trim().max(500).optional().default(""),
  })).min(1),
});

export async function crearPrescripcionReal(formData: FormData): Promise<ResultadoAccion> {
  const sesion = await permisoParaAccion(PERMISOS.prescripcionesGestionar);
  let items: unknown;
  try { items = JSON.parse(String(formData.get("items") ?? "[]")); } catch { items = []; }
  const resultado = esquema.safeParse({
    pacienteId: formData.get("pacienteId"),
    indicaciones: formData.get("indicaciones") ?? "",
    finalizar: formData.get("finalizar") === "on" ? "1" : "0",
    items,
  });
  if (!resultado.success || !sesion.profesionalId) return { ok: false, mensaje: "Completa al menos un medicamento con dosis y frecuencia." };

  try {
    const supabase = crearClienteAdminDatos();
    const { data: atencion } = await supabase.from("clinical_encounters").select("id").eq("patient_id", resultado.data.pacienteId).eq("professional_id", sesion.profesionalId).eq("status", "open").order("encounter_date", { ascending: false }).limit(1).maybeSingle();
    if (!atencion) return { ok: false, mensaje: "Primero abre una atención para este paciente." };
    const firmado = resultado.data.finalizar === "1";
    const contenido = JSON.stringify(resultado.data.items);
    const { data: receta, error } = await supabase.from("clinical_prescriptions").insert({
      encounter_id: atencion.id,
      patient_id: resultado.data.pacienteId,
      prescribing_professional_id: sesion.profesionalId,
      status: firmado ? "signed" : "draft",
      clinical_instructions: resultado.data.indicaciones || null,
      signed_at: firmado ? new Date().toISOString() : null,
      signed_by: firmado ? sesion.miembroId : null,
      created_by: sesion.miembroId,
    }).select("id").single();
    if (error || !receta) throw error ?? new Error("No se pudo crear la receta.");
    const { error: errorItems } = await supabase.from("clinical_prescription_items").insert(resultado.data.items.map((item, index) => ({
      prescription_id: receta.id,
      medication_name: item.medicamento,
      dosage: item.dosis,
      frequency: item.frecuencia,
      duration: item.duracion || null,
      route: item.via || null,
      notes: item.notas || null,
      display_order: index,
    })));
    if (errorItems) throw errorItems;
    // El hash se reserva para auditoría futura; no se guarda en una columna que el esquema no define.
    void createHash("sha256").update(contenido).digest("hex");
    revalidatePath(`/es/panel/pacientes`);
    return { ok: true, mensaje: firmado ? "Receta firmada y guardada." : "Borrador de receta guardado.", id: receta.id };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error) || "No se pudo guardar la receta." };
  }
}
