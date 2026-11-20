import Link from "next/link";
import { ArrowLeft, CalendarDays, ClipboardList, FileText, FlaskConical, HeartPulse, Users } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { requerirSesion, puede } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import {
  listarCitas,
  listarEmbarazos,
  listarOrdenesLaboratorio,
  listarPacientes,
  listarSolicitudes,
  obtenerContextoPaciente,
  obtenerPaciente,
  hoyEnClinica,
} from "@/lib/datos/panel";
import { EstadoVacio, Insignia, Tarjeta } from "@/components/ui/base";
import { edadEnAnios } from "@/lib/clinica/fechas";
import { PatientWorkspace } from "@/components/panel/paciente/workspace";
import type { VistaPaciente } from "@/components/panel/paciente/pestanas";

type Props = { params: Promise<{ lang: string; modulo: string }>; pacienteId?: string; atencionInicial?: boolean; creado?: boolean; recetaId?: string; vista?: string };

const titulos: Record<string, string> = {
  agenda: "Agenda",
  solicitudes: "Solicitudes de cita",
  pacientes: "Pacientes",
  embarazos: "Embarazos y controles prenatales",
  laboratorio: "Laboratorio",
  documentos: "Documentos",
  seguimiento: "Seguimiento",
  reportes: "Reportes",
  admin: "Administración",
};

function sinDatos(texto: string) {
  return <EstadoVacio titulo={texto} />;
}

