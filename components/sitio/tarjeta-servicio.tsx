import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Baby,
  FlaskConical,
  HeartPulse,
  ScanLine,
  Stethoscope,
} from "lucide-react";
import type { ServicioPublico } from "@/lib/contenido/servicios";
import type { Locale } from "@/lib/clinica/config";

const ICONOS = {
  ginecologia: HeartPulse,
  obstetricia: Baby,
  "control-prenatal": Stethoscope,
  ecografias: ScanLine,
  "medicina-general": Activity,
  laboratorios: FlaskConical,
} as const;

export function TarjetaServicio({
  servicio,
  locale,
  textoEnlace,
}: {
  servicio: ServicioPublico;
  locale: Locale;
  textoEnlace: string;
}) {
  const Icono = ICONOS[servicio.slug as keyof typeof ICONOS] ?? Stethoscope;
  return (
    <Link
      href={`/${locale}/servicios/${servicio.slug}`}
      className="group flex h-full flex-col rounded-2xl border border-borde bg-superficie p-5 transition-all hover:-translate-y-0.5 hover:border-turquesa-300 hover:shadow-[0_18px_40px_-28px_rgba(6,47,55,0.5)]"
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-turquesa-100 text-petroleo-800 transition-colors group-hover:bg-petroleo-800 group-hover:text-white">
        <Icono className="h-5 w-5" aria-hidden />
      </span>
      <h3 className="font-display text-xl text-petroleo-900">{servicio.nombre[locale]}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-tinta-suave">{servicio.resumen[locale]}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-turquesa-600">
        {textoEnlace}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
