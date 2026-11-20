"use server";

import { redirect } from "next/navigation";
import { crearClienteDatos, mensajeDeError } from "@/lib/supabase/datos";
import { esquemaLogin, type ResultadoAccion } from "@/lib/validacion/esquemas";

function destinoSeguro(valor: FormDataEntryValue | null, locale: string): string {
  const texto = typeof valor === "string" ? valor : "";
  if (texto.startsWith("/") && !texto.startsWith("//")) return texto;
  return `/${locale}/panel`;
}

export async function iniciarSesion(
  _estado: ResultadoAccion | null,
  formData: FormData,
): Promise<ResultadoAccion> {
  const locale = String(formData.get("locale") ?? "es");
  const resultado = esquemaLogin.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!resultado.success) {
    return {
      ok: false,
      mensaje: "Revisa los datos ingresados.",
      campos: resultado.error.flatten().fieldErrors,
    };
  }

  try {
    const supabase = await crearClienteDatos();
    const { error } = await supabase.auth.signInWithPassword({
      email: resultado.data.email,
      password: resultado.data.password,
    });
    if (error) {
      return { ok: false, mensaje: "Correo o contraseña incorrectos." };
    }
  } catch (error) {
    return {
      ok: false,
      mensaje:
        mensajeDeError(error) === "SUPABASE_NO_CONFIGURADO"
          ? "Supabase no está configurado."
          : "No se pudo iniciar sesión.",
    };
  }

  redirect(destinoSeguro(formData.get("next"), locale));
}

export async function cerrarSesion(formData: FormData): Promise<void> {
  const locale = String(formData.get("locale") ?? "es");
  try {
    const supabase = await crearClienteDatos();
    await supabase.auth.signOut();
  } catch {
    /* la sesión local se limpia igualmente al redirigir */
  }
  redirect(`/${locale}/ingresar`);
}
