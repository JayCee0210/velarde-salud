import Link from "next/link";
import { ExternalLink, MapPin, MessageCircle, Navigation } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { metadataPagina, jsonLdClinica, scriptJsonLd } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.ubicacion.titulo,
    descripcion: d.ubicacion.subtitulo,
    ruta: "/ubicacion",
  });
}

export default async function Ubicacion({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();
  const consulta = encodeURIComponent(
    `${clinica.nombre}, ${clinica.direccion}, ${clinica.ciudad}, ${clinica.departamento}, Bolivia`,
  );
  const mapa = `https://www.google.com/maps/search/?api=1&query=${consulta}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdClinica(locale)) }}
      />
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.ubicacion}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.ubicacion.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave">
            {d.ubicacion.subtitulo}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 sm:py-16 md:grid-cols-2">
        <div className="rounded-2xl border border-borde bg-white p-6">
          <MapPin className="h-6 w-6 text-turquesa-600" aria-hidden />
          <h2 className="mt-3 font-display text-2xl text-petroleo-900">{d.ubicacion.direccion}</h2>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
            {clinica.direccion}
            <br />
            {clinica.ciudad}, {clinica.departamento}, {clinica.pais}
          </p>
          <p className="mt-4 text-sm text-tinta-suave">
            <span className="font-semibold text-petroleo-900">{d.ubicacion.referencia}: </span>
            {clinica.referencia}
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <a href={mapa} target="_blank" rel="noreferrer" className={clasesBoton("secundario", "md")}>
              <Navigation className="h-4 w-4" aria-hidden />
              {d.ubicacion.mapa}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            <a
              href={enlaceWhatsApp(clinica.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className={clasesBoton("primario", "md")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {d.comun.whatsapp}
            </a>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-borde bg-white p-6 text-center">
            <MapPin className="h-8 w-8 text-turquesa-600" aria-hidden />
            <p className="mt-3 text-sm font-semibold text-petroleo-900">{d.ubicacion.mapa}</p>
            <p className="mt-1 max-w-sm text-xs leading-relaxed text-tinta-suave">
              {d.ubicacion.mapaPendiente}
            </p>
            <a href={mapa} target="_blank" rel="noreferrer" className="mt-3 text-xs font-semibold text-turquesa-600 underline">
              {d.ubicacion.mapa}
            </a>
          </div>
          <div className="rounded-2xl border border-borde bg-white p-5">
            <p className="text-sm font-semibold text-petroleo-900">{d.ubicacion.visitantes}</p>
            <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{d.inicio.visitantesTexto}</p>
            <Link href={`/${locale}/reservar`} className="mt-3 inline-block text-sm font-semibold text-turquesa-600">
              {d.comun.solicitarCita}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
