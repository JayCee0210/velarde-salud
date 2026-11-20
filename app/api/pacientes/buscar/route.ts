import { NextResponse } from "next/server";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { sesionParaAccion, puede } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q")?.trim().slice(0, 80) ?? "";
    if (query.length < 2) return NextResponse.json({ pacientes: [] });
    const sesion = await sesionParaAccion();
    if (!puede(sesion, PERMISOS.pacientesLeer)) return NextResponse.json({ pacientes: [] }, { status: 403 });
    const admin = crearClienteAdminDatos();
    const termino = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[,%()]/g, " ").trim().split(/\s+/)[0] ?? "";
    const { data, error } = await admin.from("patients").select("id, first_name, last_name, phone, whatsapp_phone").eq("status", "active").or(`first_name.ilike.%${termino}%,last_name.ilike.%${termino}%,phone.ilike.%${termino}%,whatsapp_phone.ilike.%${termino}%`).order("last_name", { ascending: true }).limit(50);
    if (error) return NextResponse.json({ pacientes: [] }, { status: 500 });
    const palabras = query.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().split(/\s+/).filter(Boolean);
    const pacientes = (data ?? []).filter((paciente) => {
      const nombre = `${paciente.first_name} ${paciente.last_name}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      const telefono = `${paciente.phone ?? ""} ${paciente.whatsapp_phone ?? ""}`.replace(/\D/g, "");
      return palabras.every((palabra) => nombre.includes(palabra) || telefono.includes(palabra.replace(/\D/g, "")));
    });
    return NextResponse.json({ pacientes: pacientes.slice(0, 8).map((paciente) => ({ id: paciente.id, nombre: `${paciente.first_name} ${paciente.last_name}`, whatsapp: paciente.whatsapp_phone ?? paciente.phone })) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ pacientes: [] }, { status: 401 });
  }
}
