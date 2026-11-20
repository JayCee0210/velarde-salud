"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function BotonGuardarPaciente({ texto = "Guardar paciente y atención" }: { texto?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-petroleo-800 px-5 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-petroleo-700 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? "Guardando…" : texto}
    </button>
  );
}
