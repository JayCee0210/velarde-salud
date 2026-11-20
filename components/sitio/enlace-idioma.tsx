"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import type { Locale } from "@/lib/clinica/config";

function EnlaceIdiomaInterno({ locale, etiqueta }: { locale: Locale; etiqueta: string }) {
  const ruta = usePathname() ?? `/${locale}`;
  const otro: Locale = locale === "es" ? "pt" : "es";
  const destino = ruta.replace(/^\/(es|pt)(?=\/|$)/, `/${otro}`);

  return (
    <Link
      href={destino}
      className="hidden rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wider text-tinta-suave hover:bg-arena-50 sm:block"
      aria-label={etiqueta}
      hrefLang={otro}
    >
      {otro === "pt" ? "PT" : "ES"}
    </Link>
  );
}

export function EnlaceIdioma(props: { locale: Locale; etiqueta: string }) {
  return (
    <Suspense fallback={<span className="text-sm font-semibold text-tinta-suave">{props.etiqueta}</span>}>
      <EnlaceIdiomaInterno {...props} />
    </Suspense>
  );
}
