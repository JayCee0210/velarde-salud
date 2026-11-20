import { MapPin, MessageCircle, Phone } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { metadataPagina } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { FormularioContacto } from "@/components/sitio/formulario-contacto";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.contacto.titulo,
    descripcion: d.contacto.subtitulo,
    ruta: "/contacto",
  });
}

export default async function Contacto({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();

  return (
    <>
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.contacto}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.contacto.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave">
            {d.contacto.subtitulo}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border border-borde bg-white p-5 sm:p-6">
          <h2 className="font-display text-2xl text-petroleo-900">{d.contacto.mensaje}</h2>
          <p className="mt-1 text-sm text-tinta-suave">{d.contacto.mensajeAyuda}</p>
          <div className="mt-5">
            <FormularioContacto d={d} />
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-petroleo-900">
              <MapPin className="h-4 w-4 text-turquesa-600" aria-hidden />
              {d.ubicacion.direccion}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
              {clinica.direccion}
              <br />
              {clinica.ciudad}, {clinica.departamento}, {clinica.pais}
            </p>
          </div>
          <div className="rounded-2xl border border-borde bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-petroleo-900">
              <Phone className="h-4 w-4 text-turquesa-600" aria-hidden />
              {d.ubicacion.telefono}
            </p>
            <p className="mt-2 text-sm text-tinta-suave">{clinica.telefono}</p>
            <a
              href={enlaceWhatsApp(clinica.whatsapp)}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-turquesa-600"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              {d.comun.whatsapp}
            </a>
          </div>
          <p className="rounded-xl border border-amber-200 bg-aviso-suave p-4 text-xs leading-relaxed text-amber-900">
            {d.contacto.aviso}
          </p>
        </aside>
      </section>
    </>
  );
}
