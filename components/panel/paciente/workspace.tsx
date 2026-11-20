import Link from "next/link";
import { CheckCircle2, FileText, FlaskConical, HeartPulse, History, Pill, Printer, Stethoscope } from "lucide-react";
import { Tarjeta, EstadoVacio, Insignia } from "@/components/ui/base";
import { FormularioAtencionCompleta } from "@/components/panel/formulario-atencion-completa";
import { CabeceraPaciente } from "./cabecera";
import { PestanasPaciente, type VistaPaciente } from "./pestanas";

type Resumen = {
  allergies_summary?: string | null;
  chronic_conditions_summary?: string | null;
  surgical_history_summary?: string | null;
  current_medications_summary?: string | null;
};

type Contexto = {
  consultas: Array<Record<string, unknown>>;
  notas: Array<Record<string, unknown>>;
  embarazos: Array<Record<string, unknown>>;
  ordenes: Array<Record<string, unknown>>;
  documentos: Array<Record<string, unknown>>;
  resumen: Resumen | null;
  recetas?: Array<Record<string, unknown>>;
};

export function PatientWorkspace({
  locale,
  base,
  paciente,
  contexto,
  vista,
  atencionInicial,
  creado,
  recetaId,
}: {
  locale: string;
  base: string;
  paciente: { id: string; nombre_completo: string; fecha_nacimiento: string | null; sexo: string | null; telefono: string | null };
  contexto: Contexto;
  vista: VistaPaciente;
  atencionInicial?: boolean;
  creado?: boolean;
  recetaId?: string;
}) {
  const embarazoActivo = contexto.embarazos.some((embarazo) => embarazo.status === "active");
  const recetas = contexto.recetas ?? [];

  return (
    <div className="space-y-4">
      <CabeceraPaciente
        base={base}
        paciente={paciente}
        resumen={contexto.resumen}
        embarazoActivo={embarazoActivo}
        atencionInicial={atencionInicial}
      />

      {creado && (
        <div className="flex flex-col gap-3 rounded-2xl border border-exito/30 bg-exito-suave/40 p-4 sm:flex-row sm:items-center sm:justify-between" role="status">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-exito-suave text-exito">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold text-petroleo-900">Paciente y atención guardados correctamente</p>
              <p className="text-xs text-tinta-suave">
                La historia clínica, la primera evaluación y la prescripción médica han quedado unificadas en el expediente.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`${base}/paciente-pdf?id=${encodeURIComponent(paciente.id)}`}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-borde bg-white px-3 text-xs font-semibold text-petroleo-900 shadow-sm hover:bg-arena-50"
            >
              <Printer className="h-3.5 w-3.5 text-turquesa-700" aria-hidden />
              Imprimir reporte / ficha
            </a>
            {recetaId && (
              <a
                href={`${base}/receta?id=${encodeURIComponent(recetaId)}`}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-petroleo-800 px-3 text-xs font-semibold text-white shadow-sm hover:bg-petroleo-700"
              >
                <Pill className="h-3.5 w-3.5" aria-hidden />
                Ver receta médica
              </a>
            )}
          </div>
        </div>
      )}

      <PestanasPaciente base={base} pacienteId={paciente.id} activa={vista} />

      {vista === "nueva" && (
        <Tarjeta>
          <FormularioAtencionCompleta pacienteId={paciente.id} locale={locale} />
        </Tarjeta>
      )}
      {vista === "resumen" && <ResumenPaciente contexto={{ ...contexto, recetas }} />}
      {vista === "historial" && <ListaHistorial consultas={contexto.consultas} notas={contexto.notas} />}
      {vista === "embarazo" && (
        <ListaGenerica
          titulo="Embarazo y controles prenatales"
          icono={<HeartPulse />}
          filas={contexto.embarazos}
          vacio="No hay embarazos registrados."
          campo="estimated_due_date"
        />
      )}
      {vista === "laboratorio" && (
        <ListaGenerica
          titulo="Laboratorio"
          icono={<FlaskConical />}
          filas={contexto.ordenes}
          vacio="No hay órdenes de laboratorio."
          campo="status"
        />
      )}
      {vista === "recetas" && <ListaRecetas base={base} recetas={recetas} />}
      {vista === "documentos" && (
        <ListaGenerica
          titulo="Documentos"
          icono={<FileText />}
          filas={contexto.documentos}
          vacio="No hay documentos registrados."
          campo="file_name"
        />
      )}
    </div>
  );
}

