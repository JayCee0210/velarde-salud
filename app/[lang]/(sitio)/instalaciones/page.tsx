import Link from "next/link";
import { MapPin, MessageCircle, ScanLine, Stethoscope, FlaskConical } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { metadataPagina } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.instalaciones.titulo,
    descripcion: d.instalaciones.subtitulo,
    ruta: "/instalaciones",
  });
}

export default async function Instalaciones({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();

  return (
    <>
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.instalaciones}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.instalaciones.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave">
            {d.instalaciones.texto}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            [Stethoscope, d.nav.centro, d.instalaciones.subtitulo],
            [ScanLine, d.nav.servicios, d.servicios.subtitulo],
            [FlaskConical, d.panel.laboratorio, d.servicios.aviso],
          ].map(([Icono, titulo, texto]) => {
            const Componente = Icono as typeof Stethoscope;
            return (
              <div key={String(titulo)} className="rounded-2xl border border-borde bg-white p-5">
                <Componente className="h-6 w-6 text-turquesa-600" aria-hidden />
                <p className="mt-3 font-semibold text-petroleo-900">{String(titulo)}</p>
                <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{String(texto)}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-borde bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
            {d.nav.ubicacion}
          </p>
          <p className="mt-2 flex items-start gap-2 text-sm leading-relaxed text-tinta-suave">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-600" aria-hidden />
            {clinica.direccion}, {clinica.ciudad}, {clinica.departamento}
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link href={`/${locale}/ubicacion`} className={clasesBoton("secundario", "md")}>
              <MapPin className="h-4 w-4" aria-hidden />
              {d.nav.ubicacion}
            </Link>
            <a
              href={enlaceWhatsApp(clinica.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={clasesBoton("fantasma", "md")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {d.comun.whatsapp}
            </a>
          </div>
        </div>

        <p className="mt-6 rounded-xl border border-amber-200 bg-aviso-suave p-4 text-sm leading-relaxed text-amber-900">
          {d.instalaciones.pendiente}
        </p>
      </section>
    </>
  );
}
