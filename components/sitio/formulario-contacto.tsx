"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { CheckCircle2, Loader2 } from "lucide-react";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { enviarContacto } from "@/lib/acciones/reservas";
import { Alerta, Boton, Campo, claseCampo } from "@/components/ui/base";

function Envio({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" disabled={pending} tamano="lg">
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {texto}
        </>
      ) : (
        texto
      )}
    </Boton>
  );
}

export function FormularioContacto({ d }: { d: Diccionario }) {
  const [estado, accion] = useActionState(enviarContacto, null);

  return (
    <form action={accion} className="space-y-4">
      <div className="hidden" aria-hidden>
        <label htmlFor="contacto-sitio">Sitio web</label>
        <input id="contacto-sitio" name="sitioWeb" tabIndex={-1} autoComplete="off" />
      </div>
      <Campo etiqueta={d.reservar.nombre} htmlFor="contacto-nombre" requerido>
        <input
          id="contacto-nombre"
          name="nombre"
          required
          minLength={3}
          maxLength={120}
          autoComplete="name"
          className={claseCampo}
        />
      </Campo>
      <Campo etiqueta={d.reservar.telefono} htmlFor="contacto-telefono" requerido>
        <input
          id="contacto-telefono"
          name="telefono"
          type="tel"
          inputMode="tel"
          required
          minLength={7}
          maxLength={30}
          autoComplete="tel"
          className={claseCampo}
        />
      </Campo>
      <Campo etiqueta={d.contacto.mensaje} htmlFor="contacto-mensaje" requerido>
        <textarea
          id="contacto-mensaje"
          name="mensaje"
          required
          minLength={10}
          maxLength={1000}
          rows={4}
          className={`${claseCampo} min-h-28 py-2`}
        />
      </Campo>
      <p className="text-xs leading-relaxed text-tinta-suave">{d.contacto.aviso}</p>
      {estado && (
        <Alerta tono={estado.ok ? "exito" : "peligro"}>
          <span className="flex items-center gap-2">
            {estado.ok && <CheckCircle2 className="h-4 w-4" aria-hidden />}
            {estado.mensaje}
          </span>
        </Alerta>
      )}
      <Envio texto={d.contacto.enviar} />
    </form>
  );
}
