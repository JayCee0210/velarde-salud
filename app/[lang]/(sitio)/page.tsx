import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck2,
  CheckCircle2,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { SERVICIOS_PUBLICOS, PREGUNTAS_FRECUENTES } from "@/lib/contenido/servicios";
import { metadataPagina, jsonLdClinica, jsonLdFaq, scriptJsonLd } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { TarjetaServicio } from "@/components/sitio/tarjeta-servicio";
import { TituloSeccion, clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: `${d.inicio.titulo} | ${d.inicio.etiqueta}`,
    descripcion: d.inicio.subtitulo,
    ruta: "/",
  });
}

export default async function Inicio({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();
  const faqs = PREGUNTAS_FRECUENTES.slice(0, 4).map((faq) => ({
    pregunta: faq.pregunta[locale],
    respuesta: faq.respuesta[locale],
  }));

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

      <section className="textura-medica relative overflow-hidden text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-turquesa-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {d.inicio.etiqueta}
            </p>
            <h1 className="mt-5 max-w-2xl font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              {d.inicio.titulo}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              {d.inicio.subtitulo}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/reservar`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-turquesa-500 px-5 py-3 text-base font-semibold text-petroleo-950 transition-colors hover:bg-turquesa-300"
              >
                <CalendarCheck2 className="h-5 w-5" aria-hidden />
                {d.inicio.ctaPrincipal}
              </Link>
              <Link
                href={`/${locale}/servicios/ginecologia`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-white/10"
              >
                {d.inicio.ctaSecundaria}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-sm text-white/60">
              <MapPin className="h-4 w-4 text-turquesa-300" aria-hidden />
              {d.inicio.datos}
            </p>
          </div>

           <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
             <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl border border-white/15 bg-white/10">
               <Image src="/imagenes/velarde-hero.jpeg" alt="Centro Médico Especializado VELARDE y Dr. Marco Antonio Velarde Melgar" fill priority sizes="(max-width: 1024px) 100vw, 420px" className="object-cover" />
             </div>
             <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-turquesa-300 font-display text-2xl font-semibold text-petroleo-950">
                MV
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-300">
                  {d.inicio.especialidad}
                </p>
                <p className="mt-0.5 text-lg font-semibold leading-tight">{d.inicio.medico}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm text-white/75">
              <p className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-300" aria-hidden />
                <span>{clinica.direccion}</span>
              </p>
              <p className="flex items-start gap-2">
                <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-300" aria-hidden />
                <span>{clinica.whatsapp}</span>
              </p>
            </div>
            <div className="mt-5 grid gap-2">
              <a
                href={enlaceWhatsApp(clinica.whatsapp, d.inicio.ctaPrincipal)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-petroleo-900 hover:bg-turquesa-100"
              >
                <MessageCircle className="h-4 w-4" aria-hidden />
                {d.comun.whatsapp}
              </a>
              <Link
                href={`/${locale}/ubicacion`}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
              >
                <MapPin className="h-4 w-4" aria-hidden />
                {d.inicio.ubicacionTitulo}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-borde bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 sm:grid-cols-3 sm:px-6">
          {[
            [ShieldCheck, d.inicio.confianzaTitulo, d.inicio.confianzaTexto],
            [CalendarCheck2, d.reservar.titulo, d.reservar.subtitulo],
            [BadgeCheck, d.inicio.pendienteTitulo, d.inicio.pendienteTexto],
          ].map(([Icono, titulo, texto]) => {
            const Componente = Icono as typeof ShieldCheck;
            return (
              <div key={String(titulo)} className="flex items-start gap-3">
                <Componente className="mt-0.5 h-5 w-5 shrink-0 text-turquesa-600" aria-hidden />
                <div>
                  <p className="text-sm font-semibold text-petroleo-900">{String(titulo)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-tinta-suave">{String(texto)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <TituloSeccion
            eyebrow={d.nav.servicios}
            titulo={d.inicio.serviciosTitulo}
            texto={d.inicio.serviciosTexto}
          />
          <Link
            href={`/${locale}/servicios/ginecologia`}
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-turquesa-600 hover:text-petroleo-800"
          >
            {d.comun.verServicios}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS_PUBLICOS.map((servicio) => (
            <TarjetaServicio
              key={servicio.slug}
              servicio={servicio}
              locale={locale}
              textoEnlace={d.comun.leerMas}
            />
          ))}
        </div>
      </section>

      <section className="bg-arena-50 py-14 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="rounded-2xl border border-borde bg-white p-6 sm:p-8">
             <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-turquesa-300 bg-white p-2 shadow-sm">
               <Image src="/imagenes/logo-dr-velarde.jpeg" alt="Logotipo profesional del Dr. Marco Antonio Velarde Melgar" fill sizes="80px" className="object-contain p-2" />
            </div>
            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
              {d.inicio.especialidad}
            </p>
            <h2 className="mt-1 font-display text-3xl text-petroleo-900">{d.inicio.medico}</h2>
            <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{d.doctor.texto}</p>
            <div className="mt-5 space-y-2 text-sm text-tinta-suave">
              {[d.doctor.servicios, d.centro.valor3, d.centro.valor1].map((texto) => (
                <p key={texto} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-600" aria-hidden />
                  {texto}
                </p>
              ))}
            </div>
            <Link href={`/${locale}/doctor`} className={`${clasesBoton("secundario", "md")} mt-6`}>
              {d.inicio.doctorTitulo}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

           <div>
             <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl border border-borde bg-white shadow-sm">
               <Image src="/imagenes/doctor-ecografia.jpeg" alt="Dr. Marco Antonio Velarde realizando una ecografía" fill sizes="(max-width: 1024px) 100vw, 560px" className="object-cover" />
             </div>
             <TituloSeccion
              eyebrow={d.nav.centro}
              titulo={d.inicio.confianzaTitulo}
              texto={d.inicio.confianzaTexto}
            />
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                [ShieldCheck, d.centro.valor3, d.centro.valor3Texto],
                [BadgeCheck, d.centro.valor1, d.centro.valor1Texto],
                [CalendarCheck2, d.centro.valor2, d.centro.valor2Texto],
                [Stethoscope, d.inicio.pendienteTitulo, d.inicio.pendienteTexto],
              ].map(([Icono, titulo, texto]) => {
                const Componente = Icono as typeof ShieldCheck;
                return (
                  <div key={String(titulo)} className="rounded-xl border border-borde bg-white p-4">
                    <Componente className="h-5 w-5 text-turquesa-600" aria-hidden />
                    <p className="mt-3 text-sm font-semibold text-petroleo-900">{String(titulo)}</p>
                    <p className="mt-1 text-xs leading-relaxed text-tinta-suave">{String(texto)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2 sm:py-20">
        <div className="rounded-2xl bg-petroleo-900 p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-300">
            {d.nav.embarazo}
          </p>
          <h2 className="mt-2 font-display text-3xl">{d.embarazo.titulo}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{d.embarazo.texto}</p>
          <Link
            href={`/${locale}/embarazo`}
            className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-turquesa-300 hover:text-white"
          >
            {d.embarazo.cta}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        <div className="rounded-2xl border border-borde bg-white p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
            {d.inicio.visitantesTitulo}
          </p>
          <h2 className="mt-2 font-display text-3xl text-petroleo-900">{d.inicio.ubicacionTitulo}</h2>
          <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{d.inicio.visitantesTexto}</p>
          <p className="mt-4 flex items-start gap-2 text-sm text-tinta-suave">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-600" aria-hidden />
            {clinica.direccion}, {clinica.ciudad}, {clinica.departamento}
          </p>
          <Link href={`/${locale}/ubicacion`} className={`${clasesBoton("suave", "md")} mt-5`}>
            {d.nav.ubicacion}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      <section className="border-y border-borde bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <TituloSeccion eyebrow={d.nav.faq} titulo={d.faq.titulo} texto={d.faq.subtitulo} centrado />
          <div className="mt-8 divide-y divide-borde rounded-2xl border border-borde">
            {faqs.map((faq) => (
              <details key={faq.pregunta} className="group px-4 py-4 sm:px-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-petroleo-900 [&::-webkit-details-marker]:hidden">
                  {faq.pregunta}
                  <span className="text-xl leading-none text-turquesa-600 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{faq.respuesta}</p>
              </details>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href={`/${locale}/preguntas-frecuentes`} className="text-sm font-semibold text-turquesa-600 hover:text-petroleo-800">
              {d.nav.faq}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-turquesa-300 bg-turquesa-100/60 p-6 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="font-display text-3xl text-petroleo-900">{d.reservar.titulo}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-tinta-suave">{d.reservar.subtitulo}</p>
          </div>
          <Link href={`/${locale}/reservar`} className={`${clasesBoton("primario", "lg")} shrink-0`}>
            <CalendarCheck2 className="h-5 w-5" aria-hidden />
            {d.comun.solicitarCita}
          </Link>
        </div>
      </section>
    </>
  );
}
