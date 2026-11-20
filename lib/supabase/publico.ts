import "server-only";
import { createClient } from "@supabase/supabase-js";
import { leerEntornoSupabase } from "./entorno";

export function crearClientePublico() {
  const entorno = leerEntornoSupabase();
  if (!entorno.configurado) return null;
  return createClient(entorno.url, entorno.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
