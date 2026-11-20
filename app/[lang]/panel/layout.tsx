import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { LogOut } from "lucide-react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { requerirSesion, type Sesion } from "@/lib/auth/sesion";
import { etiquetaRol } from "@/lib/auth/permisos";
import { PERMISOS } from "@/lib/auth/permisos";
import { esLocale, getDiccionario, normalizarLocale } from "@/lib/i18n";
import { cerrarSesion } from "@/lib/acciones/auth";
import { puedeAlguno } from "@/lib/auth/sesion";
import {
  NavegacionPanel,
  type ItemNavegacion,
} from "@/components/panel/navegacion";
import { Logo } from "@/components/ui/base";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel VELARDE" },
  robots: { index: false, follow: false },
};
export const instant = false;

function CargandoPanel() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="h-24 animate-pulse rounded-2xl bg-white" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-2xl bg-white" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-2xl bg-white" />
    </div>
  );
}

function itemsNavegacion(locale: string, sesion: Sesion): ItemNavegacion[] {
  const base = `/${locale}`;
  const items: ItemNavegacion[] = [{ href: `${base}/panel`, etiqueta: "Inicio", icono: "inicio" }];
  if (puedeAlguno(sesion, [PERMISOS.agendaLeer])) {
    items.push({ href: `${base}/panel/agenda`, etiqueta: "Agenda", icono: "agenda" });
  }
  if (puedeAlguno(sesion, [PERMISOS.solicitudesGestionar])) {
    items.push({ href: `${base}/panel/solicitudes`, etiqueta: "Solicitudes", icono: "solicitudes" });
  }
  if (puedeAlguno(sesion, [PERMISOS.pacientesLeer])) {
    items.push({ href: `${base}/panel/pacientes`, etiqueta: "Pacientes", icono: "pacientes" });
  }
  if (puedeAlguno(sesion, [PERMISOS.obstetriciaGestionar])) {
    items.push({ href: `${base}/panel/embarazos`, etiqueta: "Embarazos", icono: "embarazos" });
  }
  if (puedeAlguno(sesion, [PERMISOS.laboratorioLeer])) {
    items.push({ href: `${base}/panel/laboratorio`, etiqueta: "Laboratorio", icono: "laboratorio" });
  }
  if (puedeAlguno(sesion, [PERMISOS.documentosLeer])) {
    items.push({ href: `${base}/panel/documentos`, etiqueta: "Documentos", icono: "documentos" });
  }
  if (puedeAlguno(sesion, [PERMISOS.seguimientosGestionar])) {
    items.push({ href: `${base}/panel/seguimiento`, etiqueta: "Seguimiento", icono: "seguimiento" });
  }
  if (puedeAlguno(sesion, [PERMISOS.reportesLeer])) {
    items.push({ href: `${base}/panel/reportes`, etiqueta: "Reportes", icono: "reportes" });
  }
  if (puedeAlguno(sesion, [PERMISOS.panelAdmin])) {
    items.push({ href: `${base}/panel/admin`, etiqueta: "Administración", icono: "admin" });
  }
  return items;
}

async function PanelContenido({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esLocale(lang)) notFound();
  const locale = normalizarLocale(lang);
  const d = getDiccionario(locale);
  await connection();
  const sesion = await requerirSesion(locale);
  const items = itemsNavegacion(locale, sesion);

  return (
    <div className="panel-medico min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-borde bg-white lg:flex">
        <div className="flex h-16 items-center border-b border-borde px-5">
          <Link href={`/${locale}/panel`}>
            <Logo />
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <NavegacionPanel items={items} modo="lateral" />
        </div>
        <div className="border-t border-borde p-3">
          <p className="px-2 text-xs font-semibold text-petroleo-900">{sesion.nombre}</p>
          <p className="px-2 text-[11px] text-tinta-suave">
            {etiquetaRol(sesion.rol)} · {sesion.clinicaNombre}
          </p>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-borde bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <Logo compacto />
          </div>
          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-sm font-semibold text-petroleo-900">{sesion.clinicaNombre}</p>
            <p className="text-xs text-tinta-suave">{d.panel.cuenta}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="max-w-36 truncate text-sm font-semibold text-petroleo-900">{sesion.nombre}</p>
              <p className="text-[11px] text-tinta-suave">{etiquetaRol(sesion.rol)}</p>
            </div>
            <form action={cerrarSesion}>
              <input type="hidden" name="locale" value={locale} />
              <button
                type="submit"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-borde text-tinta-suave hover:bg-arena-50 hover:text-peligro"
                aria-label={d.auth.salir}
                title={d.auth.salir}
              >
                <LogOut className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:pb-8">{children}</main>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-borde bg-white lg:hidden">
        <NavegacionPanel items={items} modo="inferior" />
      </div>
    </div>
  );
}

export default function PanelLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-arena-50 p-4"><CargandoPanel /></div>}>
      <PanelContenido params={params}>{children}</PanelContenido>
    </Suspense>
  );
}
