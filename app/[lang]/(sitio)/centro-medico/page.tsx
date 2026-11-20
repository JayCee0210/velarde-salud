import Link from "next/link";
import { BadgeCheck, CalendarCheck2, CheckCircle2, ShieldCheck, Stethoscope } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { metadataPagina, jsonLdClinica, scriptJsonLd } from "@/lib/seo";
import { clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.centro.titulo,
    descripcion: d.centro.subtitulo,
    ruta: "/centro-medico",
  });
}

export default async function CentroMedico({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const clinica = await obtenerClinicaPublica();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdClinica(locale)) }}
      />
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.centro}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.centro.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave sm:text-lg">
            {d.centro.texto}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={`/${locale}/reservar`} className={clasesBoton("primario", "lg")}>
              <CalendarCheck2 className="h-5 w-5" aria-hidden />
              {d.comun.solicitarCita}
            </Link>
            <Link href={`/${locale}/ubicacion`} className={clasesBoton("secundario", "lg")}>
              {d.nav.ubicacion}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        <h2 className="font-display text-3xl text-petroleo-900">{d.centro.valores}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            [BadgeCheck, d.centro.valor1, d.centro.valor1Texto],
            [Stethoscope, d.centro.valor2, d.centro.valor2Texto],
            [ShieldCheck, d.centro.valor3, d.centro.valor3Texto],
          ].map(([Icono, titulo, texto]) => {
            const Componente = Icono as typeof BadgeCheck;
            return (
              <div key={String(titulo)} className="rounded-2xl border border-borde bg-white p-5">
                <Componente className="h-5 w-5 text-turquesa-600" aria-hidden />
                <p className="mt-3 font-semibold text-petroleo-900">{String(titulo)}</p>
                <p className="mt-1 text-sm leading-relaxed text-tinta-suave">{String(texto)}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 grid gap-6 rounded-2xl border border-borde bg-white p-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
              {d.nav.ubicacion}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
              {clinica.direccion}
              <br />
              {clinica.ciudad}, {clinica.departamento}, {clinica.pais}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
              {d.nav.doctor}
            </p>
            <p className="mt-2 text-sm font-semibold text-petroleo-900">{clinica.medico.nombre}</p>
            <p className="text-sm text-tinta-suave">
              {locale === "pt" ? clinica.medico.especialidadPt : clinica.medico.especialidad}
            </p>
          </div>
        </div>

        <p className="mt-6 flex items-start gap-2 rounded-xl border border-amber-200 bg-aviso-suave p-4 text-sm leading-relaxed text-amber-900">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {d.centro.pendiente}
        </p>
      </section>
    </>
  );
}
