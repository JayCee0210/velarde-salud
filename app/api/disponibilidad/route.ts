import { NextResponse } from "next/server";
import { z } from "zod";
import { obtenerDisponibilidad } from "@/lib/datos/agenda";
import { CLINICA_VELARDE } from "@/lib/clinica/config";
import { ipDeCabeceras, limitar } from "@/lib/seguridad/limite";

const esquema = z.object({
  servicioSlug: z.string().trim().min(1).max(80),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function POST(request: Request) {
  const ip = ipDeCabeceras(request.headers);
  if (!limitar(`disponibilidad:${ip}`, 30, 60_000).permitido) {
    return NextResponse.json({ error: "Demasiadas solicitudes." }, { status: 429 });
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const resultado = esquema.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  }

  const disponibilidad = await obtenerDisponibilidad(
    resultado.data.servicioSlug,
    resultado.data.fecha,
  );

  return NextResponse.json(
    {
      ...disponibilidad,
      whatsapp: CLINICA_VELARDE.whatsapp,
      zonaHoraria: CLINICA_VELARDE.zonaHoraria,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
