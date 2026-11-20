import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDiccionario, normalizarLocale, localeIntl } from "@/lib/i18n";
import { obtenerArticuloPublico } from "@/lib/datos/publico";
import { metadataPagina, jsonLdArticulo, scriptJsonLd } from "@/lib/seo";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = normalizarLocale(lang);
  const articulo = await obtenerArticuloPublico(slug, locale);
  if (!articulo) return {};
  return metadataPagina({
    locale,
    titulo: articulo.titulo,
    descripcion: articulo.resumen,
    ruta: `/blog/${articulo.slug}`,
    tipo: "article",
    publicadoEn: articulo.publicadoEn,
  });
}

export default async function Articulo({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const locale = normalizarLocale(lang);
  const d = getDiccionario(locale);
  const articulo = await obtenerArticuloPublico(slug, locale);
  if (!articulo) notFound();
  const formato = new Intl.DateTimeFormat(localeIntl(locale), { dateStyle: "long" });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdArticulo(articulo, locale)) }}
      />
      <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-16">
        <Link
          href={`/${locale}/blog`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-turquesa-600 hover:text-petroleo-800"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {d.blog.volver}
        </Link>
        <h1 className="mt-5 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
          {articulo.titulo}
        </h1>
        <p className="mt-3 text-sm text-tinta-suave">
          {articulo.publicadoEn ? formato.format(new Date(articulo.publicadoEn)) : d.blog.publicado}
        </p>
        {articulo.resumen && (
          <p className="mt-5 border-l-2 border-turquesa-500 pl-4 text-base leading-relaxed text-tinta-suave">
            {articulo.resumen}
          </p>
        )}
        <div className="mt-7 whitespace-pre-line text-base leading-8 text-tinta">
          {articulo.contenido}
        </div>
        <p className="mt-8 rounded-xl border border-amber-200 bg-aviso-suave p-4 text-sm text-amber-900">
          {d.servicios.aviso}
        </p>
      </article>
    </>
  );
}
