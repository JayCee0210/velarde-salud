import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { connection } from "next/server";
import { normalizarLocale } from "@/lib/i18n";
import { obtenerPrescripcionParaImpresion } from "@/lib/datos/prescripciones-real";
import { BotonImprimir } from "@/components/panel/boton-imprimir";
import { EstadoVacio } from "@/components/ui/base";

export const instant = false;
export const metadata = { title: "Receta médica", robots: { index: false, follow: false } };

export default async function RecetaPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ id?: string }> }) {
  await connection();
  const { lang } = await params;
  const locale = normalizarLocale(lang);
  const { id } = await searchParams;
  if (!id) return <EstadoVacio titulo="No se indicó una receta." />;
  const { receta, sesion } = await obtenerPrescripcionParaImpresion(locale, id);
  if (!receta) return <EstadoVacio titulo="Receta no encontrada o no autorizada." />;
  const paciente = Array.isArray(receta.patients) ? receta.patients[0] : receta.patients;
  const profesional = Array.isArray(receta.medical_professionals) ? receta.medical_professionals[0] : receta.medical_professionals;
  const items = [...(receta.clinical_prescription_items ?? [])].sort((a, b) => Number(a.display_order ?? 0) - Number(b.display_order ?? 0));
  return <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10"><div className="mb-6 flex items-center justify-between gap-3 print:hidden"><Link href={`/${locale}/panel`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-turquesa-700"><ArrowLeft className="h-4 w-4" aria-hidden /> Volver al panel</Link><BotonImprimir /></div><article className="rounded-2xl border border-borde bg-white p-6 shadow-sm print:border-0 print:p-0 print:shadow-none"><header className="border-b-2 border-petroleo-800 pb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-turquesa-700">Centro Médico Especializado VELARDE</p><h1 className="mt-2 font-display text-3xl text-petroleo-900">Receta médica</h1><p className="mt-1 text-sm text-tinta-suave">{profesional?.full_name ?? sesion.nombre} · {profesional?.primary_specialty ?? "Ginecología y Obstetricia"}</p></header><section className="grid gap-3 border-b border-borde py-5 text-sm sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wide text-tinta-suave">Paciente</p><p className="font-semibold text-petroleo-900">{[paciente?.first_name, paciente?.last_name].filter(Boolean).join(" ")}</p></div><div><p className="text-xs uppercase tracking-wide text-tinta-suave">Código</p><p className="font-semibold text-petroleo-900">{paciente?.patient_code ?? "—"}</p></div><div><p className="text-xs uppercase tracking-wide text-tinta-suave">Fecha</p><p>{new Intl.DateTimeFormat("es-BO", { dateStyle: "long", timeZone: "America/La_Paz" }).format(new Date(receta.created_at))}</p></div><div><p className="text-xs uppercase tracking-wide text-tinta-suave">Estado</p><p className="font-semibold">{receta.status === "signed" ? "Firmada" : "Borrador"}</p></div></section><section className="py-6"><h2 className="text-lg font-semibold text-petroleo-900">Medicamentos</h2><div className="mt-4 space-y-4">{items.map((item, index) => <div key={`${item.medication_name}-${index}`} className="break-inside-avoid rounded-xl border border-borde p-4"><p className="font-semibold text-petroleo-900">{index + 1}. {item.medication_name}</p><p className="mt-2 text-sm"><strong>Dosis:</strong> {item.dosage} · <strong>Frecuencia:</strong> {item.frequency}</p>{item.duration && <p className="text-sm"><strong>Duración:</strong> {item.duration}</p>}{item.route && <p className="text-sm"><strong>Vía:</strong> {item.route}</p>}{item.notes && <p className="mt-2 text-sm text-tinta-suave">{item.notes}</p>}</div>)}</div></section>{receta.clinical_instructions && <section className="border-t border-borde py-5"><h2 className="text-sm font-semibold text-petroleo-900">Indicaciones generales</h2><p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{receta.clinical_instructions}</p></section>}<footer className="mt-12 grid gap-8 border-t border-borde pt-6 text-center text-sm sm:grid-cols-2"><div><div className="mx-auto h-16 max-w-56 border-b border-petroleo-900" /><p className="mt-2 font-semibold">Firma del profesional</p></div><div><div className="mx-auto h-16 max-w-56 border-b border-petroleo-900" /><p className="mt-2 font-semibold">Sello</p></div></footer><p className="mt-8 text-center text-xs text-tinta-suave">Documento generado desde VELARDE DIGITAL. Verifique el estado de la receta antes de dispensar.</p></article></main>;
}
