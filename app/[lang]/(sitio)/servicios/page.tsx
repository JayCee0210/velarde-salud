import Link from "next/link";
import { CalendarCheck2 } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { SERVICIOS_PUBLICOS } from "@/lib/contenido/servicios";
import { metadataPagina, jsonLdBreadcrumb, scriptJsonLd } from "@/lib/seo";
import { TarjetaServicio } from "@/components/sitio/tarjeta-servicio";
import { TituloSeccion, clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.servicios.titulo,
    descripcion: d.servicios.subtitulo,
    ruta: "/servicios",
  });
}

export default async function Servicios({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: scriptJsonLd(
            jsonLdBreadcrumb(locale, [
              { nombre: d.nav.inicio, ruta: "/" },
              { nombre: d.servicios.titulo, ruta: "/servicios" },
            ]),
          ),
        }}
      />
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <Link href={`/${locale}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-600">
            {d.nav.inicio}
          </Link>
          <div className="mt-3">
            <TituloSeccion
              eyebrow={d.nav.servicios}
              titulo={d.servicios.titulo}
              texto={d.servicios.subtitulo}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICIOS_PUBLICOS.map((servicio) => (
            <TarjetaServicio
              key={servicio.slug}
              servicio={servicio}
              locale={locale}
              textoEnlace={d.servicios.incluye}
            />
          ))}
        </div>
        <div className="mt-10 rounded-2xl border border-turquesa-300 bg-turquesa-100/50 p-6 sm:flex sm:items-center sm:justify-between">
          <p className="max-w-2xl text-sm leading-relaxed text-tinta-suave">{d.servicios.aviso}</p>
          <Link href={`/${locale}/reservar`} className={`${clasesBoton("primario", "md")} mt-4 shrink-0 sm:mt-0`}>
            <CalendarCheck2 className="h-4 w-4" aria-hidden />
            {d.comun.solicitarCita}
          </Link>
        </div>
      </section>
    </>
  );
}
