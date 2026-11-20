// Cliente Supabase con service_role — SOLO SERVIDOR.
// Bypasea RLS: úsalo únicamente en tareas administrativas internas
// (jobs, migraciones, operaciones que requieren acceso total).
// Prohibido importar este módulo en componentes cliente.
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { leerEntornoSupabase } from "./entorno";
import type { Database } from "./tipos";

export function crearClienteAdmin() {
  const entorno = leerEntornoSupabase();
  if (!entorno.serviceRoleKey) {
    throw new Error(
      "Supabase admin no configurado: falta SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }

  return createClient<Database>(entorno.url, entorno.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Variante sin genéricos para las tablas nuevas, tipadas por DTO en la capa
// de datos. Sigue siendo exclusivamente de servidor.
export function crearClienteAdminDatos() {
  const entorno = leerEntornoSupabase();
  if (!entorno.serviceRoleKey) {
    throw new Error(
      "Supabase admin no configurado: falta SUPABASE_SERVICE_ROLE_KEY en .env.local",
    );
  }

  return createClient(entorno.url, entorno.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
