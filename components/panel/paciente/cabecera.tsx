import Link from "next/link";
import { AlertTriangle, Baby, CalendarPlus, Phone, Pill, Printer } from "lucide-react";
import { Insignia } from "@/components/ui/base";
import { edadEnAnios } from "@/lib/clinica/fechas";

type Resumen = {
  allergies_summary?: string | null;
  current_medications_summary?: string | null;
};

export function CabeceraPaciente({
  base,
  paciente,
  resumen,
  embarazoActivo,
}: {
  base: string;
  paciente: { id: string; nombre_completo: string; fecha_nacimiento: string | null; sexo: string | null; telefono: string | null };
  resumen: Resumen | null;
  embarazoActivo: boolean;
  atencionInicial?: boolean;
}) {
  const edad = paciente.fecha_nacimiento ? edadEnAnios(paciente.fecha_nacimiento) : null;

  return (
    <header className="sticky top-16 z-10 -mx-4 border-b border-borde bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:-mx-6 sm:px-6 lg:top-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-turquesa-700">Paciente activo</p>
          <h1 className="truncate font-display text-2xl text-petroleo-900">{paciente.nombre_completo}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-tinta-suave">
            {edad !== null && <span>{edad} años</span>}
            {paciente.sexo && <span>· {paciente.sexo}</span>}
            {paciente.telefono && (
              <a className="inline-flex items-center gap-1 text-turquesa-700 hover:underline" href={`tel:${paciente.telefono}`}>
                <Phone className="h-3.5 w-3.5" aria-hidden /> {paciente.telefono}
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`${base}/paciente-pdf?id=${encodeURIComponent(paciente.id)}`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-borde bg-white px-3.5 text-sm font-semibold text-petroleo-900 shadow-sm transition-colors hover:bg-arena-50"
            title="Ver e imprimir informe clínico completo del paciente"
          >
            <Printer className="h-4 w-4 text-turquesa-700" aria-hidden />
            Reporte / Ficha
          </a>

          <Link
            href={`${base}/pacientes?paciente=${encodeURIComponent(paciente.id)}&vista=nueva`}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-petroleo-800 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-petroleo-700"
          >
            <CalendarPlus className="h-4 w-4" aria-hidden />
            Nueva consulta
          </Link>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {resumen?.allergies_summary && (
          <Insignia tono="peligro">
            <AlertTriangle className="mr-1 h-3.5 w-3.5" aria-hidden /> Alergias: {resumen.allergies_summary}
          </Insignia>
        )}
        {embarazoActivo && (
          <Insignia tono="info">
            <Baby className="mr-1 h-3.5 w-3.5" aria-hidden /> Embarazo activo
          </Insignia>
        )}
        {resumen?.current_medications_summary && (
          <Insignia tono="aviso">
            <Pill className="mr-1 h-3.5 w-3.5" aria-hidden /> Medicación registrada
          </Insignia>
        )}
      </div>
    </header>
  );
}
