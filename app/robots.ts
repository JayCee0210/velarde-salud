import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/clinica/config";

export default function robots(): MetadataRoute.Robots {
  const base = urlSitio();
  return {
    rules: [{ userAgent: "*", allow: ["/es", "/pt"], disallow: ["/api/", "/es/panel/", "/pt/panel/", "/es/ingresar", "/pt/ingresar"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
