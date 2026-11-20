import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { crearClientePublico } from "@/lib/supabase/publico";
import { CLINICA_VELARDE, clinicaSlugDesdeEntorno, type ClinicaPublica, type Locale } from "@/lib/clinica/config";
import { SERVICIOS_PUBLICOS, PREGUNTAS_FRECUENTES } from "@/lib/contenido/servicios";

export type ServicioOpcion = {
  id: number | null;
  slug: string;
  nombre: string;
  duracionMinutos: number;
};

export type ProfesionalPublico = {
  id: string | null;
  nombre: string;
  especialidad: string;
};

export type ArticuloPublico = {
  slug: string;
  titulo: string;
  resumen: string;
  contenido: string;
  publicadoEn: string | null;
  locale: string;
};

type ClinicaDb = {
  id?: string;
  slug?: string;
  nombre?: string;
  nombre_comercial?: string | null;
  descripcion?: string | null;
  direccion?: string | null;
  ciudad?: string | null;
  departamento?: string | null;
  pais?: string | null;
  telefono?: string | null;
  whatsapp?: string | null;
  correo?: string | null;
  zona_horaria?: string | null;
  moneda?: string | null;
};

export async function obtenerClinicaPublica(): Promise<ClinicaPublica> {
  "use cache";
  cacheLife("hours");
  cacheTag("contenido-publico");

  const supabase = crearClientePublico();
  if (!supabase) return CLINICA_VELARDE;

  try {
    const { data, error } = await supabase
      .from("clinicas")
      .select(
        "id, slug, nombre, nombre_comercial, descripcion, direccion, ciudad, departamento, pais, telefono, whatsapp, correo, zona_horaria, moneda",
      )
      .eq("slug", clinicaSlugDesdeEntorno())
      .eq("activa", true)
      .maybeSingle();

    if (error || !data) return CLINICA_VELARDE;
    const fila = data as ClinicaDb;

    return {
      ...CLINICA_VELARDE,
      id: fila.id ?? null,
      slug: fila.slug ?? CLINICA_VELARDE.slug,
      nombre: fila.nombre ?? CLINICA_VELARDE.nombre,
      nombreCorto: fila.nombre_comercial ?? CLINICA_VELARDE.nombreCorto,
      descripcion: {
        es: fila.descripcion ?? CLINICA_VELARDE.descripcion.es,
        pt: fila.descripcion ?? CLINICA_VELARDE.descripcion.pt,
      },
      direccion: fila.direccion ?? CLINICA_VELARDE.direccion,
      ciudad: fila.ciudad ?? CLINICA_VELARDE.ciudad,
      departamento: fila.departamento ?? CLINICA_VELARDE.departamento,
      pais: fila.pais ?? CLINICA_VELARDE.pais,
      telefono: fila.telefono ?? CLINICA_VELARDE.telefono,
      whatsapp: fila.whatsapp ?? CLINICA_VELARDE.whatsapp,
      correo: fila.correo ?? null,
      zonaHoraria: fila.zona_horaria ?? CLINICA_VELARDE.zonaHoraria,
      moneda: fila.moneda ?? CLINICA_VELARDE.moneda,
    };
  } catch {
    return CLINICA_VELARDE;
  }
}

export async function obtenerServiciosReserva(): Promise<ServicioOpcion[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("contenido-publico");

  const supabase = crearClientePublico();
  const fallback: ServicioOpcion[] = SERVICIOS_PUBLICOS.map((servicio) => ({
    id: null,
    slug: servicio.slug,
    nombre: servicio.nombre.es,
    duracionMinutos: 30,
  }));

  if (!supabase) return fallback;

  try {
    const clinica = await supabase
      .from("clinicas")
      .select("id")
      .eq("slug", clinicaSlugDesdeEntorno())
      .maybeSingle();
    if (!clinica.data?.id) return fallback;

    const { data, error } = await supabase
      .from("servicios")
      .select("id, nombre, slug, duracion_minutos")
      .eq("clinica_id", clinica.data.id)
      .eq("activo", true)
      .eq("visible_web", true)
      .order("orden", { ascending: true });

    if (error || !data?.length) return fallback;

    return (data as Array<{ id: number; nombre: string; slug: string | null; duracion_minutos: number | null }>).map(
      (servicio) => ({
        id: servicio.id,
        slug: servicio.slug ?? `servicio-${servicio.id}`,
        nombre: servicio.nombre,
        duracionMinutos: servicio.duracion_minutos ?? 30,
      }),
    );
  } catch {
    return fallback;
  }
}

