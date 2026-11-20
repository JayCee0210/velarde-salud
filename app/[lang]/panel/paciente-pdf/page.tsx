import Link from "next/link";
import { ArrowLeft, AlertTriangle, Stethoscope, Pill, HeartPulse, User } from "lucide-react";
import { connection } from "next/server";
import { normalizarLocale } from "@/lib/i18n";
import { requerirPermiso } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import { crearClienteDatos } from "@/lib/supabase/datos";
import { EstadoVacio } from "@/components/ui/base";
import { BotonImprimir } from "@/components/panel/boton-imprimir";

export const instant = false;
export const metadata = { title: "Informe y ficha del paciente", robots: { index: false, follow: false } };

type ItemPrescripcion = {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string | null;
  route?: string | null;
  notes?: string | null;
};

type Prescripcion = {
  id: string;
  status: string;
  clinical_instructions?: string | null;
  created_at: string;
  clinical_prescription_items?: ItemPrescripcion[] | null;
};

type Consulta = {
  id: string;
  encounter_date?: string | null;
  consultation_type?: string | null;
  status?: string | null;
  created_at?: string;
};

type Nota = {
  id: string;
  encounter_id?: string | null;
  chief_complaint?: string | null;
  clinical_assessment?: string | null;
  treatment_plan?: string | null;
  status?: string | null;
  created_at?: string;
};

type Embarazo = {
  id: string;
  last_menstrual_period?: string | null;
  estimated_due_date?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string;
};

