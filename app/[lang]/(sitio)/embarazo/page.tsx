import Link from "next/link";
import { AlertTriangle, CalendarCheck2, CheckCircle2, HeartPulse, ShieldCheck } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { metadataPagina, jsonLdBreadcrumb, scriptJsonLd } from "@/lib/seo";
import { clasesBoton } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.embarazo.titulo,
    descripcion: d.embarazo.subtitulo,
    ruta: "/embarazo",
  });
}

const SENALES = {
  es: [
    "Sangrado vaginal",
    "Dolor abdominal intenso",
    "Fiebre alta",
    "Convulsiones o desmayo",
    "Disminución de los movimientos del bebé",
    "Dolor de cabeza intenso con visión borrosa",
  ],
  pt: [
    "Sangramento vaginal",
    "Dor abdominal intensa",
    "Febre alta",
    "Convulsões ou desmaio",
    "Diminuição dos movimentos do bebê",
    "Dor de cabeça intensa com visão turva",
  ],
};

const CONTROLES = {
  es: [
    "Registro de controles prenatales",
    "Seguimiento de peso, presión y mediciones",
    "Coordinación de ecografías y laboratorio",
    "Documentos clínicos protegidos por rol",
  ],
  pt: [
    "Registro de consultas pré-natais",
    "Acompanhamento de peso, pressão e medidas",
    "Coordenação de ultrassonografias e laboratório",
    "Documentos clínicos protegidos por função",
  ],
};

export default async function Embarazo({ params }: { params: Promise<{ lang: string }> }) {
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
              { nombre: d.embarazo.titulo, ruta: "/embarazo" },
            ]),
          ),
        }}
      />
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.embarazo}
          </p>
          <h1 className="mt-2 max-w-3xl font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.embarazo.titulo}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-tinta-suave sm:text-lg">
            {d.embarazo.texto}
          </p>
          <Link href={`/${locale}/reservar?servicio=control-prenatal`} className={`${clasesBoton("primario", "lg")} mt-6`}>
            <CalendarCheck2 className="h-5 w-5" aria-hidden />
            {d.embarazo.cta}
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 sm:py-16 md:grid-cols-2">
        <div className="rounded-2xl border border-borde bg-white p-5 sm:p-6">
          <HeartPulse className="h-6 w-6 text-turquesa-600" aria-hidden />
          <h2 className="mt-3 font-display text-2xl text-petroleo-900">{d.panel.controles}</h2>
          <ul className="mt-4 space-y-2.5">
            {CONTROLES[locale].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-tinta-suave">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-turquesa-600" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-red-200 bg-peligro-suave p-5 text-red-950 sm:p-6">
          <AlertTriangle className="h-6 w-6 text-peligro" aria-hidden />
          <h2 className="mt-3 font-display text-2xl">{d.embarazo.senalAlarma}</h2>
          <p className="mt-2 text-sm font-semibold">
            {d.embarazo.senalAlarmaTexto}
          </p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {SENALES[locale].map((senal) => (
              <li key={senal} className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-peligro" />
                {senal}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-6 sm:pb-16">
        <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-aviso-suave p-4 text-sm leading-relaxed text-amber-900">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {d.embarazo.aviso}
        </p>
      </section>
    </>
  );
}
