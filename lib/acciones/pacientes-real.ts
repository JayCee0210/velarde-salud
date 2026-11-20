"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createHash } from "node:crypto";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { mensajeDeError } from "@/lib/supabase/datos";
import { permisoParaAccion } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";

const esquemaNuevoPaciente = z.object({
  locale: z.enum(["es", "pt"]).default("es"),
  nombres: z.string().trim().min(2, "Ingresa los nombres.").max(100),
  apellidos: z.string().trim().min(2, "Ingresa los apellidos.").max(100),
  edad: z.coerce.number().int().min(0, "Ingresa una edad válida.").max(130, "Ingresa una edad válida."),
  whatsapp: z.string().trim().min(7, "Ingresa un número de WhatsApp.").max(30),
  correo: z.string().trim().email("Correo inválido.").optional().or(z.literal("")),
  idioma: z.enum(["es", "pt-BR"]).default("es"),
  contactoEmergencia: z.string().trim().max(160).optional().default(""),
  telefonoEmergencia: z.string().trim().max(30).optional().default(""),
  tipoAtencion: z.enum(["ginecologia", "obstetricia", "prenatal", "general", "ecografia", "laboratorio"]).default("ginecologia"),
  motivoAtencion: z.string().trim().max(4000).optional().default(""),
  evaluacionAtencion: z.string().trim().max(6000).optional().default(""),
  planAtencion: z.string().trim().max(6000).optional().default(""),
  medicamento: z.string().trim().max(200).optional().default(""),
  pauta: z.string().trim().max(300).optional().default(""),
  alergias: z.string().trim().max(1000).optional().default(""),
  condicionesCronicas: z.string().trim().max(2000).optional().default(""),
  antecedentesQuirurgicos: z.string().trim().max(2000).optional().default(""),
  medicacionHabitual: z.string().trim().max(2000).optional().default(""),
});

