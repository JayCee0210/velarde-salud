"use server";

import { z } from "zod";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { mensajeDeError } from "@/lib/supabase/datos";
import { permisoParaAccion } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import type { ResultadoAccion } from "@/lib/validacion/esquemas";

const uuid = z.string().uuid();
const numero = (max: number) => z.coerce.number().positive().max(max).optional().or(z.literal(""));

const esquemaMedicionRapida = z.object({
  pacienteId: uuid,
  peso: numero(400),
  talla: numero(300),
  sistolica: z.coerce.number().int().positive().max(300).optional().or(z.literal("")),
  diastolica: z.coerce.number().int().positive().max(200).optional().or(z.literal("")),
  frecuencia: z.coerce.number().int().positive().max(300).optional().or(z.literal("")),
  temperatura: numero(50),
  saturacion: z.coerce.number().int().positive().max(100).optional().or(z.literal("")),
  notas: z.string().trim().max(1000).optional().default(""),
});

const esquemaDiagnosticoRapido = z.object({
  pacienteId: uuid,
  codigo: z.string().trim().max(30).optional().default(""),
  descripcion: z.string().trim().min(3).max(500),
  tipo: z.string().trim().min(2).max(80).default("clínico"),
  certeza: z.string().trim().min(2).max(80).default("no_definida"),
});

async function atencionAbierta(pacienteId: string, profesionalId: string) {
  const supabase = crearClienteAdminDatos();
  const { data } = await supabase.from("clinical_encounters").select("id").eq("patient_id", pacienteId).eq("professional_id", profesionalId).eq("status", "open").order("encounter_date", { ascending: false }).limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function registrarMedicionRapida(formData: FormData): Promise<ResultadoAccion> {
  const sesion = await permisoParaAccion(PERMISOS.clinicoEscribir);
  const resultado = esquemaMedicionRapida.safeParse(Object.fromEntries(formData));
  if (!resultado.success || !sesion.profesionalId) return { ok: false, mensaje: "Revisa los valores de la medición." };
  const encounterId = await atencionAbierta(resultado.data.pacienteId, sesion.profesionalId);
  if (!encounterId) return { ok: false, mensaje: "Primero abre una atención para este paciente." };
  try {
    const supabase = crearClienteAdminDatos();
    const { error } = await supabase.from("clinical_measurements").insert({
      encounter_id: encounterId,
      patient_id: resultado.data.pacienteId,
      weight_kg: resultado.data.peso || null,
      height_cm: resultado.data.talla || null,
      systolic_bp: resultado.data.sistolica || null,
      diastolic_bp: resultado.data.diastolica || null,
      heart_rate_bpm: resultado.data.frecuencia || null,
      temperature_celsius: resultado.data.temperatura || null,
      oxygen_saturation_pct: resultado.data.saturacion || null,
      notes: resultado.data.notas || null,
      recorded_by: sesion.miembroId,
    });
    if (error) throw error;
    return { ok: true, mensaje: "Medición guardada." };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error) || "No se pudo guardar la medición." };
  }
}

export async function registrarDiagnosticoRapido(formData: FormData): Promise<ResultadoAccion> {
  const sesion = await permisoParaAccion(PERMISOS.clinicoEscribir);
  const resultado = esquemaDiagnosticoRapido.safeParse(Object.fromEntries(formData));
  if (!resultado.success || !sesion.profesionalId) return { ok: false, mensaje: "Describe el diagnóstico." };
  const encounterId = await atencionAbierta(resultado.data.pacienteId, sesion.profesionalId);
  if (!encounterId) return { ok: false, mensaje: "Primero abre una atención para este paciente." };
  try {
    const supabase = crearClienteAdminDatos();
    const { error } = await supabase.from("clinical_diagnoses").insert({
      encounter_id: encounterId,
      patient_id: resultado.data.pacienteId,
      coding_system: resultado.data.codigo ? "CIE-10" : "interno",
      diagnosis_code: resultado.data.codigo || null,
      diagnosis_description: resultado.data.descripcion,
      diagnosis_type: resultado.data.tipo,
      certainty: resultado.data.certeza,
      recorded_by: sesion.miembroId,
    });
    if (error) throw error;
    return { ok: true, mensaje: "Diagnóstico guardado." };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error) || "No se pudo guardar el diagnóstico." };
  }
}
