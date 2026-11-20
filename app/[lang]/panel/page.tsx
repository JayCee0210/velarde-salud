import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  Clock,
  Plus,
  UserRound,
  Users,
} from "lucide-react";
import { getDiccionario, normalizarLocale, localeIntl } from "@/lib/i18n";
import { requerirSesion, puedeAlguno } from "@/lib/auth/sesion";
import { PERMISOS, etiquetaRol } from "@/lib/auth/permisos";
import { obtenerResumen, hoyEnClinica } from "@/lib/datos/panel";
import { CLINICA_VELARDE } from "@/lib/clinica/config";
import { EstadoVacio, Insignia, Tarjeta } from "@/components/ui/base";

export default async function PanelInicio({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const sesion = await requerirSesion(locale);
  const resumen = await obtenerResumen(sesion);
  const base = `/${locale}/panel`;
  const hora = new Intl.DateTimeFormat(localeIntl(locale), {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CLINICA_VELARDE.zonaHoraria,
  });
  const fecha = new Intl.DateTimeFormat(localeIntl(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: CLINICA_VELARDE.zonaHoraria,
  }).format(new Date(`${hoyEnClinica()}T12:00:00Z`));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
            {fecha}
          </p>
          <h1 className="mt-1 font-display text-3xl text-petroleo-900">
            {locale === "pt" ? "Olá" : "Hola"}, {sesion.nombre.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {etiquetaRol(sesion.rol)} · {sesion.clinicaNombre}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {puedeAlguno(sesion, [PERMISOS.pacientesGestionar]) && (
            <Link
              href={`${base}/pacientes/nuevo`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-borde bg-white px-3 py-2 text-sm font-semibold text-petroleo-900 hover:bg-turquesa-100/40"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {d.panel.nuevoPaciente}
            </Link>
          )}
          {puedeAlguno(sesion, [PERMISOS.clinicoEscribir]) && (
            <Link href={`${base}/consulta/nueva`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-turquesa-300 bg-turquesa-100 px-3 py-2 text-sm font-semibold text-petroleo-900 hover:bg-turquesa-200">
              <ClipboardList className="h-4 w-4" aria-hidden />
              {d.panel.nuevaConsulta}
            </Link>
          )}
          {puedeAlguno(sesion, [PERMISOS.agendaLeer]) && (
            <Link
              href={`${base}/agenda`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-petroleo-800 px-3 py-2 text-sm font-semibold text-white hover:bg-petroleo-700"
            >
              <CalendarDays className="h-4 w-4" aria-hidden />
              {d.panel.verAgenda}
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Tarjeta className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-turquesa-100 text-petroleo-800">
            <CalendarDays className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-semibold leading-none text-petroleo-900">{resumen.citasHoy}</p>
            <p className="mt-1 text-xs text-tinta-suave">{d.panel.citasHoy}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-aviso-suave text-aviso">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-semibold leading-none text-petroleo-900">{resumen.solicitudesPendientes}</p>
            <p className="mt-1 text-xs text-tinta-suave">{d.panel.solicitudesPendientes}</p>
          </div>
        </Tarjeta>
        {puedeAlguno(sesion, [PERMISOS.seguimientosGestionar]) && (
          <Tarjeta className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-salvia-100 text-salvia-600">
              <Users className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-2xl font-semibold leading-none text-petroleo-900">{resumen.seguimientosPendientes}</p>
              <p className="mt-1 text-xs text-tinta-suave">{d.panel.seguimientosPendientes}</p>
            </div>
          </Tarjeta>
        )}
        <Tarjeta className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-arena-100 text-petroleo-800">
            <Clock className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-2xl font-semibold leading-none text-petroleo-900">
              {resumen.proxima ? hora.format(new Date(resumen.proxima.inicio)) : "—"}
            </p>
            <p className="mt-1 text-xs text-tinta-suave">{d.panel.proximaAtencion}</p>
          </div>
        </Tarjeta>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Tarjeta>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl text-petroleo-900">{d.panel.proximaAtencion}</h2>
            <Link href={`${base}/agenda`} className="text-xs font-semibold text-turquesa-600">
              {d.panel.verAgenda}
            </Link>
          </div>
          {resumen.proxima ? (
            <div className="mt-4 rounded-xl border border-borde bg-arena-50/60 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Insignia tono="info">
                  {hora.format(new Date(resumen.proxima.inicio))}
                </Insignia>
                <Insignia>{resumen.proxima.servicio}</Insignia>
              </div>
              <p className="mt-3 font-semibold text-petroleo-900">{resumen.proxima.paciente}</p>
              <p className="text-sm text-tinta-suave">{resumen.proxima.telefono ?? "—"}</p>
              {resumen.proxima.profesional && (
                <p className="mt-1 text-xs text-tinta-suave">{resumen.proxima.profesional}</p>
              )}
              <Link
                href={`${base}/pacientes/${resumen.proxima.pacienteId}`}
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-turquesa-600"
              >
                {d.panel.contextoPaciente}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <EstadoVacio titulo={d.panel.sinCitas} icono={<CalendarDays className="h-6 w-6" aria-hidden />} />
            </div>
          )}
        </Tarjeta>

        <Tarjeta>
          <h2 className="font-display text-xl text-petroleo-900">{d.panel.accesosRapidos}</h2>
          <div className="mt-4 grid gap-2">
            {[
              puedeAlguno(sesion, [PERMISOS.agendaLeer]) && {
                href: `${base}/agenda`,
                texto: d.panel.agenda,
                icono: CalendarDays,
              },
              puedeAlguno(sesion, [PERMISOS.solicitudesGestionar]) && {
                href: `${base}/solicitudes`,
                texto: d.panel.solicitudes,
                icono: ClipboardList,
              },
              puedeAlguno(sesion, [PERMISOS.pacientesLeer]) && {
                href: `${base}/pacientes`,
                texto: d.panel.pacientes,
                icono: UserRound,
              },
              puedeAlguno(sesion, [PERMISOS.laboratorioLeer]) && {
                href: `${base}/laboratorio`,
                texto: d.panel.laboratorio,
                icono: ClipboardList,
              },
            ]
              .filter(Boolean)
              .map((item) => {
                const dato = item as { href: string; texto: string; icono: typeof CalendarDays };
                const Icono = dato.icono;
                return (
                  <Link
                    key={dato.href}
                    href={dato.href}
                    className="flex items-center justify-between gap-3 rounded-xl border border-borde px-3 py-2.5 text-sm font-medium text-petroleo-900 hover:bg-arena-50"
                  >
                    <span className="flex items-center gap-2">
                      <Icono className="h-4 w-4 text-turquesa-600" aria-hidden />
                      {dato.texto}
                    </span>
                    <ArrowRight className="h-4 w-4 text-tinta-suave" aria-hidden />
                  </Link>
                );
              })}
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
