"use server";

import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { sesionParaAccion, puede } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";

export type PacienteBusqueda = { id: string; nombre: string; whatsapp: string | null };

export async function buscarPacientesRapido(valor: string): Promise<PacienteBusqueda[]> {
  const sesion = await sesionParaAccion();
  if (!puede(sesion, PERMISOS.pacientesLeer)) return [];
  const query = valor.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().slice(0, 80);
  if (query.length < 2) return [];
  const admin = crearClienteAdminDatos();
  const primero = query.split(/\s+/)[0]?.replace(/[,%()]/g, " ") ?? query;
  const { data } = await admin.from("patients").select("id, first_name, last_name, phone, whatsapp_phone").eq("status", "active").or(`first_name.ilike.%${primero}%,last_name.ilike.%${primero}%,phone.ilike.%${primero}%,whatsapp_phone.ilike.%${primero}%`).order("last_name", { ascending: true }).limit(50);
  const palabras = query.split(/\s+/).filter(Boolean);
  return (data ?? []).filter((paciente) => {
    const nombre = `${paciente.first_name} ${paciente.last_name}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const telefono = `${paciente.phone ?? ""} ${paciente.whatsapp_phone ?? ""}`.replace(/\D/g, "");
    return palabras.every((palabra) => nombre.includes(palabra) || telefono.includes(palabra.replace(/\D/g, "")));
  }).slice(0, 8).map((paciente) => ({ id: paciente.id, nombre: `${paciente.first_name} ${paciente.last_name}`, whatsapp: paciente.whatsapp_phone ?? paciente.phone }));
}
