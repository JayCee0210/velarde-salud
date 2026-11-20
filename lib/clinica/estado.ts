// Estado de conexión con Supabase y verificación del esquema.
// Módulo de SERVIDOR: usa el cliente con cookies (anon + RLS).
import "server-only";
import { connection } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { enmascararClave, leerEntornoSupabase } from "@/lib/supabase/entorno";
import type { Especialidad } from "@/lib/supabase/tipos";

export type EstadoTabla =
  | "ok"
  | "ausente"
  | "sin_permiso"
  | "sin_configurar"
  | "error";

export type ResultadoTabla = {
  estado: EstadoTabla;
  filas: number | null;
  detalle: string;
};

export type EstadoConexion = {
  verificadoEn: string;
  configurado: boolean;
  motivo: string | null;
  url: string | null;
  anonEnmascarada: string | null;
  red: { ok: boolean; detalle: string };
  especialidades: ResultadoTabla & { datos: Especialidad[] };
  servicios: ResultadoTabla;
  pacientesRls: ResultadoTabla;
};

function mensajeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

function clasificarError(error: unknown): ResultadoTabla {
  const mensaje = mensajeError(error);
  const codigo =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  if (
    codigo === "PGRST205" ||
    /could not find the table|does not exist/i.test(mensaje)
  ) {
    return {
      estado: "ausente",
      filas: null,
      detalle: "Tabla no encontrada en el esquema (ejecuta supabase/schema.sql).",
    };
  }
  if (
    codigo === "42501" ||
    codigo === "PGRST301" ||
    /permission denied|row-level security|JWT|apikey/i.test(mensaje)
  ) {
    return {
      estado: "sin_permiso",
      filas: null,
      detalle: `Acceso denegado por RLS/auth: ${mensaje}`,
    };
  }
  return { estado: "error", filas: null, detalle: mensaje };
}

const SIN_CONFIGURAR: ResultadoTabla = {
  estado: "sin_configurar",
  filas: null,
  detalle: "Sin configurar: pega tus claves en .env.local.",
};

export async function obtenerEstadoConexion(): Promise<EstadoConexion> {
  // Se ejecuta en tiempo de petición (dentro de <Suspense>): fecha,
  // ping y consultas cambian por cada visita.
  await connection();

  const entorno = leerEntornoSupabase();
  const verificadoEn = new Date().toLocaleString("es-BO", {
    timeZone: "America/La_Paz",
    dateStyle: "medium",
    timeStyle: "medium",
  });

  const base: EstadoConexion = {
    verificadoEn,
    configurado: entorno.configurado,
    motivo: entorno.motivo,
    url: entorno.configurado ? entorno.url : null,
    anonEnmascarada: entorno.configurado ? enmascararClave(entorno.anonKey) : null,
    red: { ok: false, detalle: "No se verificó." },
    especialidades: { ...SIN_CONFIGURAR, datos: [] },
    servicios: SIN_CONFIGURAR,
    pacientesRls: SIN_CONFIGURAR,
  };

  if (!entorno.configurado) return base;

  // 1) Ping a la API REST de Supabase (sin exponer secretos)
  try {
    const respuesta = await fetch(`${entorno.url}/rest/v1/`, {
      headers: { apikey: entorno.anonKey, accept: "application/openapi+json" },
      signal: AbortSignal.timeout(5000),
    });
    base.red = respuesta.ok
      ? { ok: true, detalle: `API REST accesible (HTTP ${respuesta.status}).` }
      : { ok: false, detalle: `API REST respondió HTTP ${respuesta.status}.` };
  } catch (error) {
    base.red = { ok: false, detalle: `Sin respuesta: ${mensajeError(error)}` };
  }

  try {
    const supabase = await crearClienteServidor();

    // 2) Esquema: áreas médicas (datos semilla)
    const { data, error } = await supabase
      .from("especialidades")
      .select("*")
      .order("nombre");

    if (error) {
      const clasificado = clasificarError(error);
      base.especialidades = { ...clasificado, datos: [] };
    } else {
      base.especialidades = {
        estado: "ok",
        filas: data.length,
        detalle: `${data.length} área(s) médica(s) visibles con la clave pública (RLS).`,
        datos: data,
      };
    }

    // 3) Servicios
    const servicios = await supabase
      .from("servicios")
      .select("id", { count: "exact", head: true });

    if (servicios.error) {
      base.servicios = clasificarError(servicios.error);
    } else {
      base.servicios = {
        estado: "ok",
        filas: servicios.count ?? 0,
        detalle: `${servicios.count ?? 0} servicio(s) registrado(s).`,
      };
    }

    // 4) RLS: pacientes NO debe ser legible desde el rol anónimo
    const pacientes = await supabase
      .from("pacientes")
      .select("id", { count: "exact", head: true });

    if (pacientes.error) {
      base.pacientesRls = clasificarError(pacientes.error);
    } else {
      const visibles = pacientes.count ?? 0;
      base.pacientesRls =
        visibles === 0
          ? {
              estado: "ok",
              filas: 0,
              detalle: "0 filas visibles para el rol anónimo (RLS activa, como se espera).",
            }
          : {
              estado: "sin_permiso",
              filas: visibles,
              detalle: `⚠ El rol anónimo ve ${visibles} fila(s): revisa las políticas RLS de pacientes.`,
            };
    }
  } catch (error) {
    const detalle = `No se pudo consultar el esquema: ${mensajeError(error)}`;
    base.especialidades = { estado: "error", filas: null, detalle, datos: [] };
    base.servicios = { estado: "error", filas: null, detalle };
    base.pacientesRls = { estado: "error", filas: null, detalle };
  }

  return base;
}
