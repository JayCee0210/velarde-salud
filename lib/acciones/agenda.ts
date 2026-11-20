"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { crearClienteDatos, mensajeDeError } from "@/lib/supabase/datos";
import { permisoParaAccion } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import { CLINICA_VELARDE } from "@/lib/clinica/config";
import { fechaHoraZonaAIso } from "@/lib/clinica/fechas";
import { esquemaCita, esquemaHorario, type ResultadoAccion } from "@/lib/validacion/esquemas";

const esquemaSolicitudEstado = z.object({
  solicitudId: z.string().uuid(),
  estado: z.enum(["contactada", "rechazada"]),
});

const esquemaConvertir = z.object({
  solicitudId: z.string().uuid(),
  profesionalId: z.string().uuid().optional().or(z.literal("")),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  duracionMinutos: z.coerce.number().int().min(5).max(240).default(30),
});

function finDeInicio(inicio: string, duracion: number): string {
  return new Date(new Date(inicio).getTime() + duracion * 60_000).toISOString();
}

function revalidar(locale: string) {
  revalidatePath(`/${locale}/panel`);
  revalidatePath(`/${locale}/panel/agenda`);
  revalidatePath(`/${locale}/panel/solicitudes`);
}

export async function crearCitaPanel(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const sesion = await permisoParaAccion(PERMISOS.agendaGestionar);
  const fecha = String(formData.get("fecha") ?? "");
  const hora = String(formData.get("hora") ?? "");
  const resultado = esquemaCita.safeParse({
    pacienteId: formData.get("pacienteId"),
    servicioId: formData.get("servicioId"),
    profesionalId: formData.get("profesionalId") || "",
    inicio: fecha && hora ? fechaHoraZonaAIso(fecha, hora, CLINICA_VELARDE.zonaHoraria) : "",
    duracionMinutos: formData.get("duracionMinutos") || 30,
    estado: "confirmada",
    motivoAdministrativo: formData.get("motivoAdministrativo") || "",
  });
  if (!resultado.success) {
    return { ok: false, mensaje: "Revisa los datos de la cita.", campos: resultado.error.flatten().fieldErrors };
  }

  try {
    const supabase = await crearClienteDatos();
    const { data: paciente } = await supabase
      .from("pacientes")
      .select("id")
      .eq("id", resultado.data.pacienteId)
      .eq("clinica_id", sesion.clinicaId)
      .maybeSingle();
    if (!paciente) return { ok: false, mensaje: "Paciente no encontrado." };

    const { error } = await supabase.from("citas").insert({
      clinica_id: sesion.clinicaId,
      paciente_id: resultado.data.pacienteId,
      servicio_id: resultado.data.servicioId,
      profesional_id: resultado.data.profesionalId,
      inicio: resultado.data.inicio,
      fin: finDeInicio(resultado.data.inicio, resultado.data.duracionMinutos),
      estado: "confirmada",
      motivo_administrativo: resultado.data.motivoAdministrativo,
      creado_por: sesion.usuarioId,
    });
    if (error) throw error;
    revalidar(locale);
    return { ok: true, mensaje: "Cita registrada." };
  } catch (error) {
    return { ok: false, mensaje: mensajeDeError(error).toLowerCase().includes("conflict") ? "Ese horario ya está ocupado." : "No se pudo registrar la cita." };
  }
}

export async function cambiarEstadoCita(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const sesion = await permisoParaAccion(PERMISOS.agendaGestionar);
  const id = String(formData.get("citaId") ?? "");
  const nuevoEstado = String(formData.get("estado") ?? "");
  if (!z.string().uuid().safeParse(id).success || !["confirmada", "en_espera", "atendida", "cancelada", "no_asistio"].includes(nuevoEstado)) {
    return { ok: false, mensaje: "Datos inválidos." };
  }
  try {
    const supabase = await crearClienteDatos();
    const { error } = await supabase
      .from("citas")
      .update({ estado: nuevoEstado })
      .eq("id", id)
      .eq("clinica_id", sesion.clinicaId);
    if (error) throw error;
    revalidar(locale);
    return { ok: true, mensaje: "Estado actualizado." };
  } catch {
    return { ok: false, mensaje: "No se pudo actualizar la cita." };
  }
}

