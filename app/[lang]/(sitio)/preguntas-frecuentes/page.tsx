import Link from "next/link";
import { CalendarCheck2 } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerPreguntasPublicas } from "@/lib/datos/publico";
import { metadataPagina, jsonLdFaq, scriptJsonLd } from "@/lib/seo";
import { clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.faq.titulo,
    descripcion: d.faq.subtitulo,
    ruta: "/preguntas-frecuentes",
  });
}

export default async function PreguntasFrecuentes({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  const preguntas = await obtenerPreguntasPublicas(locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: scriptJsonLd(jsonLdFaq(preguntas)) }}
      />
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.faq}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.faq.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave">{d.faq.subtitulo}</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="divide-y divide-borde rounded-2xl border border-borde bg-white">
          {preguntas.map((faq) => (
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

        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-turquesa-300 bg-turquesa-100/50 p-5 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm leading-relaxed text-tinta-suave">{d.faq.aviso}</p>
          <Link href={`/${locale}/reservar`} className={`${clasesBoton("primario", "md")} shrink-0`}>
            <CalendarCheck2 className="h-4 w-4" aria-hidden />
            {d.comun.solicitarCita}
          </Link>
        </div>
      </section>
    </>
  );
}
