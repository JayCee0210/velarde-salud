import Link from "next/link";
import { CalendarCheck2, CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica, obtenerServiciosReserva } from "@/lib/datos/publico";
import { buscarServicio } from "@/lib/contenido/servicios";
import { metadataPagina } from "@/lib/seo";
import { enlaceWhatsApp } from "@/lib/utils";
import { FormularioReserva } from "@/components/sitio/formulario-reserva";
import { Alerta, clasesBoton } from "@/components/ui/base";

export const instant = false;

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  const d = getDiccionario(locale);
  return metadataPagina({
    locale,
    titulo: d.reservar.titulo,
    descripcion: d.reservar.subtitulo,
    ruta: "/reservar",
  });
}

function fechaLocalIso(fecha: Date): string {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

export default async function Reservar({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ servicio?: string }>;
}) {
  const locale = normalizarLocale((await params).lang);
  const sp = await searchParams;
  const d = getDiccionario(locale);
  const [clinica, opciones] = await Promise.all([
    obtenerClinicaPublica(),
    obtenerServiciosReserva(),
  ]);
  const servicios = opciones.map((opcion) => ({
    ...opcion,
    nombre: buscarServicio(opcion.slug)?.nombre[locale] ?? opcion.nombre,
  }));
  const servicioInicial =
    typeof sp.servicio === "string" && servicios.some((item) => item.slug === sp.servicio)
      ? sp.servicio
      : undefined;

  return (
    <>
      <section className="border-b border-borde bg-arena-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
            {d.nav.reservar}
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight text-petroleo-900 sm:text-5xl">
            {d.reservar.titulo}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-tinta-suave">
            {d.reservar.subtitulo}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-borde bg-white p-5 sm:p-7">
          <FormularioReserva
            locale={locale}
            d={d}
            servicios={servicios}
            whatsapp={clinica.whatsapp}
            fechaMin={fechaLocalIso(new Date())}
            servicioInicial={servicioInicial}
          />
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-borde bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-petroleo-900">
              <CalendarCheck2 className="h-4 w-4 text-turquesa-600" aria-hidden />
              {d.reservar.paso2}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-tinta-suave">{d.reservar.avisoTexto}</p>
            <div className="mt-4 space-y-2">
              {[d.reservar.paso1, d.reservar.paso2, d.reservar.paso3].map((paso, indice) => (
                <p key={paso} className="flex items-center gap-2 text-sm text-tinta-suave">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-turquesa-100 text-xs font-bold text-petroleo-900">
                    {indice + 1}
                  </span>
                  {paso}
                </p>
              ))}
            </div>
          </div>

          <Alerta tono="info" titulo={d.inicio.pendienteTitulo}>
            {d.inicio.pendienteTexto}
          </Alerta>

          <div className="rounded-2xl border border-borde bg-white p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-petroleo-900">
              <ShieldCheck className="h-4 w-4 text-turquesa-600" aria-hidden />
              {d.centro.valor3}
            </p>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-tinta-suave">
              {[d.centro.valor3Texto, d.reservar.avisoTexto].map((texto) => (
                <li key={texto} className="flex items-start gap-1.5">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-turquesa-600" aria-hidden />
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          <a
            href={enlaceWhatsApp(clinica.whatsapp, d.reservar.titulo)}
            target="_blank"
            rel="noreferrer"
            className={`${clasesBoton("secundario", "md")} w-full`}
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {d.comun.whatsapp}: {clinica.whatsapp}
          </a>

          <Link href={`/${locale}/ubicacion`} className="block text-center text-sm font-semibold text-turquesa-600 hover:text-petroleo-800">
            {d.nav.ubicacion}
          </Link>
        </aside>
      </section>
    </>
  );
}