export async function obtenerProfesionalesPublicos(): Promise<ProfesionalPublico[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("contenido-publico");

  const fallback: ProfesionalPublico[] = [
    {
      id: null,
      nombre: CLINICA_VELARDE.medico.nombre,
      especialidad: CLINICA_VELARDE.medico.especialidad,
    },
  ];

  const supabase = crearClientePublico();
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from("profesionales")
      .select("id, especialidad, visible_web, activo, perfiles(nombres, apellidos)")
      .eq("visible_web", true)
      .eq("activo", true);

    if (error || !data?.length) return fallback;

    return (data as Array<{
      id: string;
      especialidad: string | null;
      perfiles?: { nombres?: string; apellidos?: string } | Array<{ nombres?: string; apellidos?: string }> | null;
    }>).map((fila) => {
      const perfil = Array.isArray(fila.perfiles) ? fila.perfiles[0] : fila.perfiles;
      return {
        id: fila.id,
        nombre:
          [perfil?.nombres, perfil?.apellidos].filter(Boolean).join(" ") ||
          CLINICA_VELARDE.medico.nombre,
        especialidad: fila.especialidad ?? CLINICA_VELARDE.medico.especialidad,
      };
    });
  } catch {
    return fallback;
  }
}

export async function obtenerArticulosPublicos(locale: Locale): Promise<ArticuloPublico[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("contenido-publico");

  const supabase = crearClientePublico();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from("articulos_blog")
      .select("slug, titulo, resumen, contenido, publicado_en, locale")
      .eq("estado", "publicado")
      .eq("locale", locale)
      .order("publicado_en", { ascending: false });

    if (error || !data) return [];
    return (data as Array<{
      slug: string;
      titulo: string;
      resumen: string | null;
      contenido: string;
      publicado_en: string | null;
      locale: string;
    }>).map((articulo) => ({
      slug: articulo.slug,
      titulo: articulo.titulo,
      resumen: articulo.resumen ?? "",
      contenido: articulo.contenido,
      publicadoEn: articulo.publicado_en,
      locale: articulo.locale,
    }));
  } catch {
    return [];
  }
}

export async function obtenerArticuloPublico(
  slug: string,
  locale: Locale,
): Promise<ArticuloPublico | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("contenido-publico");

  const supabase = crearClientePublico();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from("articulos_blog")
      .select("slug, titulo, resumen, contenido, publicado_en, locale")
      .eq("estado", "publicado")
      .eq("locale", locale)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return null;
    const articulo = data as {
      slug: string;
      titulo: string;
      resumen: string | null;
      contenido: string;
      publicado_en: string | null;
      locale: string;
    };
    return {
      slug: articulo.slug,
      titulo: articulo.titulo,
      resumen: articulo.resumen ?? "",
      contenido: articulo.contenido,
      publicadoEn: articulo.publicado_en,
      locale: articulo.locale,
    };
  } catch {
    return null;
  }
}

export async function obtenerPreguntasPublicas(locale: Locale) {
  "use cache";
  cacheLife("hours");
  cacheTag("contenido-publico");

  const fallback = PREGUNTAS_FRECUENTES.map((faq) => ({
    pregunta: faq.pregunta[locale],
    respuesta: faq.respuesta[locale],
  }));

  const supabase = crearClientePublico();
  if (!supabase) return fallback;

  try {
    const { data, error } = await supabase
      .from("preguntas_frecuentes")
      .select("pregunta, respuesta, orden")
      .eq("publicada", true)
      .eq("locale", locale)
      .order("orden", { ascending: true });
    if (error || !data?.length) return fallback;
    return (data as Array<{ pregunta: string; respuesta: string }>).map((fila) => ({
      pregunta: fila.pregunta,
      respuesta: fila.respuesta,
    }));
  } catch {
    return fallback;
  }
}
