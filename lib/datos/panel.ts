import "server-only";

import { crearClienteDatos } from "@/lib/supabase/datos";
import type { Sesion } from "@/lib/auth/sesion";
import { CLINICA_VELARDE } from "@/lib/clinica/config";
import { fechaHoraZonaAIso } from "@/lib/clinica/fechas";

export type CitaPanel = {
  id: string;
  inicio: string;
  fin: string;
  estado: string;
  motivo_administrativo: string | null;
  paciente_id: string;
  paciente: string;
  telefono: string | null;
  servicio: string;
  profesional: string | null;
};

export type SolicitudPanel = {
  id: string;
  referencia: string | null;
  nombre_solicitante: string;
  telefono: string;
  correo: string | null;
  fecha_preferida: string;
  hora_preferida: string | null;
  franja: string;
  estado: string;
  creado_en: string;
  servicio: string;
};

export type PacientePanel = {
  id: string;
  nombre_completo: string;
  ci: string | null;
  fecha_nacimiento: string | null;
  sexo: string | null;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  ciudad: string | null;
  creado_en: string;
  actualizado_en: string;
};

type Relacion<T> = T | T[] | null;

function primero<T>(valor: Relacion<T>): T | null {
  return Array.isArray(valor) ? valor[0] ?? null : valor ?? null;
}

function nombrePaciente(valor: { first_name?: string; last_name?: string } | null): string {
  return [valor?.first_name, valor?.last_name].filter(Boolean).join(" ") || "Paciente";
}

export function hoyEnClinica(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: CLINICA_VELARDE.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function rangoDia(fecha: string) {
  return {
    inicio: fechaHoraZonaAIso(fecha, "00:00", CLINICA_VELARDE.zonaHoraria),
    fin: fechaHoraZonaAIso(fecha, "23:59", CLINICA_VELARDE.zonaHoraria),
  };
}

export async function obtenerResumen(sesion: Sesion) {
  const supabase = await crearClienteDatos();
  const { inicio, fin } = rangoDia(hoyEnClinica());
  let citasConsulta = supabase.from("appointments").select("id", { count: "exact", head: true })
    .eq("location_id", sesion.sucursalId ?? "00000000-0000-0000-0000-000000000000")
    .in("status", ["confirmed", "checked_in", "in_progress"]).gte("starts_at", inicio).lte("starts_at", fin);
  if (sesion.profesionalId) citasConsulta = citasConsulta.eq("professional_id", sesion.profesionalId);
  const proximaConsulta = supabase.from("appointments")
    .select("id, starts_at, ends_at, status, patient_id, patients(first_name, last_name, phone), services(code), medical_professionals(full_name)")
    .eq("location_id", sesion.sucursalId ?? "00000000-0000-0000-0000-000000000000")
    .in("status", ["confirmed", "checked_in", "in_progress"]).gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true }).limit(1).maybeSingle();
  const [citas, solicitudes, proxima] = await Promise.all([
    citasConsulta,
    supabase.from("appointment_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    proximaConsulta,
  ]);
  const fila = proxima.data as {
    id: string; starts_at: string; ends_at: string; status: string; patient_id: string;
    patients?: Relacion<{ first_name?: string; last_name?: string; phone?: string }>;
    services?: Relacion<{ code?: string }>;
    medical_professionals?: Relacion<{ full_name?: string }>;
  } | null;
  const paciente = primero(fila?.patients ?? null);
  const servicio = primero(fila?.services ?? null);
  const profesional = primero(fila?.medical_professionals ?? null);
  return {
    citasHoy: citas.count ?? 0,
    solicitudesPendientes: solicitudes.count ?? 0,
    seguimientosPendientes: 0,
    proxima: fila ? {
      id: fila.id, inicio: fila.starts_at, fin: fila.ends_at, estado: fila.status,
      pacienteId: fila.patient_id, paciente: nombrePaciente(paciente), telefono: paciente?.phone ?? null,
      servicio: servicio?.code ?? "Consulta", profesional: profesional?.full_name ?? null,
    } : null,
  };
}

