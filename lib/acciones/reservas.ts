"use server";

import { headers } from "next/headers";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { crearClientePublico } from "@/lib/supabase/publico";
import { mensajeDeError } from "@/lib/supabase/datos";
import { obtenerClinicaId, obtenerServicioPorSlug } from "@/lib/datos/agenda";
import { esquemaContacto, esquemaSolicitudCita, type ResultadoAccion } from "@/lib/validacion/esquemas";
import { ipDeCabeceras, limitar } from "@/lib/seguridad/limite";
import { CLINICA_VELARDE } from "@/lib/clinica/config";

function referencia(): string {
  return `V-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

async function clienteEscrituraPublica() {
  const publico = crearClientePublico();
  if (publico) return publico;
  try {
    return crearClienteAdminDatos();
  } catch {
    return null;
  }
}

export async function crearSolicitudCita(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const cabeceras = await headers();
  const ip = ipDeCabeceras(cabeceras);
  if (!limitar(`solicitud:${ip}`, 5, 10 * 60_000).permitido) {
    return { ok: false, mensaje: "Demasiadas solicitudes. Intenta más tarde o escribe por WhatsApp." };
  }

  const resultado = esquemaSolicitudCita.safeParse({
    servicioSlug: formData.get("servicioSlug"),
    servicioId: formData.get("servicioId") || undefined,
    profesionalId: formData.get("profesionalId") || "",
    fechaPreferida: formData.get("fechaPreferida"),
    horaPreferida: formData.get("horaPreferida") || "",
    franja: formData.get("franja") || "indiferente",
    nombreSolicitante: formData.get("nombreSolicitante"),
    telefono: formData.get("telefono"),
    correo: formData.get("correo") || "",
    avisoPrivacidad: formData.get("avisoPrivacidad"),
    sitioWeb: formData.get("sitioWeb") || "",
  });

  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa los datos del formulario.",
      campos: resultado.error.flatten().fieldErrors,
    };
  }

  if (resultado.data.sitioWeb) {
    return { ok: false, mensaje: "No se pudo procesar la solicitud." };
  }

  const clinicaId = await obtenerClinicaId();
  const servicio = await obtenerServicioPorSlug(resultado.data.servicioSlug);
  if (!clinicaId || !servicio) {
    return {
      ok: false,
      mensaje:
        "La agenda en línea aún no está habilitada. Escríbenos por WhatsApp para coordinar una cita.",
    };
  }

  const cliente = await clienteEscrituraPublica();
  if (!cliente) {
    return {
      ok: false,
      mensaje:
        "La agenda en línea aún no está habilitada. Escríbenos por WhatsApp para coordinar una cita.",
    };
  }

  const ref = referencia();
  try {
    const { error } = await cliente.from("solicitudes_cita").insert({
      clinica_id: clinicaId,
      servicio_id: servicio.id,
      profesional_id: resultado.data.profesionalId,
      nombre_solicitante: resultado.data.nombreSolicitante,
      telefono: resultado.data.telefono,
      correo: resultado.data.correo,
      fecha_preferida: resultado.data.fechaPreferida,
      hora_preferida: resultado.data.horaPreferida,
      franja: resultado.data.franja,
      estado: "pendiente",
      origen: "web",
      referencia: ref,
      aviso_privacidad_aceptado_en: new Date().toISOString(),
    });
    if (error) throw error;
  } catch (error) {
    return {
      ok: false,
      mensaje:
        mensajeDeError(error).includes("relation")
          ? "La agenda aún no está configurada. Escríbenos por WhatsApp."
          : "No se pudo registrar la solicitud. Intenta nuevamente o escribe por WhatsApp.",
    };
  }

  return {
    ok: true,
    mensaje: "Solicitud registrada. Recepción se comunicará contigo para confirmar.",
    referencia: ref,
  };
}

export async function enviarContacto(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const cabeceras = await headers();
  const ip = ipDeCabeceras(cabeceras);
  if (!limitar(`contacto:${ip}`, 5, 10 * 60_000).permitido) {
    return { ok: false, mensaje: "Demasiados mensajes. Intenta más tarde." };
  }

  const resultado = esquemaContacto.safeParse({
    nombre: formData.get("nombre"),
    telefono: formData.get("telefono"),
    mensaje: formData.get("mensaje"),
    sitioWeb: formData.get("sitioWeb") || "",
  });
  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa los datos ingresados.",
      campos: resultado.error.flatten().fieldErrors,
    };
  }
  if (resultado.data.sitioWeb) return { ok: false, mensaje: "No se pudo procesar el mensaje." };

  const clinicaId = await obtenerClinicaId();
  const cliente = await clienteEscrituraPublica();
  if (!clinicaId || !cliente) {
    return {
      ok: false,
      mensaje: `El formulario aún no está habilitado. Escríbenos por WhatsApp al ${CLINICA_VELARDE.whatsapp}.`,
    };
  }

  try {
    const { error } = await cliente.from("solicitudes_contacto").insert({
      clinica_id: clinicaId,
      nombre: resultado.data.nombre,
      telefono: resultado.data.telefono,
      mensaje: resultado.data.mensaje,
      estado: "pendiente",
      origen: "web",
    });
    if (error) throw error;
  } catch {
    return {
      ok: false,
      mensaje: "No se pudo enviar el mensaje. Intenta nuevamente o escribe por WhatsApp.",
    };
  }

  return { ok: true, mensaje: "Mensaje recibido. Recepción se comunicará contigo." };
}
