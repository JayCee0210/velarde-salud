import type { Metadata } from "next";
import { CLINICA_VELARDE, urlSitio, type Locale } from "@/lib/clinica/config";

type EntradaMetadata = {
  locale: Locale;
  titulo: string;
  descripcion: string;
  ruta: string;
  noIndex?: boolean;
  tipo?: "website" | "article";
  publicadoEn?: string | null;
};

export function metadataPagina({
  locale,
  titulo,
  descripcion,
  ruta,
  noIndex = false,
  tipo = "website",
  publicadoEn,
}: EntradaMetadata): Metadata {
  const base = urlSitio();
  const normalizada = ruta.startsWith("/") ? ruta : `/${ruta}`;
  const canonical = `${base}/${locale}${normalizada === "/" ? "" : normalizada}`;

  return {
    title: titulo,
    description: descripcion,
    alternates: {
      canonical,
      languages: {
        es: `${base}/es${normalizada === "/" ? "" : normalizada}`,
        "pt-BR": `${base}/pt${normalizada === "/" ? "" : normalizada}`,
        "x-default": `${base}/es${normalizada === "/" ? "" : normalizada}`,
      },
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      title: titulo,
      description: descripcion,
      url: canonical,
      siteName: CLINICA_VELARDE.nombre,
      locale: locale === "pt" ? "pt_BR" : "es_BO",
      alternateLocale: locale === "pt" ? "es_BO" : "pt_BR",
      type: tipo,
      ...(publicadoEn ? { publishedTime: publicadoEn } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titulo,
      description: descripcion,
    },
    other: {
      "geo.region": "BO-B",
      "geo.placename": "Guayaramerín",
      "content-language": locale === "pt" ? "pt-BR" : "es-BO",
    },
  };
}

export function jsonLdClinica(locale: Locale) {
  const base = urlSitio();
  return {
    "@context": "https://schema.org",
    "@type": ["MedicalClinic", "LocalBusiness"],
    "@id": `${base}/#clinica`,
    name: CLINICA_VELARDE.nombre,
    description: CLINICA_VELARDE.descripcion[locale],
    url: `${base}/${locale}`,
    telephone: CLINICA_VELARDE.telefono,
    address: {
      "@type": "PostalAddress",
      streetAddress: CLINICA_VELARDE.direccion,
      addressLocality: CLINICA_VELARDE.ciudad,
      addressRegion: CLINICA_VELARDE.departamento,
      addressCountry: "BO",
    },
    medicalSpecialty: ["Gynecologic", "Obstetric", "PrimaryCare"],
    availableLanguage: ["es", "pt"],
    areaServed: ["Guayaramerín", "Riberalta", "Beni", "Bolivia"],
    employee: {
      "@type": "Physician",
      name: CLINICA_VELARDE.medico.nombre,
      medicalSpecialty: CLINICA_VELARDE.medico.especialidad,
    },
  };
}

export function jsonLdMedico(locale: Locale) {
  const base = urlSitio();
  return {
    "@context": "https://schema.org",
    "@type": "Physician",
    "@id": `${base}/#medico`,
    name: CLINICA_VELARDE.medico.nombre,
    medicalSpecialty: CLINICA_VELARDE.medico.especialidad,
    worksFor: { "@id": `${base}/#clinica` },
    url: `${base}/${locale}/doctor`,
    address: {
      "@type": "PostalAddress",
      streetAddress: CLINICA_VELARDE.direccion,
      addressLocality: CLINICA_VELARDE.ciudad,
      addressRegion: CLINICA_VELARDE.departamento,
      addressCountry: "BO",
    },
  };
}

export function jsonLdBreadcrumb(
  locale: Locale,
  items: Array<{ nombre: string; ruta: string }>,
) {
  const base = urlSitio();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, indice) => ({
      "@type": "ListItem",
      position: indice + 1,
      name: item.nombre,
      item: `${base}/${locale}${item.ruta === "/" ? "" : item.ruta}`,
    })),
  };
}

export function jsonLdFaq(
  preguntas: Array<{ pregunta: string; respuesta: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: preguntas.map((faq) => ({
      "@type": "Question",
      name: faq.pregunta,
      acceptedAnswer: { "@type": "Answer", text: faq.respuesta },
    })),
  };
}

export function jsonLdArticulo(articulo: {
  titulo: string;
  resumen: string;
  slug: string;
  publicadoEn: string | null;
}, locale: Locale) {
  const base = urlSitio();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: articulo.titulo,
    description: articulo.resumen,
    datePublished: articulo.publicadoEn ?? undefined,
    author: { "@type": "Physician", name: CLINICA_VELARDE.medico.nombre },
    publisher: { "@id": `${base}/#clinica` },
    mainEntityOfPage: `${base}/${locale}/blog/${articulo.slug}`,
  };
}

export function scriptJsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, "\\u003c");
}
