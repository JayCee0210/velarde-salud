"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { CalendarDays, CheckCircle2, Clock, Loader2, MessageCircle } from "lucide-react";
import type { Locale } from "@/lib/clinica/config";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { crearSolicitudCita } from "@/lib/acciones/reservas";
import { Alerta, Boton, Campo, Tarjeta, claseCampo, clasesBoton } from "@/components/ui/base";
import { enlaceWhatsApp } from "@/lib/utils";

type ServicioOpcion = { slug: string; nombre: string; duracionMinutos: number | null };
type Franja = { inicio: string; etiqueta: string; profesionalId: string | null };

function BotonEnvio({ texto }: { texto: string }) {
  const { pending } = useFormStatus();
  return (
    <Boton type="submit" tamano="lg" disabled={pending} className="w-full sm:w-auto">
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

export function FormularioReserva({
  locale,
  d,
  servicios,
  whatsapp,
  fechaMin,
  servicioInicial,
}: {
  locale: Locale;
  d: Diccionario;
  servicios: ServicioOpcion[];
  whatsapp: string;
  fechaMin: string;
  servicioInicial?: string;
}) {
  const [estado, accion] = useActionState(crearSolicitudCita, null);
  const [servicio, setServicio] = useState(
    servicioInicial && servicios.some((item) => item.slug === servicioInicial)
      ? servicioInicial
      : (servicios[0]?.slug ?? "consulta-general"),
  );
  const [fecha, setFecha] = useState("");
  const [franja, setFranja] = useState("indiferente");
  const [seleccion, setSeleccion] = useState<Franja | null>(null);
  const [disponibilidad, setDisponibilidad] = useState<{
    cargando: boolean;
    configurado: boolean;
    motivo?: string;
    franjas: Franja[];
  }>({ cargando: false, configurado: true, franjas: [] });

  const etiquetaServicio = useMemo(
    () => servicios.find((item) => item.slug === servicio)?.nombre ?? servicio,
    [servicio, servicios],
  );

  useEffect(() => {
    if (!fecha || !servicio) {
      return;
    }
    const controlador = new AbortController();
    fetch("/api/disponibilidad", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servicioSlug: servicio, fecha }),
      signal: controlador.signal,
    })
      .then(async (respuesta) => {
        if (!respuesta.ok) throw new Error("disponibilidad");
        return (await respuesta.json()) as {
          configurado: boolean;
          motivo?: string;
          franjas: Franja[];
        };
      })
      .then((datos) => {
        setDisponibilidad({
          cargando: false,
          configurado: datos.configurado,
          motivo: datos.motivo,
          franjas: datos.franjas ?? [],
        });
      })
      .catch((error) => {
        if (error?.name === "AbortError") return;
        setDisponibilidad({ cargando: false, configurado: false, motivo: "error", franjas: [] });
      });
    return () => controlador.abort();
  }, [fecha, servicio]);

  if (estado?.ok) {
    return (
      <Tarjeta className="border-turquesa-300 bg-white">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-exito" aria-hidden />
          <div>
            <p className="font-display text-xl text-petroleo-900">{d.reservar.exitoTitulo}</p>
            <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{estado.mensaje}</p>
            {estado.referencia && (
              <p className="mt-3 rounded-lg bg-arena-50 px-3 py-2 text-sm font-mono font-semibold text-petroleo-900">
                {d.reservar.referencia}: {estado.referencia}
              </p>
            )}
            <p className="mt-3 text-sm text-tinta-suave">{d.reservar.exitoTexto}</p>
            <a
              href={enlaceWhatsApp(whatsapp, `${d.reservar.titulo}: ${etiquetaServicio}`)}
              target="_blank"
              rel="noreferrer"
              className={`${clasesBoton("secundario", "md")} mt-4`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {d.comun.whatsapp}
            </a>
          </div>
        </div>
      </Tarjeta>
    );
  }

  return (
    <form action={accion} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="servicioSlug" value={servicio} />
      <input type="hidden" name="profesionalId" value={seleccion?.profesionalId ?? ""} />
      <input type="hidden" name="horaPreferida" value={seleccion?.etiqueta ?? ""} />
      <div className="hidden" aria-hidden>
        <label htmlFor="sitioWeb">Sitio web</label>
        <input id="sitioWeb" name="sitioWeb" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta={d.reservar.servicio} htmlFor="servicio" requerido>
          <select
            id="servicio"
            className={claseCampo}
            value={servicio}
             onChange={(evento) => {
               setServicio(evento.target.value);
               setSeleccion(null);
               setDisponibilidad({ cargando: Boolean(fecha), configurado: true, franjas: [] });
             }}
          >
            {servicios.map((item) => (
              <option key={item.slug} value={item.slug}>
                {item.nombre}
                {item.duracionMinutos ? ` · ${item.duracionMinutos} min` : ""}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta={d.reservar.fecha} htmlFor="fechaPreferida" requerido>
          <input
            id="fechaPreferida"
            name="fechaPreferida"
            type="date"
            min={fechaMin}
            required
            className={claseCampo}
            value={fecha}
             onChange={(evento) => {
               setFecha(evento.target.value);
               setSeleccion(null);
               setDisponibilidad({ cargando: Boolean(evento.target.value && servicio), configurado: true, franjas: [] });
             }}
          />
        </Campo>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-petroleo-900">{d.reservar.horario}</p>
        {disponibilidad.cargando && (
          <p className="flex items-center gap-2 text-sm text-tinta-suave">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> {d.comun.cargando}
          </p>
        )}

        {!disponibilidad.cargando && disponibilidad.franjas.length > 0 && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {disponibilidad.franjas.map((item) => {
              const activo = seleccion?.inicio === item.inicio;
              return (
                <button
                  key={item.inicio}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => setSeleccion(item)}
                  className={`flex min-h-11 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-sm font-semibold transition-colors ${
                    activo
                      ? "border-petroleo-800 bg-petroleo-800 text-white"
                      : "border-borde bg-white text-petroleo-900 hover:border-turquesa-500 hover:bg-turquesa-100/50"
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {item.etiqueta}
                </button>
              );
            })}
          </div>
        )}

        {!disponibilidad.cargando &&
          fecha &&
          disponibilidad.configurado &&
          disponibilidad.franjas.length === 0 && (
            <Alerta tono="aviso">
              {d.reservar.sinHorarios}
              <span className="mt-2 block">
                <a
                  className="font-semibold underline"
                  href={enlaceWhatsApp(whatsapp, `${d.reservar.titulo}: ${etiquetaServicio}, ${fecha}`)}
                  target="_blank"
                  rel="noreferrer"
                >
                  {d.comun.whatsapp}
                </a>
              </span>
            </Alerta>
          )}

        {!disponibilidad.cargando && fecha && !disponibilidad.configurado && (
          <Alerta tono="info">{d.reservar.agendaNoDisponible}</Alerta>
        )}

        {!fecha && (
          <p className="flex items-center gap-2 text-sm text-tinta-suave">
            <CalendarDays className="h-4 w-4" aria-hidden /> {d.reservar.eligeFecha}
          </p>
        )}
      </div>

      {disponibilidad.franjas.length === 0 && (
        <Campo etiqueta={d.reservar.franja} htmlFor="franja" ayuda={d.reservar.franjaAyuda}>
          <select
            id="franja"
            name="franja"
            className={claseCampo}
            value={franja}
            onChange={(evento) => setFranja(evento.target.value)}
          >
            <option value="indiferente">{d.reservar.indiferente}</option>
            <option value="manana">{d.reservar.manana}</option>
            <option value="tarde">{d.reservar.tarde}</option>
          </select>
        </Campo>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="sr-only">{d.reservar.tusDatos}</legend>
        <Campo etiqueta={d.reservar.nombre} htmlFor="nombreSolicitante" requerido>
          <input
            id="nombreSolicitante"
            name="nombreSolicitante"
            autoComplete="name"
            required
            minLength={3}
            maxLength={160}
            className={claseCampo}
            placeholder={d.reservar.nombrePlaceholder}
          />
        </Campo>
        <Campo etiqueta={d.reservar.telefono} htmlFor="telefono" requerido>
          <input
            id="telefono"
            name="telefono"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            minLength={7}
            maxLength={30}
            className={claseCampo}
            placeholder="+591 7XXXXXXX"
          />
        </Campo>
      </fieldset>

      <Campo etiqueta={d.reservar.correo} htmlFor="correo" ayuda={d.reservar.correoAyuda}>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="email"
          className={claseCampo}
          placeholder="nombre@correo.com"
        />
      </Campo>

      <label className="flex items-start gap-3 rounded-xl border border-borde bg-arena-50 p-3 text-sm text-tinta-suave">
        <input
          type="checkbox"
          name="avisoPrivacidad"
          required
          className="mt-0.5 h-5 w-5 shrink-0 accent-petroleo-800"
        />
        <span>{d.reservar.aviso}</span>
      </label>

      {estado && !estado.ok && (
        <Alerta tono="peligro" titulo={d.reservar.errorTitulo}>
          {estado.mensaje}
        </Alerta>
      )}

      <div className="flex flex-col gap-3 border-t border-borde pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-tinta-suave">{d.reservar.nota}</p>
        <BotonEnvio texto={d.reservar.enviar} />
      </div>
    </form>
  );
}
