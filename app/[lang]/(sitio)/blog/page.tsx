import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getDiccionario, normalizarLocale, localeIntl } from "@/lib/i18n";
import { obtenerArticulosPublicos } from "@/lib/datos/publico";
import { metadataPagina } from "@/lib/seo";
import { EstadoVacio } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.blog.titulo,
    descripcion: d.blog.subtitulo,
    ruta: "/blog",
  });
}

export default async function Blog({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const articulos = await obtenerArticulosPublicos(locale);
  const formato = new Intl.DateTimeFormat(localeIntl(locale), { dateStyle: "long" });

  return (
    <>
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.blog}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.blog.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave">
            {d.blog.subtitulo}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
        {articulos.length === 0 ? (
          <EstadoVacio
            titulo={d.blog.vacio}
            icono={<BookOpen className="h-7 w-7" aria-hidden />}
            accion={
              <Link href={`/${locale}/reservar`} className="text-sm font-semibold text-turquesa-600">
                {d.comun.solicitarCita}
              </Link>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {articulos.map((articulo) => (
              <article key={articulo.slug} className="rounded-2xl border border-borde bg-white p-5">
                <p className="text-xs font-medium text-tinta-suave">
                  {articulo.publicadoEn
                    ? formato.format(new Date(articulo.publicadoEn))
                    : d.blog.publicado}
                </p>
                <h2 className="mt-2 font-display text-2xl text-petroleo-900">{articulo.titulo}</h2>
                <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{articulo.resumen}</p>
                <Link
                  href={`/${locale}/blog/${articulo.slug}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-turquesa-600"
                >
                  {d.comun.leerMas}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
