import "server-only";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { crearClientePublico } from "@/lib/supabase/publico";
import { CLINICA_VELARDE, clinicaSlugDesdeEntorno } from "@/lib/clinica/config";
import {
  diaSemana,
  fechaHoraZonaAIso,
  horaAMinutos,
  minutosAHora,
} from "@/lib/clinica/fechas";

export type FranjaDisponible = {
  inicio: string;
  etiqueta: string;
  profesionalId: string | null;
  profesionalNombre: string | null;
};

type ServicioDb = {
  id: number;
  nombre: string;
  slug: string | null;
  duracion_minutos: number | null;
  clinica_id: string;
};

type HorarioDb = {
  profesional_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
};

type CitaDb = {
  profesional_id: string | null;
  inicio: string;
  fin: string;
  estado: string;
};

type BloqueoDb = {
  profesional_id: string | null;
  inicio: string;
  fin: string;
};

function clienteAgenda() {
  try {
    return crearClienteAdminDatos();
  } catch {
    return crearClientePublico();
  }
}

export async function obtenerClinicaId(): Promise<string | null> {
  const supabase = clienteAgenda();
  if (!supabase) return null;
  const { data } = await supabase
    .from("clinicas")
    .select("id")
    .eq("slug", clinicaSlugDesdeEntorno())
    .maybeSingle();
  return data?.id ?? null;
}

export async function obtenerServicioPorSlug(slug: string) {
  const supabase = clienteAgenda();
  if (!supabase) return null;
  const clinicaId = await obtenerClinicaId();
  if (!clinicaId) return null;
  const { data, error } = await supabase
    .from("servicios")
    .select("id, nombre, slug, duracion_minutos, clinica_id")
    .eq("clinica_id", clinicaId)
    .eq("slug", slug)
    .eq("activo", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as ServicioDb;
}

export async function obtenerDisponibilidad(
  servicioSlug: string,
  fecha: string,
): Promise<{
  configurado: boolean;
  motivo?: string;
  franjas: FranjaDisponible[];
}> {
  const supabase = clienteAgenda();
  if (!supabase) return { configurado: false, motivo: "sin_configuracion", franjas: [] };

  try {
    const clinicaId = await obtenerClinicaId();
    if (!clinicaId) return { configurado: false, motivo: "sin_configuracion", franjas: [] };

    const servicio = await obtenerServicioPorSlug(servicioSlug);
    if (!servicio) return { configurado: false, motivo: "sin_servicio", franjas: [] };

    const dia = diaSemana(fecha);
    const { data: horarios, error: errorHorarios } = await supabase
      .from("horarios_profesional")
      .select("profesional_id, dia_semana, hora_inicio, hora_fin")
      .eq("clinica_id", clinicaId)
      .eq("dia_semana", dia)
      .eq("activo", true);

    if (errorHorarios || !horarios?.length) {
      return { configurado: true, motivo: "sin_horarios", franjas: [] };
    }

    const duracion = servicio.duracion_minutos ?? 30;
    const inicioDia = fechaHoraZonaAIso(fecha, "00:00", CLINICA_VELARDE.zonaHoraria);
    const finDia = fechaHoraZonaAIso(fecha, "23:59", CLINICA_VELARDE.zonaHoraria);

    const [{ data: citas }, { data: bloqueos }] = await Promise.all([
      supabase
        .from("citas")
        .select("profesional_id, inicio, fin, estado")
        .eq("clinica_id", clinicaId)
        .in("estado", ["confirmada", "en_espera", "atendida"])
        .gte("inicio", inicioDia)
        .lte("inicio", finDia),
      supabase
        .from("bloqueos_agenda")
        .select("profesional_id, inicio, fin")
        .eq("clinica_id", clinicaId)
        .gte("inicio", inicioDia)
        .lte("inicio", finDia),
    ]);

    const ocupados = [
      ...((citas ?? []) as CitaDb[]),
      ...((bloqueos ?? []) as BloqueoDb[]),
    ];

    const franjas: FranjaDisponible[] = [];

    for (const horario of horarios as HorarioDb[]) {
      const inicioMin = horaAMinutos(horario.hora_inicio);
      const finMin = horaAMinutos(horario.hora_fin);

      for (let minuto = inicioMin; minuto + duracion <= finMin; minuto += duracion) {
        const hora = minutosAHora(minuto);
        const inicioIso = fechaHoraZonaAIso(fecha, hora, CLINICA_VELARDE.zonaHoraria);
        const finIso = new Date(new Date(inicioIso).getTime() + duracion * 60_000).toISOString();

        const ocupado = ocupados.some(
          (item) =>
            item.profesional_id === horario.profesional_id &&
            new Date(inicioIso) < new Date(item.fin) &&
            new Date(item.inicio) < new Date(finIso),
        );

        if (!ocupado) {
          franjas.push({
            inicio: inicioIso,
            etiqueta: hora,
            profesionalId: horario.profesional_id,
            profesionalNombre: null,
          });
        }
      }
    }

    return {
      configurado: true,
      motivo: franjas.length ? undefined : "sin_disponibilidad",
      franjas,
    };
  } catch {
    return { configurado: false, motivo: "error", franjas: [] };
  }
}
