import Link from "next/link";
import { ArrowLeft, ClipboardPlus } from "lucide-react";
import { requerirPermiso } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import { normalizarLocale } from "@/lib/i18n";
import { Tarjeta } from "@/components/ui/base";
import { crearClienteAdminDatos } from "@/lib/supabase/admin";
import { BuscadorNuevaConsulta } from "@/components/panel/buscador-nueva-consulta";

export const instant = false;
export const metadata = { title: "Nueva consulta", robots: { index: false, follow: false } };

export default async function NuevaConsulta({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ q?: string }> }) {
  const { lang } = await params;
  const locale = normalizarLocale(lang);
  await requerirPermiso(locale, PERMISOS.clinicoEscribir);
  const { q = "" } = await searchParams;
  const termino = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().slice(0, 80);
  let pacientes: Array<{ id: string; first_name: string; last_name: string; phone: string | null; whatsapp_phone: string | null }> = [];
  if (termino.length >= 2) {
    const admin = crearClienteAdminDatos();
    const primero = termino.split(/\s+/)[0]?.replace(/[,%()]/g, " ") ?? termino;
    const { data } = await admin.from("patients").select("id, first_name, last_name, phone, whatsapp_phone").eq("status", "active").or(`first_name.ilike.%${primero}%,last_name.ilike.%${primero}%,phone.ilike.%${primero}%,whatsapp_phone.ilike.%${primero}%`).order("last_name", { ascending: true }).limit(50);
    const palabras = termino.split(/\s+/).filter(Boolean);
    pacientes = (data ?? []).filter((paciente) => { const nombre = `${paciente.first_name} ${paciente.last_name}`.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); const telefono = `${paciente.phone ?? ""} ${paciente.whatsapp_phone ?? ""}`.replace(/\D/g, ""); return palabras.every((palabra) => nombre.includes(palabra) || telefono.includes(palabra.replace(/\D/g, ""))); });
  }
  return <div className="mx-auto max-w-2xl space-y-5"><Link href={`/${locale}/panel`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-turquesa-700"><ArrowLeft className="h-4 w-4" aria-hidden /> Volver al inicio</Link><header><p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-700">Atención médica</p><h1 className="mt-1 font-display text-3xl text-petroleo-900">Nueva consulta</h1><p className="mt-2 text-sm leading-relaxed text-tinta-suave">Busca al paciente mientras escribes y continúa desde su historia clínica.</p></header><Tarjeta><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-turquesa-100 text-petroleo-800"><ClipboardPlus className="h-5 w-5" aria-hidden /></span><div><h2 className="font-display text-xl text-petroleo-900">Seleccionar paciente</h2><p className="text-sm text-tinta-suave">Las coincidencias aparecen automáticamente.</p></div></div><div className="mt-5"><BuscadorNuevaConsulta locale={locale} /></div><details className="mt-4 rounded-xl border border-borde bg-arena-50 p-3"><summary className="cursor-pointer text-sm font-semibold text-petroleo-900">Usar búsqueda manual</summary><form method="get" className="mt-3 flex gap-2"><input name="q" defaultValue={q} className="min-h-11 flex-1 rounded-xl border border-borde bg-white px-3 text-sm" placeholder="Nombre o WhatsApp" /><button type="submit" className="min-h-11 rounded-xl bg-petroleo-800 px-4 text-sm font-semibold text-white">Buscar</button></form>{termino.length >= 2 && <div className="mt-3">{pacientes.length ? <div className="divide-y divide-borde overflow-hidden rounded-xl border border-borde">{pacientes.map((paciente) => <Link key={paciente.id} href={`/${locale}/panel/pacientes?paciente=${encodeURIComponent(paciente.id)}`} className="flex min-h-14 items-center justify-between gap-3 bg-white px-3 py-2"><span><strong className="block text-sm text-petroleo-900">{paciente.first_name} {paciente.last_name}</strong><span className="text-xs text-tinta-suave">{paciente.whatsapp_phone ?? paciente.phone ?? "Sin WhatsApp"}</span></span><span className="text-xs font-semibold text-turquesa-700">Abrir</span></Link>)}</div> : <p className="text-sm text-tinta-suave">No encontramos pacientes.</p>}</div>}</details><Link href={`/${locale}/panel/pacientes/nuevo`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-turquesa-700">Registrar un paciente nuevo</Link></Tarjeta></div>;
}
