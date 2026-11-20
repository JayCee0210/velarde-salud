import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { leerEntornoSupabase } from "./entorno";

// Cliente de datos sin genéricos: las tablas nuevas se tipan en la capa de
// datos mediante DTOs explícitos. La seguridad real la aplican RLS y las
// comprobaciones de sesión/permiso del servidor.
export async function crearClienteDatos() {
  const entorno = leerEntornoSupabase();
  if (!entorno.configurado) {
    throw new Error("SUPABASE_NO_CONFIGURADO");
  }

  const cookieStore = await cookies();

  return createServerClient(entorno.url, entorno.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* Server Components: solo lectura */
        }
      },
    },
  });
}

export function mensajeDeError(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}