function ResumenPaciente({ contexto }: { contexto: Contexto }) {
  const resumen = contexto.resumen;
  const campos: Array<[string, unknown]> = [
    ["Alergias", resumen?.allergies_summary],
    ["Condiciones crónicas", resumen?.chronic_conditions_summary],
    ["Antecedentes quirúrgicos", resumen?.surgical_history_summary],
    ["Medicaciones", resumen?.current_medications_summary],
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Tarjeta>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-turquesa-700" aria-hidden />
          <h2 className="font-display text-xl text-petroleo-900">Resumen clínico</h2>
        </div>
        {resumen ? (
          <dl className="mt-4 grid gap-3 text-sm">
            {campos.map(([label, valor]) => (
              <div key={label}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-tinta-suave">{label}</dt>
                <dd className="mt-1 text-petroleo-900">{String(valor || "No registrado")}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <EstadoVacio titulo="No hay resumen clínico" texto="Puedes completarlo durante una atención." />
        )}
      </Tarjeta>
      <Tarjeta>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-turquesa-700" aria-hidden />
          <h2 className="font-display text-xl text-petroleo-900">Actividad</h2>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Insignia tono="info">{contexto.consultas.length} atenciones</Insignia>
          <Insignia>{contexto.notas.length} notas</Insignia>
          <Insignia>{(contexto.recetas ?? []).length} recetas</Insignia>
          <Insignia>{contexto.embarazos.length} embarazos</Insignia>
          <Insignia>{contexto.ordenes.length} órdenes</Insignia>
          <Insignia>{contexto.documentos.length} documentos</Insignia>
        </div>
      </Tarjeta>
    </div>
  );
}

function ListaHistorial({
  consultas,
  notas,
}: {
  consultas: Array<Record<string, unknown>>;
  notas: Array<Record<string, unknown>>;
}) {
  return (
    <Tarjeta>
      <div className="flex items-center gap-2">
        <History className="h-5 w-5 text-turquesa-700" aria-hidden />
        <h2 className="font-display text-xl text-petroleo-900">Historial clínico ({consultas.length})</h2>
      </div>
      {consultas.length ? (
        <div className="mt-4 divide-y divide-borde">
          {consultas.map((consulta, idx) => {
            const nota =
              notas.find((n) => n.encounter_id === consulta.id) ||
              (idx === 0 && notas.length > 0 ? notas[0] : null);
            const fecha = String(consulta.encounter_date ?? consulta.created_at ?? "");
            return (
              <div key={String(consulta.id)} className="py-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-petroleo-900 capitalize">
                      {String(consulta.consultation_type ?? "Atención general").replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-tinta-suave">{fecha}</p>
                  </div>
                  <Insignia tono={consulta.status === "completed" ? "exito" : "aviso"}>
                    {consulta.status === "completed" ? "Finalizada" : "Registrada"}
                  </Insignia>
                </div>
                {nota && (
                  <div className="mt-2 space-y-1.5 rounded-xl border border-borde/70 bg-arena-50/50 p-3 text-xs">
                    {Boolean(nota.chief_complaint) && (
                      <p>
                        <strong className="text-tinta-suave">Motivo:</strong>{" "}
                        <span className="text-petroleo-900">{String(nota.chief_complaint)}</span>
                      </p>
                    )}
                    {Boolean(nota.clinical_assessment) && (
                      <p>
                        <strong className="text-tinta-suave">Evaluación:</strong>{" "}
                        <span className="text-petroleo-900">{String(nota.clinical_assessment)}</span>
                      </p>
                    )}
                    {Boolean(nota.treatment_plan) && (
                      <p>
                        <strong className="text-tinta-suave">Plan:</strong>{" "}
                        <span className="text-petroleo-900">{String(nota.treatment_plan)}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <EstadoVacio titulo="No hay atenciones registradas" texto="La primera atención aparecerá aquí." />
      )}
    </Tarjeta>
  );
}

function ListaRecetas({
  base,
  recetas,
}: {
  base: string;
  recetas: Array<Record<string, unknown>>;
}) {
  return (
    <Tarjeta>
      <div className="flex items-center gap-2">
        <Pill className="h-5 w-5 text-turquesa-700" aria-hidden />
        <h2 className="font-display text-xl text-petroleo-900">Recetas médicas ({recetas.length})</h2>
      </div>
      {recetas.length ? (
        <div className="mt-4 divide-y divide-borde">
          {recetas.map((receta) => {
            const items = (receta.clinical_prescription_items as Array<Record<string, unknown>> | undefined) ?? [];
            return (
              <div key={String(receta.id)} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-tinta-suave">{String(receta.created_at ?? "")}</p>
                    <Insignia tono={receta.status === "signed" ? "exito" : "info"}>
                      {receta.status === "signed" ? "Firmada" : "Borrador"}
                    </Insignia>
                  </div>
                  {items.length > 0 ? (
                    <div className="mt-2 space-y-1 text-sm">
                      {items.map((item, idx) => (
                        <p key={idx} className="font-medium text-petroleo-900">
                          {String(item.medication_name)} —{" "}
                          <span className="text-xs text-tinta-suave">
                            {String(item.dosage)} · {String(item.frequency)}
                          </span>
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-xs text-tinta-suave">
                      {String(receta.clinical_instructions || "Receta registrada")}
                    </p>
                  )}
                </div>
                <Link
                  href={`${base}/receta?id=${encodeURIComponent(String(receta.id))}`}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-borde bg-white px-3 text-xs font-semibold text-petroleo-900 shadow-sm hover:bg-arena-50"
                >
                  <Printer className="h-3.5 w-3.5 text-turquesa-700" aria-hidden />
                  Ver / Imprimir
                </Link>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-4">
          <EstadoVacio titulo="No hay recetas registradas" texto="Las prescripciones médicas aparecerán aquí." />
        </div>
      )}
    </Tarjeta>
  );
}

function ListaGenerica({
  titulo,
  icono,
  filas,
  vacio,
  campo,
}: {
  titulo: string;
  icono: React.ReactNode;
  filas: Array<Record<string, unknown>>;
  vacio: string;
  campo: string;
}) {
  return (
    <Tarjeta>
      <div className="flex items-center gap-2">
        <span className="text-turquesa-700">{icono}</span>
        <h2 className="font-display text-xl text-petroleo-900">{titulo}</h2>
      </div>
      {filas.length ? (
        <div className="mt-4 divide-y divide-borde">
          {filas.map((fila) => (
            <div key={String(fila.id)} className="py-3 text-sm text-petroleo-900">
              {String(fila[campo] ?? "Registro")}
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4">
          <EstadoVacio titulo={vacio} />
        </div>
      )}
    </Tarjeta>
  );
}
