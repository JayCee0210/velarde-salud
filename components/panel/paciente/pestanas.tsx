import Link from "next/link";

export type VistaPaciente = "resumen" | "nueva" | "historial" | "embarazo" | "laboratorio" | "recetas" | "documentos";

const pestañas: Array<{ id: VistaPaciente; etiqueta: string }> = [
  { id: "resumen", etiqueta: "Resumen" },
  { id: "nueva", etiqueta: "Nueva atención" },
  { id: "historial", etiqueta: "Historial" },
  { id: "embarazo", etiqueta: "Embarazo" },
  { id: "laboratorio", etiqueta: "Laboratorio" },
  { id: "recetas", etiqueta: "Recetas" },
  { id: "documentos", etiqueta: "Documentos" },
];

export function PestanasPaciente({ base, pacienteId, activa }: { base: string; pacienteId: string; activa: VistaPaciente }) {
  return <nav className="ocultar-scroll -mx-4 flex gap-1 overflow-x-auto border-b border-borde bg-white px-4 py-2 sm:-mx-6 sm:px-6" aria-label="Secciones del paciente">{pestañas.map((pestaña) => <Link key={pestaña.id} href={`${base}/pacientes?paciente=${encodeURIComponent(pacienteId)}&vista=${pestaña.id}`} aria-current={activa === pestaña.id ? "page" : undefined} className={`min-h-10 shrink-0 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${activa === pestaña.id ? "bg-turquesa-100 text-petroleo-900" : "text-tinta-suave hover:bg-arena-50"}`}>{pestaña.etiqueta}</Link>)}</nav>;
}
