import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { crearClienteDatos } from "@/lib/supabase/datos";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { leerEntornoSupabase } from "@/lib/supabase/entorno";
import {
  permisosDeRol,
  type Permiso,
  type RolPanel,
} from "./permisos";

export type Sesion = {
  usuarioId: string;
  email: string | null;
  nombre: string;
  clinicaId: string;
  clinicaSlug: string;
  clinicaNombre: string;
  miembroId: string;
  sucursalId: string | null;
  profesionalId: string | null;
  rol: RolPanel;
  permisos: Permiso[];
};

export type EstadoAuth = {
  configurado: boolean;
  autenticado: boolean;
  email: string | null;
  sesion: Sesion | null;
};

type StaffCrudo = {
  id?: string;
  auth_user_id?: string;
  professional_id?: string | null;
  first_name?: string;
  last_name?: string;
  work_email?: string | null;
  is_active?: boolean;
  staff_roles?: { code?: string } | Array<{ code?: string }> | null;
};

type SedeCruda = {
  location_id?: string;
  is_default?: boolean;
  clinic_locations?: { id?: string; clinic_id?: string; slug?: string; name?: string } | Array<{ id?: string; clinic_id?: string; slug?: string; name?: string }> | null;
};

function primerObjeto<T>(valor: T | T[] | null | undefined): T | null {
  if (Array.isArray(valor)) return valor[0] ?? null;
  return valor ?? null;
}

function rolPanelDesdeStaff(codigo: string | null | undefined): RolPanel | null {
  switch (codigo) {
    case "doctor": return "medico";
    case "receptionist": return "recepcion";
    case "clinic_admin":
    case "owner": return "administrador";
    case "laboratory_staff": return "laboratorio";
    default: return null;
  }
}

async function obtenerUsuario(
  supabase: Awaited<ReturnType<typeof crearClienteDatos>>,
): Promise<User | null> {
  const claims = await supabase.auth.getClaims();
  if (claims.error || !claims.data?.claims?.sub) return null;
  const user = await supabase.auth.getUser();
  return user.data.user ?? null;
}

export const obtenerEstadoAuth = cache(async (): Promise<EstadoAuth> => {
  const entorno = leerEntornoSupabase();
  if (!entorno.configurado) {
    return { configurado: false, autenticado: false, email: null, sesion: null };
  }

  try {
    const supabase = await crearClienteDatos();
    const usuario = await obtenerUsuario(supabase);
    if (!usuario) {
      return { configurado: true, autenticado: false, email: null, sesion: null };
    }

    // La membresía es el mecanismo que permite resolver el acceso inicial.
    // Algunas instalaciones protegen sus relaciones de rol/sede contra el
    // propio usuario; se leen aquí exclusivamente en servidor con el cliente
    // privado. Los datos clínicos siguen usando crearClienteDatos() + RLS.
    const supabaseIdentidad = crearClienteAdminDatos();
    const { data: staff, error } = await supabaseIdentidad
      .from("staff_members")
      .select("id, auth_user_id, professional_id, first_name, last_name, work_email, is_active, staff_roles(code)")
      .eq("auth_user_id", usuario.id)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error || !staff) {
      return {
        configurado: true,
        autenticado: true,
        email: usuario.email ?? null,
        sesion: null,
      };
    }

    const cruda = staff as StaffCrudo;
    const rol = rolPanelDesdeStaff(primerObjeto(cruda.staff_roles)?.code);
    if (!rol || !cruda.id) {
      return {
        configurado: true,
        autenticado: true,
        email: usuario.email ?? null,
        sesion: null,
      };
    }

    const nombre =
      [cruda.first_name, cruda.last_name].filter(Boolean).join(" ").trim() ||
      usuario.email?.split("@")[0] ||
      "Usuario";

    const { data: accesos } = await supabaseIdentidad
      .from("staff_location_access")
      .select("location_id, is_default, clinic_locations(id, clinic_id, slug, name)")
      .eq("staff_id", cruda.id)
      .order("is_default", { ascending: false })
      .limit(1);
    const sede = primerObjeto((accesos?.[0] as SedeCruda | undefined)?.clinic_locations);
    if (!sede?.clinic_id) {
      return { configurado: true, autenticado: true, email: usuario.email ?? null, sesion: null };
    }

    const { data: clinica } = await supabaseIdentidad
      .from("clinic_profile")
      .select("brand_name")
      .eq("id", sede.clinic_id)
      .maybeSingle();

    return {
      configurado: true,
      autenticado: true,
      email: usuario.email ?? null,
      sesion: {
        usuarioId: usuario.id,
        email: usuario.email ?? null,
        nombre,
        clinicaId: sede.clinic_id,
        clinicaSlug: sede.slug ?? "velarde",
        clinicaNombre: clinica?.brand_name ?? sede.name ?? "Centro Médico Especializado VELARDE",
        miembroId: cruda.id,
        sucursalId: sede.id ?? null,
        profesionalId: cruda.professional_id ?? null,
        rol,
        permisos: permisosDeRol(rol),
      },
    };
  } catch {
    return { configurado: true, autenticado: false, email: null, sesion: null };
  }
});

export function puede(sesion: Sesion | null, permiso: Permiso): boolean {
  return Boolean(sesion?.permisos.includes(permiso));
}

export function puedeAlguno(sesion: Sesion | null, permisos: Permiso[]): boolean {
  return permisos.some((permiso) => puede(sesion, permiso));
}

export async function requerirSesion(locale: string): Promise<Sesion> {
  const estado = await obtenerEstadoAuth();
  if (!estado.configurado) redirect(`/${locale}/ingresar?estado=sin-configurar`);
  if (!estado.autenticado) redirect(`/${locale}/ingresar`);
  if (!estado.sesion) redirect(`/${locale}/ingresar?estado=sin-acceso`);
  return estado.sesion;
}

export async function requerirPermiso(
  locale: string,
  permiso: Permiso,
): Promise<Sesion> {
  const sesion = await requerirSesion(locale);
  if (!puede(sesion, permiso)) redirect(`/${locale}/panel?estado=sin-permiso`);
  return sesion;
}

export async function sesionParaAccion(): Promise<Sesion> {
  const estado = await obtenerEstadoAuth();
  if (!estado.sesion) throw new Error("NO_AUTENTICADO");
  return estado.sesion;
}

export async function permisoParaAccion(permiso: Permiso): Promise<Sesion> {
  const sesion = await sesionParaAccion();
  if (!puede(sesion, permiso)) throw new Error("SIN_PERMISO");
  return sesion;
}
