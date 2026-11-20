import type { Locale } from "@/lib/i18n";
export type { Locale };

export type ClinicaPublica = {
  id: string | null;
  slug: string;
  nombre: string;
  nombreCorto: string;
  descripcion: Record<Locale, string>;
  direccion: string;
  referencia: string;
  ciudad: string;
  departamento: string;
  pais: string;
  telefono: string;
  whatsapp: string;
  correo: string | null;
  zonaHoraria: string;
  moneda: string;
  idiomas: Locale[];
  medico: {
    nombre: string;
    especialidad: string;
    especialidadPt: string;
  };
  pendientes: {
    horarios: boolean;
    precios: boolean;
    fotografias: boolean;
    registroProfesional: boolean;
    formacion: boolean;
    coordenadas: boolean;
  };
};

export const CLINICA_VELARDE: ClinicaPublica = {
  id: null,
  slug: "velarde",
  nombre: "Centro Médico Especializado VELARDE",
  nombreCorto: "VELARDE",
  descripcion: {
    es: "Atención médica especializada en ginecología, obstetricia, control prenatal, ecografías, medicina general y laboratorios en Guayaramerín, Beni.",
    pt: "Atendimento médico especializado em ginecologia, obstetrícia, pré-natal, ultrassonografias, clínica geral e laboratório em Guayaramerín, Beni.",
  },
  direccion: "Calle Nicolás Gozdanovich, al lado de Farmacia La Familia",
  referencia: "Guayaramerín, Beni, Bolivia",
  ciudad: "Guayaramerín",
  departamento: "Beni",
  pais: "Bolivia",
  telefono: "+59176860839",
  whatsapp: "+59176860839",
  correo: null,
  zonaHoraria: "America/La_Paz",
  moneda: "BOB",
  idiomas: ["es", "pt"],
  medico: {
    nombre: "Dr. Marco Antonio Velarde Melgar",
    especialidad: "Ginecología y Obstetricia",
    especialidadPt: "Ginecologia e Obstetrícia",
  },
  pendientes: {
    horarios: true,
    precios: true,
    fotografias: true,
    registroProfesional: true,
    formacion: true,
    coordenadas: true,
  },
};

export function clinicaSlugDesdeEntorno(): string {
  return process.env.NEXT_PUBLIC_CLINICA_SLUG?.trim() || CLINICA_VELARDE.slug;
}

export function urlSitio(): string {
  const valor = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (valor) return valor.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
