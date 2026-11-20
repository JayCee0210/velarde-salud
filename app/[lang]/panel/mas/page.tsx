import Link from "next/link";
import { ArrowRight, ClipboardList, FileText, FlaskConical, HeartPulse, Settings, Users, type LucideIcon } from "lucide-react";
import { requerirSesion, puede } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import { normalizarLocale } from "@/lib/i18n";
import { Tarjeta } from "@/components/ui/base";

export const instant = false;
export const metadata = { title: "Más herramientas", robots: { index: false, follow: false } };

export default async function MasPanel({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = normalizarLocale(lang);
  const sesion = await requerirSesion(locale);
  const base = `/${locale}/panel`;
  const opciones = [
    puede(sesion, PERMISOS.solicitudesGestionar) && ["Solicitudes", "solicitudes", ClipboardList],
    puede(sesion, PERMISOS.obstetriciaGestionar) && ["Embarazos y prenatal", "embarazos", HeartPulse],
    puede(sesion, PERMISOS.laboratorioLeer) && ["Laboratorio", "laboratorio", FlaskConical],
    puede(sesion, PERMISOS.documentosLeer) && ["Documentos", "documentos", FileText],
    puede(sesion, PERMISOS.seguimientosGestionar) && ["Seguimiento", "seguimiento", HeartPulse],
    puede(sesion, PERMISOS.reportesLeer) && ["Reportes", "reportes", ClipboardList],
    puede(sesion, PERMISOS.panelAdmin) && ["Administración", "admin", Settings],
  ].filter(Boolean) as Array<[string, string, LucideIcon]>;
  return <div className="space-y-5"><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-700">Herramientas</p><h1 className="mt-1 font-display text-3xl text-petroleo-900">Más funciones</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta-suave">Todo sigue disponible. Esta sección mantiene la pantalla principal despejada para las tareas frecuentes.</p></header><div className="grid gap-3 sm:grid-cols-2">{opciones.map(([etiqueta, ruta, Icono]) => <Link key={ruta} href={`${base}/${ruta}`} className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-borde bg-white px-4 py-3 shadow-sm transition-colors hover:border-turquesa-300 hover:bg-turquesa-100/30"><span className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-turquesa-100 text-petroleo-800"><Icono className="h-5 w-5" aria-hidden /></span><span className="text-sm font-semibold text-petroleo-900">{etiqueta}</span></span><ArrowRight className="h-4 w-4 text-tinta-suave" aria-hidden /></Link>)}</div><Tarjeta className="flex items-start gap-3"><Users className="mt-0.5 h-5 w-5 shrink-0 text-turquesa-700" aria-hidden /><p className="text-sm leading-relaxed text-tinta-suave">En el teléfono, usa Inicio, Agenda, Pacientes y Más. Las funciones clínicas avanzadas aparecen aquí sin perderse.</p></Tarjeta></div>;
}