export async function listarCitas(sesion: Sesion, fecha: string): Promise<CitaPanel[]> {
  const supabase = await crearClienteDatos();
  const { inicio, fin } = rangoDia(fecha);
  let consulta = supabase.from("appointments")
    .select("id, starts_at, ends_at, status, administrative_notes, patient_id, patients(first_name, last_name, phone), services(code), medical_professionals(full_name)")
    .eq("location_id", sesion.sucursalId ?? "00000000-0000-0000-0000-000000000000")
    .gte("starts_at", inicio).lte("starts_at", fin).order("starts_at", { ascending: true });
  if (sesion.profesionalId) consulta = consulta.eq("professional_id", sesion.profesionalId);
  const { data, error } = await consulta;
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map((fila) => {
    const paciente = primero(fila.patients as Relacion<{ first_name?: string; last_name?: string; phone?: string }>);
    const servicio = primero(fila.services as Relacion<{ code?: string }>);
    const profesional = primero(fila.medical_professionals as Relacion<{ full_name?: string }>);
    return {
      id: String(fila.id), inicio: String(fila.starts_at), fin: String(fila.ends_at), estado: String(fila.status),
      motivo_administrativo: (fila.administrative_notes as string | null) ?? null, paciente_id: String(fila.patient_id),
      paciente: nombrePaciente(paciente), telefono: paciente?.phone ?? null, servicio: servicio?.code ?? "Consulta",
      profesional: profesional?.full_name ?? null,
    };
  });
}

export async function listarSolicitudes(_sesion: Sesion): Promise<SolicitudPanel[]> {
  void _sesion;
  const supabase = await crearClienteDatos();
  const { data, error } = await supabase.from("appointment_requests")
    .select("id, requester_name, requester_phone, preferred_date, preferred_time_window, status, created_at, services(code)")
    .order("created_at", { ascending: false }).limit(100);
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).map((fila) => ({
    id: String(fila.id), referencia: null, nombre_solicitante: String(fila.requester_name), telefono: String(fila.requester_phone),
    correo: null, fecha_preferida: String(fila.preferred_date ?? ""), hora_preferida: null,
    franja: String(fila.preferred_time_window ?? "indiferente"), estado: String(fila.status), creado_en: String(fila.created_at),
    servicio: primero(fila.services as Relacion<{ code?: string }>)?.code ?? "Consulta",
  }));
}

function normalizarBusqueda(valor: string) {
  return valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().slice(0, 80);
}

export async function listarPacientes(_sesion: Sesion, busqueda = ""): Promise<PacientePanel[]> {
  const supabase = await crearClienteDatos();
  const palabras = normalizarBusqueda(busqueda).replace(/[,%()]/g, " ").split(/\s+/).filter(Boolean).slice(0, 4);
  let consulta = supabase.from("patients").select("id, first_name, last_name, date_of_birth, phone, whatsapp_phone, email, created_at, updated_at")
    .eq("status", "active").order("last_name", { ascending: true }).limit(100);
  if (palabras[0]) {
    const termino = palabras[0].replace(/[^a-z0-9+ ]/g, "");
    consulta = consulta.or(`first_name.ilike.%${termino}%,last_name.ilike.%${termino}%,phone.ilike.%${termino}%,whatsapp_phone.ilike.%${termino}%`);
  }
  const { data, error } = await consulta;
  if (error || !data) return [];
  return (data as Array<Record<string, unknown>>).filter((fila) => {
    if (palabras.length <= 1) return true;
    const nombre = normalizarBusqueda(`${fila.first_name ?? ""} ${fila.last_name ?? ""}`);
    const telefono = `${fila.phone ?? ""} ${fila.whatsapp_phone ?? ""}`.replace(/\D/g, "");
    return palabras.every((palabra) => nombre.includes(palabra) || telefono.includes(palabra.replace(/\D/g, "")));
  }).slice(0, 60).map((fila) => ({
    id: String(fila.id), nombre_completo: [fila.first_name, fila.last_name].filter(Boolean).join(" "), ci: null,
    fecha_nacimiento: (fila.date_of_birth as string | null) ?? null, sexo: null,
    telefono: (fila.whatsapp_phone as string | null) ?? (fila.phone as string | null) ?? null,
    correo: (fila.email as string | null) ?? null, direccion: null, ciudad: null,
    creado_en: String(fila.created_at), actualizado_en: String(fila.updated_at),
  }));
}

