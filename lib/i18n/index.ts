import { es, pt, type Diccionario } from "./diccionarios";

export const LOCALES = ["es", "pt"] as const;
export type Locale = (typeof LOCALES)[number];
export const LOCALE_POR_DEFECTO: Locale = "es";

const DICCIONARIOS: Record<Locale, Diccionario> = { es, pt };

export function esLocale(valor: string): valor is Locale {
  return (LOCALES as readonly string[]).includes(valor);
}

export function normalizarLocale(valor: string | undefined | null): Locale {
  return valor && esLocale(valor) ? valor : LOCALE_POR_DEFECTO;
}

export function getDiccionario(locale: Locale): Diccionario {
  return DICCIONARIOS[locale];
}

export function localeIntl(locale: Locale): string {
  return locale === "pt" ? "pt-BR" : "es-BO";
}

export function otroLocale(locale: Locale): Locale {
  return locale === "es" ? "pt" : "es";
}

export function rutaConLocale(locale: Locale, ruta: string): string {
  const limpia = ruta.startsWith("/") ? ruta : `/${ruta}`;
  return `/${locale}${limpia === "/" ? "" : limpia}`;
}
