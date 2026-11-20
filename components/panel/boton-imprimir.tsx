"use client";

import { Printer } from "lucide-react";

export function BotonImprimir() {
  return <button type="button" onClick={() => window.print()} className="print:hidden inline-flex min-h-11 items-center gap-2 rounded-xl bg-petroleo-800 px-4 py-2.5 text-sm font-semibold text-white"><Printer className="h-4 w-4" aria-hidden /> Imprimir receta</button>;
}