export async function obtenerPaciente(_sesion: Sesion, pacienteId: string): Promise<PacientePanel | null> {
  const supabase = await crearClienteDatos();
  const { data, error } = await supabase.from("patients").select("id, first_name, last_name, date_of_birth, phone, email, created_at, updated_at").eq("id", pacienteId).maybeSingle();
  if (error || !data) return null;
  return {
    id: String(data.id), nombre_completo: [data.first_name, data.last_name].filter(Boolean).join(" "), ci: null,
    fecha_nacimiento: data.date_of_birth ?? null, sexo: null, telefono: data.phone ?? null, correo: data.email ?? null,
    direccion: null, ciudad: null, creado_en: data.created_at, actualizado_en: data.updated_at,
  };
}

export async function obtenerContextoPaciente(_sesion: Sesion, pacienteId: string) {
  const supabase = await crearClienteDatos();
  const [consultas, notas, embarazos, ordenes, documentos, resumen, recetas] = await Promise.all([
    supabase.from("clinical_encounters").select("id, encounter_date, consultation_type, status, appointment_id").eq("patient_id", pacienteId).order("encounter_date", { ascending: false }).limit(30),
    supabase.from("clinical_notes").select("id, encounter_id, chief_complaint, clinical_assessment, treatment_plan, status, created_at").eq("patient_id", pacienteId).order("created_at", { ascending: false }).limit(30),
    supabase.from("pregnancy_episodes").select("id, patient_id, last_menstrual_period, estimated_due_date, status, notes, created_at").eq("patient_id", pacienteId).order("created_at", { ascending: false }),
    supabase.from("lab_orders").select("id, patient_id, status, clinical_notes, ordered_at, lab_order_items(id, test_name, status, lab_results(id, result_value, result_unit, reference_range))").eq("patient_id", pacienteId).order("ordered_at", { ascending: false }),
    supabase.from("clinical_documents").select("id, patient_id, document_type, file_name, storage_bucket, storage_path, status, uploaded_at").eq("patient_id", pacienteId).order("uploaded_at", { ascending: false }),
    supabase.from("patient_clinical_summaries").select("id, blood_type, allergies_summary, chronic_conditions_summary, surgical_history_summary, gynecological_obstetric_baseline, current_medications_summary, version_number, created_at").eq("patient_id", pacienteId).eq("is_current", true).maybeSingle(),
    supabase.from("clinical_prescriptions").select("id, status, clinical_instructions, created_at, clinical_prescription_items(medication_name, dosage, frequency, duration, route, notes)").eq("patient_id", pacienteId).order("created_at", { ascending: false }).limit(30),
  ]);
  return { consultas: consultas.data ?? [], notas: notas.data ?? [], embarazos: embarazos.data ?? [], ordenes: ordenes.data ?? [], documentos: documentos.data ?? [], resumen: resumen.data ?? null, recetas: recetas.data ?? [] };
}

export async function listarEmbarazos(_sesion: Sesion) {
  void _sesion;
  const supabase = await crearClienteDatos();
  const { data } = await supabase.from("pregnancy_episodes").select("id, patient_id, last_menstrual_period, estimated_due_date, status, created_at, patients(first_name, last_name)").eq("status", "active").order("created_at", { ascending: false });
  return data ?? [];
}

export async function listarOrdenesLaboratorio(_sesion: Sesion) {
  void _sesion;
  const supabase = await crearClienteDatos();
  const { data } = await supabase.from("lab_orders").select("id, status, clinical_notes, ordered_at, patient_id, patients(first_name, last_name), lab_order_items(id, test_name, status, lab_results(id, result_value, result_unit, reference_range))").order("ordered_at", { ascending: false }).limit(100);
  return data ?? [];
}