export default async function PacientePdf({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ id?: string }> }) {
  await connection();
  const { lang } = await params;
  const locale = normalizarLocale(lang);
  const { id } = await searchParams;
  const sesion = await requerirPermiso(locale, PERMISOS.pacientesLeer);
  if (!id) return <EstadoVacio titulo="No se indicó un paciente." />;

  const supabase = await crearClienteDatos();
  const [pacienteRes, resumenRes, consultasRes, notasRes, recetasRes, embarazosRes] = await Promise.all([
    supabase.from("patients").select("id, patient_code, first_name, last_name, date_of_birth, phone, whatsapp_phone, email, emergency_contact_name, emergency_contact_phone, preferred_locale, created_at").eq("id", id).maybeSingle(),
    supabase.from("patient_clinical_summaries").select("id, blood_type, allergies_summary, chronic_conditions_summary, surgical_history_summary, gynecological_obstetric_baseline, current_medications_summary, created_at").eq("patient_id", id).eq("is_current", true).maybeSingle(),
    supabase.from("clinical_encounters").select("id, encounter_date, consultation_type, status, created_at").eq("patient_id", id).order("encounter_date", { ascending: false }).limit(20),
    supabase.from("clinical_notes").select("id, encounter_id, chief_complaint, clinical_assessment, treatment_plan, status, created_at").eq("patient_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("clinical_prescriptions").select("id, status, clinical_instructions, created_at, clinical_prescription_items(medication_name, dosage, frequency, duration, route, notes)").eq("patient_id", id).order("created_at", { ascending: false }).limit(20),
    supabase.from("pregnancy_episodes").select("id, last_menstrual_period, estimated_due_date, status, notes, created_at").eq("patient_id", id).order("created_at", { ascending: false }).limit(5),
  ]);

  const paciente = pacienteRes.data;
  if (!paciente) return <EstadoVacio titulo="Paciente no encontrado o no autorizado." />;

  const resumen = resumenRes.data;
  const consultas = (consultasRes.data ?? []) as Consulta[];
  const notas = (notasRes.data ?? []) as Nota[];
  const recetas = (recetasRes.data ?? []) as Prescripcion[];
  const embarazos = (embarazosRes.data ?? []) as Embarazo[];

  const formateadorFecha = new Intl.DateTimeFormat("es-BO", { dateStyle: "long", timeZone: "America/La_Paz" });
  const fechaHoy = formateadorFecha.format(new Date());

  const edadEstimada = paciente.date_of_birth
    ? `${new Date().getUTCFullYear() - Number(String(paciente.date_of_birth).slice(0, 4))} años`
    : "—";

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-10">
      <div className="mb-6 flex items-center justify-between gap-3 print:hidden">
        <Link
          href={`/${locale}/panel/pacientes?paciente=${encodeURIComponent(id)}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-turquesa-700 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Volver al paciente
        </Link>
        <BotonImprimir />
      </div>

      <article className="rounded-2xl border border-borde bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none sm:p-8">
        {/* Cabecera institucional */}
        <header className="border-b-2 border-petroleo-800 pb-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-turquesa-700">Centro Médico Especializado VELARDE</p>
              <h1 className="mt-2 font-display text-2xl text-petroleo-900 sm:text-3xl">Informe Clínico del Paciente</h1>
              <p className="mt-1 text-xs text-tinta-suave">Expediente Asistencial Confidencial · VELARDE DIGITAL</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs text-tinta-suave">Fecha de emisión:</p>
              <p className="text-sm font-semibold text-petroleo-900">{fechaHoy}</p>
              <p className="text-xs text-tinta-suave">Emitido por: {sesion.nombre}</p>
            </div>
          </div>
        </header>

        {/* Datos personales / de filiación */}
        <section className="py-5 border-b border-borde">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-turquesa-700">
            <User className="h-4 w-4" aria-hidden /> Datos del Paciente
          </h2>
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-tinta-suave">Nombre completo</p>
              <p className="font-semibold text-petroleo-900">{paciente.first_name} {paciente.last_name}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Código de paciente</p>
              <p className="font-semibold text-petroleo-900">{paciente.patient_code}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Edad de referencia</p>
              <p className="font-semibold text-petroleo-900">{edadEstimada}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">WhatsApp / Teléfono</p>
              <p className="font-semibold text-petroleo-900">{paciente.whatsapp_phone ?? paciente.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Correo electrónico</p>
              <p className="text-petroleo-900">{paciente.email ?? "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Contacto de emergencia</p>
              <p className="text-petroleo-900">
                {paciente.emergency_contact_name
                  ? `${paciente.emergency_contact_name} (${paciente.emergency_contact_phone ?? "—"})`
                  : "No registrado"}
              </p>
            </div>
          </div>
        </section>

        {/* Resumen clínico y antecedentes */}
        <section className="py-5 border-b border-borde">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-turquesa-700">
            <Stethoscope className="h-4 w-4" aria-hidden /> Resumen Clínico y Antecedentes
          </h2>
          {resumen?.allergies_summary && (
            <div className="mt-3 rounded-xl border border-peligro/30 bg-peligro-suave/30 p-3 text-sm">
              <p className="flex items-center gap-1.5 font-bold text-peligro">
                <AlertTriangle className="h-4 w-4" aria-hidden /> Alergias reportadas:
              </p>
              <p className="mt-1 text-petroleo-900">{resumen.allergies_summary}</p>
            </div>
          )}
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-tinta-suave">Grupo sanguíneo</p>
              <p className="font-semibold text-petroleo-900">{resumen?.blood_type || "No registrado"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Condiciones crónicas</p>
              <p className="text-petroleo-900">{resumen?.chronic_conditions_summary || "Sin condiciones reportadas"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Antecedentes quirúrgicos</p>
              <p className="text-petroleo-900">{resumen?.surgical_history_summary || "Sin cirugías reportadas"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-tinta-suave">Medicación habitual</p>
              <p className="text-petroleo-900">{resumen?.current_medications_summary || "Ninguna registrada"}</p>
            </div>
          </div>
        </section>

        {/* Historial de atenciones clínicas */}
        <section className="py-5 border-b border-borde">
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-turquesa-700">
            <Stethoscope className="h-4 w-4" aria-hidden /> Atenciones y Consultas Clínicas ({consultas.length})
          </h2>
          {consultas.length === 0 ? (
            <p className="mt-3 text-sm text-tinta-suave">No hay consultas registradas para este paciente.</p>
          ) : (
            <div className="mt-4 space-y-4">
              {consultas.map((consulta, index) => {
                const notaAsociada = notas.find((n) => n.encounter_id === consulta.id) || (index === 0 ? notas[0] : null);
                const fechaStr = consulta.encounter_date || consulta.created_at;
                return (
                  <div key={consulta.id} className="break-inside-avoid rounded-xl border border-borde p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-borde pb-2">
                      <span className="font-bold text-petroleo-900 capitalize">
                        {consulta.consultation_type ? String(consulta.consultation_type).replace(/_/g, " ") : "Atención general"}
                      </span>
                      <span className="text-xs text-tinta-suave">
                        {fechaStr ? formateadorFecha.format(new Date(fechaStr)) : "—"}
                      </span>
                    </div>
                    {notaAsociada?.chief_complaint && (
                      <div className="mt-2 text-sm">
                        <strong className="text-xs uppercase tracking-wide text-tinta-suave">Motivo de consulta:</strong>
                        <p className="mt-0.5 text-petroleo-900 whitespace-pre-line">{notaAsociada.chief_complaint}</p>
                      </div>
                    )}
                    {notaAsociada?.clinical_assessment && (
                      <div className="mt-2 text-sm">
                        <strong className="text-xs uppercase tracking-wide text-tinta-suave">Evaluación clínica y hallazgos:</strong>
                        <p className="mt-0.5 text-petroleo-900 whitespace-pre-line">{notaAsociada.clinical_assessment}</p>
                      </div>
                    )}
                    {notaAsociada?.treatment_plan && (
                      <div className="mt-2 text-sm">
                        <strong className="text-xs uppercase tracking-wide text-tinta-suave">Plan e indicaciones:</strong>
                        <p className="mt-0.5 text-petroleo-900 whitespace-pre-line">{notaAsociada.treatment_plan}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Prescripciones y recetas médicas */}
        {recetas.length > 0 && (
          <section className="py-5 border-b border-borde">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-turquesa-700">
              <Pill className="h-4 w-4" aria-hidden /> Prescripciones y Recetas Médicas ({recetas.length})
            </h2>
            <div className="mt-3 space-y-3">
              {recetas.map((receta, idx) => (
                <div key={receta.id} className="break-inside-avoid rounded-xl border border-borde bg-arena-50/40 p-3 text-sm">
                  <div className="flex items-center justify-between border-b border-borde/70 pb-1.5 text-xs text-tinta-suave">
                    <span>Receta #{idx + 1}</span>
                    <span>{receta.created_at ? formateadorFecha.format(new Date(receta.created_at)) : "—"}</span>
                  </div>
                  {receta.clinical_prescription_items && receta.clinical_prescription_items.length > 0 ? (
                    <div className="mt-2 space-y-1.5">
                      {receta.clinical_prescription_items.map((item, i) => (
                        <div key={`${item.medication_name}-${i}`} className="text-xs">
                          <p className="font-semibold text-petroleo-900">{i + 1}. {item.medication_name}</p>
                          <p className="text-tinta-suave">
                            {item.dosage} · {item.frequency}
                            {item.duration ? ` · por ${item.duration}` : ""}
                            {item.route ? ` · vía ${item.route}` : ""}
                          </p>
                          {item.notes && <p className="italic text-tinta-suave">{item.notes}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-tinta-suave">{receta.clinical_instructions || "Sin ítems detallados"}</p>
                  )}
                  {receta.clinical_instructions && (
                    <p className="mt-2 border-t border-borde/50 pt-1.5 text-xs text-petroleo-900">
                      <strong>Indicaciones:</strong> {receta.clinical_instructions}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Controles obstétricos si existen */}
        {embarazos.length > 0 && (
          <section className="py-5 border-b border-borde">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-turquesa-700">
              <HeartPulse className="h-4 w-4" aria-hidden /> Registro Obstétrico y Controles
            </h2>
            <div className="mt-3 space-y-3">
              {embarazos.map((emb) => (
                <div key={emb.id} className="rounded-xl border border-borde p-3 text-sm">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase text-tinta-suave">FPP (Fecha probable de parto)</p>
                      <p className="font-semibold text-petroleo-900">{emb.estimated_due_date || "Por determinar"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-tinta-suave">FUM (Fecha última menstruación)</p>
                      <p className="text-petroleo-900">{emb.last_menstrual_period || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase text-tinta-suave">Estado</p>
                      <p className="font-semibold text-petroleo-900">{emb.status === "active" ? "Activo" : emb.status}</p>
                    </div>
                  </div>
                  {emb.notes && <p className="mt-2 text-xs text-tinta-suave border-t border-borde pt-1.5">{emb.notes}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pie de página con firma y sello */}
        <footer className="mt-12 break-inside-avoid">
          <div className="grid gap-8 border-t border-borde pt-6 text-center text-sm sm:grid-cols-2">
            <div>
              <div className="mx-auto h-16 max-w-56 border-b border-petroleo-900" />
              <p className="mt-2 font-semibold text-petroleo-900">Firma del profesional tratante</p>
              <p className="text-xs text-tinta-suave">{sesion.nombre}</p>
            </div>
            <div>
              <div className="mx-auto h-16 max-w-56 border-b border-petroleo-900" />
              <p className="mt-2 font-semibold text-petroleo-900">Sello del centro médico</p>
              <p className="text-xs text-tinta-suave">{sesion.clinicaNombre}</p>
            </div>
          </div>
          <p className="mt-8 text-center text-xs text-tinta-suave">
            Este documento constituye un informe clínico confidencial expedido por Centro Médico Especializado VELARDE conforme a las normas éticas y de salud vigentes. Toda reproducción no autorizada queda prohibida.
          </p>
        </footer>
      </article>
    </main>
  );
}
