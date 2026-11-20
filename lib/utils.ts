export function cn(...clases: Array<string | false | null | undefined>): string {
  return clases.filter(Boolean).join(" ");
}

const ZONA_BOLIVIA = "America/La_Paz";

export function formatearFecha(
  valor: string | Date | null | undefined,
  locale: string,
  opciones?: Intl.DateTimeFormatOptions,
): string {
  if (!valor) return "—";
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-BO", {
    timeZone: ZONA_BOLIVIA,
    dateStyle: "medium",
    ...opciones,
  }).format(fecha);
}

export function formatearHora(
  valor: string | Date | null | undefined,
  locale: string,
): string {
  if (!valor) return "—";
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-BO", {
    timeZone: ZONA_BOLIVIA,
    hour: "2-digit",
    minute: "2-digit",
  }).format(fecha);
}

export function formatearFechaHora(
  valor: string | Date | null | undefined,
  locale: string,
): string {
  if (!valor) return "—";
  const fecha = typeof valor === "string" ? new Date(valor) : valor;
  if (Number.isNaN(fecha.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "pt" ? "pt-BR" : "es-BO", {
    timeZone: ZONA_BOLIVIA,
    dateStyle: "medium",
    timeStyle: "short",
  }).format(fecha);
}

export function fechaISOEnBolivia(fecha = new Date()): string {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_BOLIVIA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(fecha);
  const obtener = (tipo: Intl.DateTimeFormatPartTypes) =>
    partes.find((parte) => parte.type === tipo)?.value ?? "";
  return `${obtener("year")}-${obtener("month")}-${obtener("day")}`;
}

export function calcularEdad(fechaNacimiento: string | null): number | null {
  if (!fechaNacimiento) return null;
  const nacimiento = new Date(`${fechaNacimiento}T12:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  const hoy = new Date();
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
  return edad >= 0 && edad < 130 ? edad : null;
}

export function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("");
}

export function telefonoWhatsApp(numero: string): string {
  return numero.replace(/[^\d]/g, "");
}

export function enlaceWhatsApp(numero: string, mensaje?: string): string {
  const base = `https://wa.me/${telefonoWhatsApp(numero)}`;
  return mensaje ? `${base}?text=${encodeURIComponent(mensaje)}` : base;
}

export function truncar(texto: string, maximo = 120): string {
  if (texto.length <= maximo) return texto;
  return `${texto.slice(0, maximo - 1).trimEnd()}…`;
}

export function sumarDias(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T12:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function slugValido(valor: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(valor);
}
