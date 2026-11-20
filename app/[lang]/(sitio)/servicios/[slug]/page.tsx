import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarCheck2, CheckCircle2, MessageCircle } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { SERVICIOS_PUBLICOS, buscarServicio } from "@/lib/contenido/servicios";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import {
  metadataPagina,
  jsonLdBreadcrumb,
  jsonLdFaq,
  jsonLdClinica,
  scriptJsonLd,
} from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { TarjetaServicio } from "@/components/sitio/tarjeta-servicio";
import { clasesBoton } from "@/components/ui/base";

export const instant = false;

export function generateStaticParams() {
  return SERVICIOS_PUBLICOS.map((servicio) => ({ slug: servicio.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = normalizarLocale(lang);
  const servicio = buscarServicio(slug);
  if (!servicio) return {};
  return metadataPagina({
    locale,
    titulo: servicio.nombre[locale],
    descripcion: servicio.resumen[locale],
    ruta: `/servicios/${servicio.slug}`,
  });
}

export default async function ServicioDetalle({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = normalizarLocale(lang);
  const servicio = buscarServicio(slug);
  if (!servicio) notFound();
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();
  const faqs = servicio.preguntas.map((faq) => ({
    pregunta: faq.pregunta[locale],
    respuesta: faq.respuesta[locale],
  }));
  const otros = SERVICIOS_PUBLICOS.filter((item) => item.slug !== servicio.slug).slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdClinica(locale)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdFaq(faqs)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: scriptJsonLd(
            jsonLdBreadcrumb(locale, [
              { nombre: d.nav.inicio, ruta: "/" },
              { nombre: d.servicios.titulo, ruta: "/servicios" },
              { nombre: servicio.nombre[locale], ruta: `/servicios/${servicio.slug}` },
            ]),
          ),
        }}
      />

      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href={`/${locale}/servicios`}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-turquesa-600 hover:text-petroleo-800"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {d.servicios.volver}
          </Link>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {servicio.especialidad}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {servicio.nombre[locale]}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave sm:text-lg">
            {servicio.resumen[locale]}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/reservar?servicio=${servicio.slug}`}
              className={clasesBoton("primario", "lg")}
            >
              <CalendarCheck2 className="h-5 w-5" aria-hidden />
              {d.servicios.agendar}
            </Link>
            <a
              href={enlaceWhatsApp(clinica.whatsapp, servicio.nombre[locale])}
              target="_blank"
              rel="noreferrer"
              className={clasesBoton("secundario", "lg")}
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              {d.comun.whatsapp}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 className="font-display text-2xl text-petroleo-900">{d.servicios.incluye}</h2>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{servicio.descripcion[locale]}</p>
          <ul className="mt-4 space-y-2.5">
            {servicio.incluye[locale].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-tinta-suave">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 rounded-xl border border-amber-200 bg-aviso-suave p-3 text-xs leading-relaxed text-amber-900">
            {d.servicios.aviso}
          </p>
        </div>

        <div className="rounded-2xl border border-borde bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
            {d.nav.ubicacion}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">
            {clinica.direccion}
            <br />
            {clinica.ciudad}, {clinica.departamento}
          </p>
          <p className="mt-4 text-sm font-semibold text-petroleo-900">{clinica.medico.nombre}</p>
          <p className="text-xs text-tinta-suave">
            {locale === "pt" ? clinica.medico.especialidadPt : clinica.medico.especialidad}
          </p>
          <Link href={`/${locale}/doctor`} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-turquesa-600">
            {d.doctor.titulo}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="border-y border-borde bg-white py-10 sm:py-14">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="font-display text-2xl text-petroleo-900">{d.servicios.preguntas}</h2>
          <div className="mt-5 divide-y divide-borde rounded-2xl border border-borde">
            {servicio.preguntas.map((faq) => (
              <details key={faq.pregunta[locale]} className="group px-4 py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-petroleo-900 [&::-webkit-details-marker]:hidden">
                  {faq.pregunta[locale]}
                  <span className="text-xl leading-none text-turquesa-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{faq.respuesta[locale]}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <h2 className="font-display text-2xl text-petroleo-900">{d.servicios.otros}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {otros.map((item) => (
            <TarjetaServicio
              key={item.slug}
              servicio={item}
              locale={locale}
              textoEnlace={d.comun.leerMas}
            />
          ))}
        </div>
      </section>
    </>
  );
}