export async function convertirSolicitud(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const sesion = await permisoParaAccion(PERMISOS.solicitudesGestionar);
  const resultado = esquemaConvertir.safeParse({
    solicitudId: formData.get("solicitudId"),
    profesionalId: formData.get("profesionalId") || "",
    fecha: formData.get("fecha"),
    hora: formData.get("hora"),
    duracionMinutos: formData.get("duracionMinutos") || 30,
  });
  if (!resultado.success) return { ok: false, mensaje: "Revisa la fecha y la hora." };

  try {
    const supabase = await crearClienteDatos();
    const { data: solicitud } = await supabase
      .from("solicitudes_cita")
      .select("id, servicio_id, servicio_slug, estado")
      .eq("id", resultado.data.solicitudId)
      .eq("clinica_id", sesion.clinicaId)
      .maybeSingle();
    if (!solicitud || solicitud.estado !== "pendiente" && solicitud.estado !== "contactada") {
      return { ok: false, mensaje: "La solicitud ya fue procesada." };
    }

    let servicioId = solicitud.servicio_id as number | null;
    if (!servicioId && solicitud.servicio_slug) {
      const { data: servicio } = await supabase
        .from("servicios")
        .select("id")
        .eq("clinica_id", sesion.clinicaId)
        .eq("slug", solicitud.servicio_slug)
        .maybeSingle();
      servicioId = servicio?.id ?? null;
    }
    if (!servicioId) return { ok: false, mensaje: "El servicio de la solicitud no está configurado." };

    const inicio = fechaHoraZonaAIso(resultado.data.fecha, resultado.data.hora, CLINICA_VELARDE.zonaHoraria);
    const { data: cita, error: errorCita } = await supabase
      .from("citas")
      .insert({
        clinica_id: sesion.clinicaId,
        paciente_id: null,
        servicio_id: servicioId,
        profesional_id: resultado.data.profesionalId,
        inicio,
        fin: finDeInicio(inicio, resultado.data.duracionMinutos),
        estado: "confirmada",
        creado_por: sesion.usuarioId,
      })
      .select("id")
      .maybeSingle();
    if (errorCita) throw errorCita;

    const { error: errorSolicitud } = await supabase
      .from("solicitudes_cita")
      .update({ estado: "convertida", cita_id: cita?.id ?? null })
      .eq("id", resultado.data.solicitudId)
      .eq("clinica_id", sesion.clinicaId);
    if (errorSolicitud) throw errorSolicitud;

    revalidar(locale);
    return { ok: true, mensaje: "Solicitud convertida en cita." };
  } catch {
    return { ok: false, mensaje: "No se pudo convertir la solicitud." };
  }
}

export async function marcarSolicitud(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const sesion = await permisoParaAccion(PERMISOS.solicitudesGestionar);
  const resultado = esquemaSolicitudEstado.safeParse({
    solicitudId: formData.get("solicitudId"),
    estado: formData.get("estado"),
  });
  if (!resultado.success) return { ok: false, mensaje: "Datos inválidos." };
  try {
    const supabase = await crearClienteDatos();
    const { error } = await supabase
      .from("solicitudes_cita")
      .update({ estado: resultado.data.estado })
      .eq("id", resultado.data.solicitudId)
      .eq("clinica_id", sesion.clinicaId);
    if (error) throw error;
    revalidar(locale);
    return { ok: true, mensaje: "Solicitud actualizada." };
  } catch {
    return { ok: false, mensaje: "No se pudo actualizar la solicitud." };
  }
}

export async function crearHorario(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const sesion = await permisoParaAccion(PERMISOS.agendaGestionar);
  const resultado = esquemaHorario.safeParse({
    profesionalId: formData.get("profesionalId"),
    diaSemana: formData.get("diaSemana"),
    horaInicio: formData.get("horaInicio"),
    horaFin: formData.get("horaFin"),
    vigenteDesde: formData.get("vigenteDesde") || "",
    vigenteHasta: formData.get("vigenteHasta") || "",
  });
  if (!resultado.success) return { ok: false, mensaje: "Revisa el horario." };
  try {
    const supabase = await crearClienteDatos();
    const { error } = await supabase.from("horarios_profesional").insert({
      clinica_id: sesion.clinicaId,
      profesional_id: resultado.data.profesionalId,
      dia_semana: resultado.data.diaSemana,
      hora_inicio: resultado.data.horaInicio,
      hora_fin: resultado.data.horaFin,
      vigente_desde: resultado.data.vigenteDesde,
      vigente_hasta: resultado.data.vigenteHasta,
      activo: true,
    });
    if (error) throw error;
    revalidatePath(`/${locale}/panel/agenda`);
    return { ok: true, mensaje: "Horario registrado." };
  } catch {
    return { ok: false, mensaje: "No se pudo registrar el horario." };
  }
}

const esquemaBloqueo = z.object({
  profesionalId: z.string().uuid().optional().or(z.literal("")),
  inicio: z.string().min(16),
  fin: z.string().min(16),
  motivo: z.string().trim().max(300).optional(),
});

export async function crearBloqueo(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const sesion = await permisoParaAccion(PERMISOS.agendaGestionar);
  const resultado = esquemaBloqueo.safeParse({
    profesionalId: formData.get("profesionalId") || "",
    inicio: formData.get("inicio"),
    fin: formData.get("fin"),
    motivo: formData.get("motivo") || "",
  });
  if (!resultado.success || new Date(resultado.data.inicio) >= new Date(resultado.data.fin)) {
    return { ok: false, mensaje: "Revisa el inicio y el fin del bloqueo." };
  }
  try {
    const supabase = await crearClienteDatos();
    const { error } = await supabase.from("bloqueos_agenda").insert({
      clinica_id: sesion.clinicaId,
      profesional_id: resultado.data.profesionalId,
      inicio: new Date(resultado.data.inicio).toISOString(),
      fin: new Date(resultado.data.fin).toISOString(),
      motivo: resultado.data.motivo,
      creado_por: sesion.usuarioId,
    });
    if (error) throw error;
    revalidatePath(`/${locale}/panel/agenda`);
    return { ok: true, mensaje: "Bloqueo registrado." };
  } catch {
    return { ok: false, mensaje: "No se pudo registrar el bloqueo." };
  }
}