function codigoPaciente(): string {
  return `V-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

function separarPauta(pauta: string) {
  const texto = pauta.trim();
  const frecuencia = texto.match(/cada\s+([^por]+?)(?=\s+por\s+|\s+vía\s+|$)/i)?.[1]?.trim() || texto;
  const duracion = texto.match(/por\s+([^vía]+?)(?=\s+vía\s+|$)/i)?.[1]?.trim() || null;
  const via = texto.match(/vía\s+(.+)$/i)?.[1]?.trim() || null;
  const dosis = texto.split(/\s+cada\s+|\s+por\s+|\s+vía\s+/i)[0]?.trim() || texto;
  return { dosis, frecuencia, duracion, via };
}

export async function crearPacienteReal(formData: FormData): Promise<never> {
  const sesion = await permisoParaAccion(PERMISOS.pacientesGestionar);
  const resultado = esquemaNuevoPaciente.safeParse({
    locale: formData.get("locale") || "es",
    nombres: formData.get("nombres"),
    apellidos: formData.get("apellidos"),
    edad: formData.get("edad"),
    whatsapp: formData.get("whatsapp"),
    correo: formData.get("correo") || "",
    idioma: formData.get("idioma") || "es",
    contactoEmergencia: formData.get("contactoEmergencia") || "",
    telefonoEmergencia: formData.get("telefonoEmergencia") || "",
    tipoAtencion: formData.get("tipoAtencion") || "ginecologia",
    motivoAtencion: formData.get("motivoAtencion") || "",
    evaluacionAtencion: formData.get("evaluacionAtencion") || "",
    planAtencion: formData.get("planAtencion") || "",
    medicamento: formData.get("medicamento") || "",
    pauta: formData.get("pauta") || "",
    alergias: formData.get("alergias") || "",
    condicionesCronicas: formData.get("condicionesCronicas") || "",
    antecedentesQuirurgicos: formData.get("antecedentesQuirurgicos") || "",
    medicacionHabitual: formData.get("medicacionHabitual") || "",
  });
  if (!resultado.success) redirect(`/${String(formData.get("locale") || "es")}/panel/pacientes/nuevo?error=datos`);

  const locale = resultado.data.locale;
  try {
    const supabase = crearClienteAdminDatos();
    const nombre = resultado.data.nombres;
    const apellido = resultado.data.apellidos;
    const fechaNacimientoEstimada = `${new Date().getUTCFullYear() - resultado.data.edad}-01-01`;
    const whatsappLimpio = resultado.data.whatsapp.trim();
    const { data: existentePorTelefono } = await supabase.from("patients").select("id").eq("phone", whatsappLimpio).eq("status", "active").limit(1).maybeSingle();
    const { data: existentePorWhatsApp } = existentePorTelefono
      ? { data: existentePorTelefono }
      : await supabase.from("patients").select("id").eq("whatsapp_phone", whatsappLimpio).eq("status", "active").limit(1).maybeSingle();
    const existente = existentePorTelefono ?? existentePorWhatsApp;
    if (existente) redirect(`/${locale}/panel/pacientes/nuevo?error=duplicado`);

    const { data: pacienteCreado, error } = await supabase.from("patients").insert({
      patient_code: codigoPaciente(),
      first_name: nombre,
      last_name: apellido,
      date_of_birth: fechaNacimientoEstimada,
      phone: resultado.data.whatsapp,
      whatsapp_phone: resultado.data.whatsapp,
      email: resultado.data.correo || null,
      country_code: "BO",
      preferred_locale: resultado.data.idioma,
      emergency_contact_name: resultado.data.contactoEmergencia || null,
      emergency_contact_phone: resultado.data.telefonoEmergencia || null,
      acquisition_channel: "direct",
      status: "active",
      registered_by: sesion.miembroId,
    }).select("id").single();
    if (error || !pacienteCreado) throw error ?? new Error("No se pudo identificar al paciente creado.");

    // Guardar antecedentes y resumen clínico si se ingresaron
    const tieneAntecedentes = Boolean(
      resultado.data.alergias ||
      resultado.data.condicionesCronicas ||
      resultado.data.antecedentesQuirurgicos ||
      resultado.data.medicacionHabitual
    );
    if (tieneAntecedentes) {
      await supabase.from("patient_clinical_summaries").insert({
        patient_id: pacienteCreado.id,
        allergies_summary: resultado.data.alergias || null,
        chronic_conditions_summary: resultado.data.condicionesCronicas || null,
        surgical_history_summary: resultado.data.antecedentesQuirurgicos || null,
        current_medications_summary: resultado.data.medicacionHabitual || null,
        is_current: true,
        version_number: 1,
      });
    }

    // Crear atención clínica si hay motivo, evaluación o receta
    const tieneAtencion = Boolean(
      resultado.data.motivoAtencion ||
      resultado.data.evaluacionAtencion ||
      resultado.data.planAtencion ||
      resultado.data.medicamento
    );

    let recetaId: string | undefined;

    if (tieneAtencion) {
      const motivo = resultado.data.motivoAtencion || "Primera consulta / Alta de paciente";
      const { data: atencion, error: errorAtencion } = await supabase.from("clinical_encounters").insert({
        patient_id: pacienteCreado.id,
        professional_id: sesion.profesionalId ?? null,
        location_id: sesion.sucursalId ?? null,
        consultation_type: resultado.data.tipoAtencion,
        status: "open",
        created_by: sesion.miembroId,
      }).select("id").single();
      if (errorAtencion || !atencion) throw errorAtencion ?? new Error("No se pudo crear la atención inicial.");

      const contenidoNota = [motivo, resultado.data.evaluacionAtencion, resultado.data.planAtencion].filter(Boolean).join("\n");
      const { error: errorNota } = await supabase.from("clinical_notes").insert({
        encounter_id: atencion.id,
        patient_id: pacienteCreado.id,
        chief_complaint: motivo,
        clinical_assessment: resultado.data.evaluacionAtencion || null,
        treatment_plan: resultado.data.planAtencion || null,
        author_id: sesion.miembroId,
        status: "draft",
        content_hash: createHash("sha256").update(contenidoNota || "nota-inicial").digest("hex"),
      });
      if (errorNota) throw errorNota;

      // Si se especificó receta médica / medicamento
      if (resultado.data.medicamento) {
        const partes = separarPauta(resultado.data.pauta || "");
        const { data: receta, error: errorReceta } = await supabase.from("clinical_prescriptions").insert({
          encounter_id: atencion.id,
          patient_id: pacienteCreado.id,
          prescribing_professional_id: sesion.profesionalId ?? null,
          status: "draft",
          clinical_instructions: resultado.data.planAtencion || null,
          created_by: sesion.miembroId,
        }).select("id").single();

        if (!errorReceta && receta) {
          recetaId = receta.id;
          await supabase.from("clinical_prescription_items").insert({
            prescription_id: receta.id,
            medication_name: resultado.data.medicamento,
            dosage: partes.dosis || "Según pauta",
            frequency: partes.frecuencia || "Según indicación",
            duration: partes.duracion,
            route: partes.via,
            notes: resultado.data.pauta || null,
            display_order: 0,
          });
        }
      }
    }

    revalidatePath(`/${locale}/panel/pacientes`);
    const params = new URLSearchParams({
      paciente: pacienteCreado.id,
      creado: "1",
    });
    if (recetaId) {
      params.set("receta", recetaId);
    }
    redirect(`/${locale}/panel/pacientes?${params.toString()}`);
  } catch (error) {
    if (String(error).includes("NEXT_REDIRECT")) throw error;
    console.error("crearPacienteReal", mensajeDeError(error));
    redirect(`/${locale}/panel/pacientes/nuevo?error=servidor`);
  }
}
