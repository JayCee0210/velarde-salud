import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/clinica/config";

const rutas = [
  "",
  "/centro-medico",
  "/doctor",
  "/servicios",
  "/embarazo",
  "/instalaciones",
  "/blog",
  "/preguntas-frecuentes",
  "/ubicacion",
  "/contacto",
  "/reservar",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = urlSitio();
  return ["es", "pt"].flatMap((locale) =>
    rutas.map((ruta) => ({
      url: `${base}/${locale}${ruta}`,
      changeFrequency: "monthly" as const,
      priority: ruta === "" ? 1 : 0.7,
    })),
  );
}
