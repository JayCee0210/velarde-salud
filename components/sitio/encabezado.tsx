import Link from "next/link";
import { Menu, MessageCircle, Phone } from "lucide-react";
import type { ClinicaPublica, Locale } from "@/lib/clinica/config";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { enlaceWhatsApp } from "@/lib/utils";
import { Logo, clasesBoton } from "@/components/ui/base";
import { EnlaceIdioma } from "@/components/sitio/enlace-idioma";

export function Encabezado({
  locale,
  clinica,
  d,
}: {
  locale: Locale;
  clinica: ClinicaPublica;
  d: Diccionario;
}) {
  const enlaces = [
    { href: "", texto: d.nav.inicio },
    { href: "/centro-medico", texto: d.nav.centro },
    { href: "/servicios/ginecologia", texto: d.nav.servicios },
    { href: "/doctor", texto: d.nav.doctor },
    { href: "/embarazo", texto: d.nav.embarazo },
    { href: "/blog", texto: d.nav.blog },
    { href: "/ubicacion", texto: d.nav.ubicacion },
    { href: "/contacto", texto: d.nav.contacto },
  ];
  return (
    <header className="sticky top-0 z-40 border-b border-borde/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={`/${locale}`} aria-label={clinica.nombre} className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">
          {enlaces.map((enlace) => (
            <Link
              key={enlace.href}
              href={`/${locale}${enlace.href}`}
              className="rounded-lg px-2.5 py-2 text-sm font-medium text-tinta-suave transition-colors hover:bg-arena-50 hover:text-petroleo-900"
            >
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <EnlaceIdioma locale={locale} etiqueta={d.comun.idioma} />
          <a
            href={enlaceWhatsApp(clinica.whatsapp, d.reservar.titulo)}
            className="hidden items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-petroleo-800 hover:bg-turquesa-100/60 sm:inline-flex"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {d.comun.whatsapp}
          </a>
          <Link href={`/${locale}/reservar`} className={clasesBoton("primario", "sm")}>
            {d.comun.solicitarCita}
          </Link>

          <details className="relative lg:hidden">
            <summary
              className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg border border-borde bg-white text-petroleo-900 [&::-webkit-details-marker]:hidden"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </summary>
            <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-borde bg-white p-2 shadow-xl">
              <nav aria-label="Navegación móvil" className="flex flex-col">
                {enlaces.map((enlace) => (
                  <Link
                    key={enlace.href}
                    href={`/${locale}${enlace.href}`}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-petroleo-900 hover:bg-arena-50"
                  >
                    {enlace.texto}
                  </Link>
                ))}
                <Link
                  href={`/${locale}/preguntas-frecuentes`}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-petroleo-900 hover:bg-arena-50"
                >
                  {d.nav.faq}
                </Link>
                <Link
                  href={`/${locale}/ingresar`}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-tinta-suave hover:bg-arena-50"
                >
                  {d.nav.ingresar}
                </Link>
                <a
                  href={enlaceWhatsApp(clinica.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 flex items-center gap-2 rounded-lg bg-turquesa-100 px-3 py-2.5 text-sm font-semibold text-petroleo-900"
                >
                  <Phone className="h-4 w-4" aria-hidden />
                  {d.comun.whatsapp}
                </a>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
