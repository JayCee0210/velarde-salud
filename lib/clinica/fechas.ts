const OFFSET_POR_DEFECTO = -240;

export function offsetMinutos(fecha: Date, zona: string): number {
  try {
    const partes = new Intl.DateTimeFormat("en-US", {
      timeZone: zona,
      timeZoneName: "longOffset",
    }).formatToParts(fecha);
    const valor = partes.find((parte) => parte.type === "timeZoneName")?.value ?? "";
    const coincidencia = valor.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!coincidencia) return OFFSET_POR_DEFECTO;
    const signo = coincidencia[1] === "-" ? -1 : 1;
    return signo * (Number(coincidencia[2]) * 60 + Number(coincidencia[3]));
  } catch {
    return OFFSET_POR_DEFECTO;
  }
}

export function fechaHoraZonaAIso(fecha: string, hora: string, zona: string): string {
  const base = new Date(`${fecha}T${hora}:00Z`);
  const offset = offsetMinutos(base, zona);
  return new Date(base.getTime() - offset * 60_000).toISOString();
}

export function minutosAHora(minutos: number): string {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function horaAMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

export function diaSemana(fecha: string): number {
  return new Date(`${fecha}T12:00:00Z`).getUTCDay();
}

export type FranjaHoraria = { inicio: string; fin: string };

export function solapamientos(
  inicioA: string,
  finA: string,
  inicioB: string,
  finB: string,
): boolean {
  return new Date(inicioA) < new Date(finB) && new Date(inicioB) < new Date(finA);
}

export function edadGestacional(fum: string, fecha: string): { semanas: number; dias: number } | null {
  const inicio = new Date(`${fum}T12:00:00Z`);
  const fin = new Date(`${fecha}T12:00:00Z`);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fin.getTime())) return null;
  const dias = Math.floor((fin.getTime() - inicio.getTime()) / 86_400_000);
  if (dias < 0) return null;
  return { semanas: Math.floor(dias / 7), dias: dias % 7 };
}

export function edadEnAnios(fechaNacimiento: string, hoy = new Date()): number | null {
  const nacimiento = new Date(`${fechaNacimiento}T12:00:00Z`);
  if (Number.isNaN(nacimiento.getTime())) return null;
  let edad = hoy.getUTCFullYear() - nacimiento.getUTCFullYear();
  const mes = hoy.getUTCMonth() - nacimiento.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoy.getUTCDate() < nacimiento.getUTCDate())) edad -= 1;
  return edad >= 0 && edad < 130 ? edad : null;
}
