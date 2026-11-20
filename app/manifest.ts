import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VELARDE DIGITAL",
    short_name: "VELARDE",
    description: "Plataforma del Centro Médico Especializado VELARDE",
    start_url: "/es",
    display: "standalone",
    background_color: "#f7f5ef",
    theme_color: "#0f4c5c",
    lang: "es",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
