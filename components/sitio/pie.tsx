import Link from "next/link";
import { MapPin, MessageCircle } from "lucide-react";
import type { ClinicaPublica, Locale } from "@/lib/clinica/config";
import type { Diccionario } from "@/lib/i18n/diccionarios";
import { enlaceWhatsApp } from "@/lib/utils";

export function Pie({
  locale,
  clinica,
  d,
}: {
  locale: Locale;
  clinica: ClinicaPublica;
  d: Diccionario;
}) {
  return (
    <footer className="border-t border-petroleo-800 bg-petroleo-950 text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <p className="text-lg font-bold">{clinica.nombre}</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/70">
            {clinica.descripcion[locale]}
          </p>
          <p className="mt-4 text-sm font-medium text-turquesa-300">{clinica.medico.nombre}</p>
          <p className="text-sm text-white/60">{locale === "pt" ? clinica.medico.especialidadPt : clinica.medico.especialidad}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-300">
            {d.nav.servicios}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            {[
              ["/servicios/ginecologia", locale === "pt" ? "Ginecologia" : "Ginecología"],
              ["/servicios/obstetricia", locale === "pt" ? "Obstetrícia" : "Obstetricia"],
              ["/servicios/control-prenatal", locale === "pt" ? "Pré-natal" : "Control prenatal"],
              ["/servicios/ecografias", locale === "pt" ? "Ultrassonografias" : "Ecografías"],
              ["/servicios/medicina-general", locale === "pt" ? "Clínica geral" : "Medicina general"],
              ["/servicios/laboratorios", locale === "pt" ? "Laboratório" : "Laboratorios"],
            ].map(([href, texto]) => (
              <li key={href}>
                <Link className="hover:text-white" href={`/${locale}${href}`}>
                  {texto}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-300">
            {d.nav.ubicacion}
          </p>
          <p className="mt-3 flex gap-2 text-sm leading-relaxed text-white/75">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              {clinica.direccion}
              <br />
              {clinica.ciudad}, {clinica.departamento}, {clinica.pais}
            </span>
          </p>
          <a
            href={enlaceWhatsApp(clinica.whatsapp)}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            <MessageCircle className="h-4 w-4" aria-hidden />
            {clinica.whatsapp}
          </a>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
            <Link href={`/${locale}/preguntas-frecuentes`} className="hover:text-white">
              {d.nav.faq}
            </Link>
            <Link href={`/${locale}/ingresar`} className="hover:text-white">
              {d.nav.ingresar}
            </Link>
            <Link href={`/${locale}/contacto`} className="hover:text-white">
              {d.nav.contacto}
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/45">
        © {clinica.nombre}. {d.servicios.aviso}
      </div>
    </footer>
  );
}
