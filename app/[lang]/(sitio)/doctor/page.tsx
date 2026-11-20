import Link from "next/link";
import Image from "next/image";
import { CalendarCheck2, CheckCircle2, MessageCircle } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { SERVICIOS_PUBLICOS } from "@/lib/contenido/servicios";
import { metadataPagina, jsonLdMedico, scriptJsonLd } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.doctor.titulo,
    descripcion: d.doctor.texto,
    ruta: "/doctor",
  });
}

export default async function Doctor({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdMedico(locale)) }}
      />
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-16 md:grid-cols-[0.7fr_1.3fr] md:items-center">
           <div className="relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl border border-turquesa-300 bg-white p-3 shadow-sm sm:h-48 sm:w-48">
             <Image src="/imagenes/logo-dr-velarde.jpeg" alt="Logotipo profesional del Dr. Marco Antonio Velarde Melgar" fill sizes="192px" className="object-contain p-3" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
              {d.doctor.especialidad}
            </p>
            <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
              {clinica.medico.nombre}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave">{d.doctor.texto}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/reservar`} className={clasesBoton("primario", "lg")}>
                <CalendarCheck2 className="h-5 w-5" aria-hidden />
                {d.doctor.cita}
              </Link>
              <a
                href={enlaceWhatsApp(clinica.whatsapp, d.doctor.cita)}
                target="_blank"
                rel="noreferrer"
                className={clasesBoton("secundario", "lg")}
              >
                <MessageCircle className="h-5 w-5" aria-hidden />
                {d.comun.whatsapp}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-2xl text-petroleo-900">{d.doctor.servicios}</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {SERVICIOS_PUBLICOS.map((servicio) => (
              <Link
                key={servicio.slug}
                href={`/${locale}/servicios/${servicio.slug}`}
                className="flex items-center gap-2 rounded-xl border border-borde bg-white px-3 py-3 text-sm font-medium text-petroleo-900 hover:border-turquesa-300 hover:bg-turquesa-100/40"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-turquesa-600" aria-hidden />
                {servicio.nombre[locale]}
              </Link>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-aviso-suave p-5 text-sm leading-relaxed text-amber-900">
          <p className="font-semibold">{d.inicio.pendienteTitulo}</p>
          <p className="mt-2">{d.doctor.pendiente}</p>
        </div>
      </section>
    </>
  );
}
