// Lectura (solo servidor) de las variables de entorno de Supabase.
// Los valores reales viven en `.env.local` (nunca en Git).

export type EntornoSupabase = {
  url: string;
  anonKey: string;
  serviceRoleKey: string | null;
  configurado: boolean;
  motivo: string | null;
};

function esPlaceholder(valor: string | undefined, marcas: string[]): boolean {
  if (!valor) return true;
  return marcas.some((marca) => valor.includes(marca));
}

export function leerEntornoSupabase(): EntornoSupabase {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;

  let motivo: string | null = null;
  if (esPlaceholder(url, ["TU-PROYECTO", "tu-proyecto"])) {
    motivo = "Falta NEXT_PUBLIC_SUPABASE_URL (o sigue con el valor de ejemplo).";
  } else if (esPlaceholder(anonKey, ["tu-anon-key", "tu-service-role"])) {
    motivo = "Falta NEXT_PUBLIC_SUPABASE_ANON_KEY (o sigue con el valor de ejemplo).";
  } else if (!url.startsWith("http")) {
    motivo = "NEXT_PUBLIC_SUPABASE_URL no es una URL válida.";
  }

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
    serviceRoleKey,
    configurado: motivo === null,
    motivo,
  };
}

export function enmascararClave(clave: string): string {
  if (clave.length <= 12) return "••••";
  return `${clave.slice(0, 10)}…${clave.slice(-4)}`;
}
