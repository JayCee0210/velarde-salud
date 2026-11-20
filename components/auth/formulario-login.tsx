"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, LockKeyhole } from "lucide-react";
import type { Locale } from "@/lib/clinica/config";
import { iniciarSesion } from "@/lib/acciones/auth";
import { Alerta, Boton, Campo, claseCampo } from "@/components/ui/base";

function Envio() {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" tamano="lg" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Ingresando…
        </>
      ) : (
        "Ingresar al panel"
      )}
    </Boton>
  );
}

export function FormularioLogin({
  locale,
  next,
  supabaseConfigurado,
}: {
  locale: Locale;
  next: string;
  supabaseConfigurado: boolean;
}) {
  const [estado, accion] = useActionState(iniciarSesion, null);

  if (!supabaseConfigurado) {
    return (
      <Alerta tono="aviso" titulo="Acceso no configurado">
        Falta configurar Supabase en el servidor. El panel no estará disponible hasta que se
        definan las credenciales.
      </Alerta>
    );
  }

  return (
    <form action={accion} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="next" value={next} />
      <Campo etiqueta="Correo electrónico" htmlFor="email" requerido>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={claseCampo}
          placeholder="nombre@clinica.com"
        />
      </Campo>
      <Campo etiqueta="Contraseña" htmlFor="password" requerido>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={6}
          className={claseCampo}
        />
      </Campo>
      {estado && !estado.ok && <Alerta tono="peligro">{estado.mensaje}</Alerta>}
      <Envio />
      <p className="flex items-center justify-center gap-1.5 text-xs text-tinta-suave">
        <LockKeyhole className="h-3.5 w-3.5" aria-hidden />
        Acceso exclusivo para personal autorizado.
      </p>
    </form>
  );
}
