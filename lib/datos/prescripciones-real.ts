import "server-only";

import { crearClienteDatos } from "@/lib/supabase/datos";
import { requerirPermiso } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";

export async function obtenerPrescripcionParaImpresion(locale: string, id: string) {
  const sesion = await requerirPermiso(locale, PERMISOS.prescripcionesGestionar);
  const supabase = await crearClienteDatos();
  const { data } = await supabase.from("clinical_prescriptions").select("id, status, clinical_instructions, signed_at, created_at, patients(first_name,last_name,patient_code,date_of_birth), medical_professionals(full_name,primary_specialty), clinical_prescription_items(medication_name,dosage,frequency,duration,route,notes,display_order)").eq("id", id).maybeSingle();
  return { receta: data, sesion };
}