export async function ModuloPanel({ params, pacienteId: pacienteSeleccionado, atencionInicial = false, creado = false, recetaId, vista = "resumen" }: Props) {
  const { lang, modulo } = await params;
  const locale = normalizarLocale(lang);
  const d = getDiccionario(locale);
  const sesion = await requerirSesion(locale);
  const base = `/${locale}/panel`;
  const raiz = modulo;
  const pacienteId = pacienteSeleccionado;

  if (raiz === "pacientes" && pacienteId) {
    if (!puede(sesion, PERMISOS.pacientesLeer)) return sinDatos("No tienes permiso para consultar pacientes.");
    const paciente = await obtenerPaciente(sesion, pacienteId);
    if (!paciente) return sinDatos("Paciente no encontrado.");
    const contexto = puede(sesion, PERMISOS.clinicoLeer)
      ? await obtenerContextoPaciente(sesion, pacienteId)
      : null;
    return (
      <div className="space-y-4">
        <Link href={`${base}/pacientes`} className="inline-flex items-center gap-2 text-sm font-semibold text-turquesa-700"><ArrowLeft className="h-4 w-4" aria-hidden /> {d.panel.volverPacientes}</Link>
        <PatientWorkspace locale={locale} base={base} paciente={paciente} contexto={contexto ?? { consultas: [], notas: [], embarazos: [], ordenes: [], documentos: [], resumen: null, recetas: [] }} vista={(vista as VistaPaciente) || "resumen"} atencionInicial={atencionInicial} creado={creado} recetaId={recetaId} />
      </div>
    );
  }

  if (raiz === "pacientes") {
    const pacientes = puede(sesion, PERMISOS.pacientesLeer) ? await listarPacientes(sesion) : [];
    return <ModuloLista base={base} titulo={titulos.pacientes} icono={<Users />}><div className="divide-y divide-borde">{pacientes.length ? pacientes.map((paciente) => <Link key={paciente.id} href={`${base}/pacientes?paciente=${encodeURIComponent(paciente.id)}`} className="flex min-h-14 items-center justify-between gap-3 py-3"><span><strong className="block text-sm text-petroleo-900">{paciente.nombre_completo}</strong><span className="text-xs text-tinta-suave">{paciente.telefono ?? "Sin WhatsApp"}{paciente.fecha_nacimiento ? ` · ${edadEnAnios(paciente.fecha_nacimiento)} años` : ""}</span></span><span className="text-xs text-turquesa-700">{d.comun.verDetalle}</span></Link>) : sinDatos("No hay pacientes disponibles.")}</div></ModuloLista>;
  }

  if (raiz === "agenda") {
    const citas = puede(sesion, PERMISOS.agendaLeer) ? await listarCitas(sesion, hoyEnClinica()) : [];
    return <ModuloLista base={base} titulo="Agenda de hoy" icono={<CalendarDays />}><div className="divide-y divide-borde">{citas.length ? citas.map((cita) => <div key={cita.id} className="py-3"><div className="flex justify-between gap-3 text-sm"><strong>{new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "America/La_Paz" }).format(new Date(cita.inicio))} · {cita.paciente}</strong><Insignia>{cita.estado}</Insignia></div><p className="mt-1 text-xs text-tinta-suave">{cita.servicio}</p></div>) : sinDatos("No hay citas registradas para hoy.")}</div></ModuloLista>;
  }

  if (raiz === "solicitudes") {
    const solicitudes = puede(sesion, PERMISOS.solicitudesGestionar) ? await listarSolicitudes(sesion) : [];
    return <ModuloLista base={base} titulo={titulos.solicitudes} icono={<ClipboardList />}><div className="divide-y divide-borde">{solicitudes.length ? solicitudes.map((solicitud) => <div key={solicitud.id} className="py-3 text-sm"><div className="flex justify-between gap-2"><strong>{solicitud.nombre_solicitante}</strong><Insignia>{solicitud.estado}</Insignia></div><p className="mt-1 text-xs text-tinta-suave">{solicitud.servicio} · {solicitud.fecha_preferida} · {solicitud.telefono}</p></div>) : sinDatos("No hay solicitudes pendientes.")}</div></ModuloLista>;
  }

  if (raiz === "embarazos") {
    const embarazos = puede(sesion, PERMISOS.obstetriciaGestionar) ? await listarEmbarazos(sesion) : [];
    return <ModuloLista base={base} titulo={titulos.embarazos} icono={<HeartPulse />}><div className="divide-y divide-borde">{embarazos.length ? embarazos.map((embarazo) => <div key={String(embarazo.id)} className="py-3 text-sm"><strong>{String(((embarazo.patients as { first_name?: string; last_name?: string } | null)?.first_name ?? "") + " " + ((embarazo.patients as { first_name?: string; last_name?: string } | null)?.last_name ?? "")).trim() || "Paciente"}</strong><p className="mt-1 text-xs text-tinta-suave">FPP: {String(embarazo.estimated_due_date ?? "Pendiente")} · Estado: {String(embarazo.status ?? "active")}</p></div>) : sinDatos("No hay embarazos activos disponibles.")}</div></ModuloLista>;
  }

  if (raiz === "laboratorio") {
    const ordenes = puede(sesion, PERMISOS.laboratorioLeer) ? await listarOrdenesLaboratorio(sesion) : [];
    return <ModuloLista base={base} titulo={titulos.laboratorio} icono={<FlaskConical />}><div className="divide-y divide-borde">{ordenes.length ? ordenes.map((orden) => <div key={String(orden.id)} className="py-3 text-sm"><strong>{String(((orden.patients as { first_name?: string; last_name?: string } | null)?.first_name ?? "") + " " + ((orden.patients as { first_name?: string; last_name?: string } | null)?.last_name ?? "")).trim() || "Paciente"}</strong><p className="mt-1 text-xs text-tinta-suave">Estado: {String(orden.status ?? "pending")}</p></div>) : sinDatos("No hay órdenes de laboratorio disponibles.")}</div></ModuloLista>;
  }

  return <ModuloLista base={base} titulo={titulos[raiz] ?? "Módulo del panel"} icono={<FileText />}><div className="space-y-3"><p className="text-sm leading-relaxed text-tinta-suave">Este módulo conserva su espacio contextual. Su disponibilidad operativa depende de que el esquema Supabase real y sus políticas hayan sido confirmados.</p><div className="rounded-xl border border-aviso bg-aviso-suave p-4 text-sm text-aviso">Configuración pendiente: no se muestran datos inventados ni se habilitan escrituras hasta validar el esquema y los permisos.</div></div></ModuloLista>;
}

function ModuloLista({ base, titulo, icono, children }: { base: string; titulo: string; icono: React.ReactNode; children: React.ReactNode }) {
  return <div className="space-y-5"><Link href={base} className="inline-flex items-center gap-2 text-sm font-semibold text-turquesa-700"><ArrowLeft className="h-4 w-4" aria-hidden /> Inicio del panel</Link><header className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-turquesa-100 text-petroleo-800">{icono}</span><div><h1 className="font-display text-3xl text-petroleo-900">{titulo}</h1><p className="text-sm text-tinta-suave">Vista contextual por clínica y rol</p></div></header><Tarjeta>{children}</Tarjeta></div>;
}
