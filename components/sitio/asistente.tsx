"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Bot, MessageCircle, Send, X } from "lucide-react";
import type { Locale } from "@/lib/clinica/config";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { enlaceWhatsApp } from "@/lib/utils";

type Sugerencia = { texto: string; href: string };
type Mensaje = { rol: "usuario" | "asistente"; texto: string; sugerencias?: Sugerencia[] };

export function Asistente({
  locale,
  whatsapp,
  d,
}: {
  locale: Locale;
  whatsapp: string;
  d: Diccionario;
}) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      rol: "asistente",
      texto:
        locale === "pt"
          ? "Olá. Posso orientar sobre serviços e como solicitar uma consulta. Não realizo diagnósticos."
          : "Hola. Puedo orientarte sobre servicios y cómo solicitar una cita. No realizo diagnósticos.",
    },
  ]);
  const entrada = useRef<HTMLInputElement>(null);

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    const limpio = texto.trim();
    if (!limpio || cargando) return;
    setMensajes((actual) => [...actual, { rol: "usuario", texto: limpio }]);
    setTexto("");
    setCargando(true);
    try {
      const respuesta = await fetch("/api/asistente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: limpio, locale }),
      });
      const datos = await respuesta.json();
      setMensajes((actual) => [
        ...actual,
        {
          rol: "asistente",
          texto: respuesta.ok ? datos.respuesta : "No pude responder. Intenta nuevamente.",
          sugerencias: respuesta.ok ? datos.sugerencias : undefined,
        },
      ]);
    } catch {
      setMensajes((actual) => [
        ...actual,
        { rol: "asistente", texto: "No pude responder. Revisa tu conexión o escríbenos por WhatsApp." },
      ]);
    } finally {
      setCargando(false);
      entrada.current?.focus();
    }
  }

  return (
    <>
      {!abierto && (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="fixed bottom-4 right-4 z-50 flex min-h-12 items-center gap-2 rounded-full bg-petroleo-800 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-petroleo-700"
          aria-label={d.asistente.abrir}
        >
          <Bot className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">{d.asistente.boton}</span>
        </button>
      )}

      {abierto && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label={d.asistente.titulo}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-2xl border border-borde bg-white shadow-2xl sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-96 sm:rounded-2xl"
        >
          <div className="flex items-start justify-between gap-3 border-b border-borde bg-petroleo-950 px-4 py-3 text-white sm:rounded-t-2xl">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Bot className="h-4 w-4 text-turquesa-300" aria-hidden />
                {d.asistente.titulo}
              </p>
              <p className="mt-0.5 text-xs text-white/60">{d.asistente.subtitulo}</p>
            </div>
            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="rounded-lg p-1.5 hover:bg-white/10"
              aria-label={d.asistente.cerrar}
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {mensajes.map((mensaje, indice) => (
              <div
                key={indice}
                className={`max-w-[92%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                  mensaje.rol === "usuario"
                    ? "ml-auto bg-petroleo-800 text-white"
                    : "bg-arena-50 text-petroleo-900"
                }`}
              >
                <p className="whitespace-pre-line">{mensaje.texto}</p>
                {mensaje.sugerencias && mensaje.sugerencias.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {mensaje.sugerencias.map((sugerencia) => (
                      <Link
                        key={sugerencia.href + sugerencia.texto}
                        href={sugerencia.href}
                        onClick={() => setAbierto(false)}
                        className="rounded-lg bg-white px-2 py-1 text-xs font-semibold text-petroleo-800 ring-1 ring-borde hover:bg-turquesa-100"
                      >
                        {sugerencia.texto}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {cargando && <p className="text-xs text-tinta-suave">{d.asistente.pensando}</p>}
          </div>

          <div className="border-t border-borde p-3">
            <form onSubmit={enviar} className="flex items-center gap-2">
              <label htmlFor="asistente-entrada" className="sr-only">
                {d.asistente.placeholder}
              </label>
              <input
                ref={entrada}
                id="asistente-entrada"
                value={texto}
                onChange={(evento) => setTexto(evento.target.value)}
                maxLength={500}
                placeholder={d.asistente.placeholder}
                className="min-h-10 flex-1 rounded-xl border border-borde px-3 py-2 text-sm focus:border-turquesa-600 focus:outline-none focus:ring-2 focus:ring-turquesa-300/60"
              />
              <button
                type="submit"
                disabled={!texto.trim() || cargando}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-petroleo-800 text-white disabled:opacity-40"
                aria-label={d.asistente.enviar}
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
            <div className="mt-2 flex items-center justify-between gap-2">
              <p className="text-[11px] leading-tight text-tinta-suave">{d.asistente.aviso}</p>
              <a
                href={enlaceWhatsApp(whatsapp)}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-turquesa-600"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
