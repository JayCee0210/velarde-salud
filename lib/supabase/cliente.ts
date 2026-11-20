// Cliente Supabase para el NAVEGADOR (componentes cliente).
// Usa solo la clave pública (anon): toda la protección real la
// aplican las políticas RLS en Supabase.
import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./tipos";

export function crearClienteNavegador() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase no está configurado: faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local",
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
