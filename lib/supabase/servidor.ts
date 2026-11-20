// Cliente Supabase para el SERVIDOR (Server Components, Server
// Actions y Route Handlers). Reenvía las cookies de sesión para que
// se apliquen las políticas RLS según el usuario. Usa la clave
// pública (anon): NUNCA la service_role aquí.
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { leerEntornoSupabase } from "./entorno";
import type { Database } from "./tipos";

export async function crearClienteServidor() {
  const entorno = leerEntornoSupabase();
  if (!entorno.configurado) {
    throw new Error(`Supabase no está configurado: ${entorno.motivo}`);
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(entorno.url, entorno.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // En Server Components escribir cookies lanza excepción:
        // se ignora (la sesión se refresca en Server Actions/Handlers).
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          /* modo solo lectura */
        }
      },
    },
  });
}
