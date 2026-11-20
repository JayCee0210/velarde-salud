"use client";

import { CheckCircle2, Printer, X } from "lucide-react";
import { useState } from "react";

export function PopupPacienteGuardado({ locale, pacienteId }: { locale: string; pacienteId: string }) {
  const [abierto, setAbierto] = useState(true);
  if (!abierto) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-50 sm:bottom-6 sm:left-auto sm:max-w-md" role="status" aria-labelledby="paciente-guardado-titulo">
      <div className="relative rounded-2xl border border-exito/30 bg-white p-4 shadow-xl">
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-lg text-tinta-suave hover:bg-arena-50"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
        <div className="flex items-start gap-3 pr-7">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-exito-suave text-exito">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 id="paciente-guardado-titulo" className="font-semibold text-petroleo-900">Paciente y atención guardados</h2>
            <p className="mt-1 text-sm leading-relaxed text-tinta-suave">
              La ficha, evaluación y receta se guardaron conjuntamente en su historia clínica.
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 pl-[52px]">
          <button
            type="button"
            onClick={() => setAbierto(false)}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-borde px-3 text-sm font-semibold text-petroleo-900 hover:bg-arena-50"
          >
            Ver historia
          </button>
          <a
            href={`/${locale}/panel/paciente-pdf?id=${encodeURIComponent(pacienteId)}`}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-petroleo-800 px-3 text-sm font-semibold text-white hover:bg-petroleo-700"
          >
            <Printer className="h-4 w-4" aria-hidden /> Imprimir ficha
          </a>
        </div>
      </div>
    </div>
  );
}
