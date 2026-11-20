type Registro = { cantidad: number; reinicio: number };

const registros = new Map<string, Registro>();

export function limitar(
  clave: string,
  maximo = 8,
  ventanaMs = 60_000,
): { permitido: boolean; restante: number } {
  const ahora = Date.now();
  const actual = registros.get(clave);
  if (!actual || actual.reinicio <= ahora) {
    registros.set(clave, { cantidad: 1, reinicio: ahora + ventanaMs });
    return { permitido: true, restante: maximo - 1 };
  }
  if (actual.cantidad >= maximo) return { permitido: false, restante: 0 };
  actual.cantidad += 1;
  return { permitido: true, restante: maximo - actual.cantidad };
}

export function ipDeCabeceras(cabeceras: Headers): string {
  const reenviada = cabeceras.get("x-forwarded-for");
  if (reenviada) return reenviada.split(",")[0]?.trim() || "desconocida";
  return cabeceras.get("x-real-ip") ?? "desconocida";
}
