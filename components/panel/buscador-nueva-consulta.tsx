"use client";

import Link from "next/link";
import { Search, UserRound } from "lucide-react";
import { useRef, useState } from "react";
type PacienteBusqueda = { id: string; nombre: string; whatsapp: string | null };

export function BuscadorNuevaConsulta({ locale }: { locale: string }) {
  const [texto, setTexto] = useState("");
  const [resultados, setResultados] = useState<PacienteBusqueda[]>([]);
  const [cargando, setCargando] = useState(false);
  const temporizador = useRef<number | null>(null);
  function cambiarTexto(valor: string) {
    setTexto(valor);
    if (temporizador.current) window.clearTimeout(temporizador.current);
    if (valor.trim().length < 2) { setResultados([]); setCargando(false); return; }
    setCargando(true);
    temporizador.current = window.setTimeout(() => { void fetch(`/api/pacientes/buscar?q=${encodeURIComponent(valor)}`, { credentials: "same-origin", cache: "no-store" }).then((respuesta) => respuesta.ok ? respuesta.json() as Promise<{ pacientes?: PacienteBusqueda[] }> : Promise.reject(new Error("search"))).then((datos) => setResultados(datos.pacientes ?? [])).catch(() => setResultados([])).finally(() => setCargando(false)); }, 250);
  }
  const resultadosVisibles = texto.trim().length < 2 ? [] : resultados;
  return <div className="relative"><label htmlFor="buscar-paciente-consulta" className="sr-only">Buscar paciente</label><div className="flex items-center gap-3 rounded-2xl border-2 border-turquesa-300 bg-white px-4 py-3 shadow-sm focus-within:border-turquesa-600"><Search className="h-5 w-5 shrink-0 text-turquesa-700" aria-hidden /><input id="buscar-paciente-consulta" value={texto} onInput={(event) => cambiarTexto(event.currentTarget.value)} className="min-h-10 w-full bg-transparent text-base text-petroleo-900 outline-none placeholder:text-tinta-suave" placeholder="Escribe nombre o WhatsApp" autoComplete="off" autoCorrect="off" autoCapitalize="none" inputMode="search" /></div>{texto.trim().length > 0 && <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-borde bg-white shadow-xl" aria-live="polite">{cargando && <p className="px-4 py-3 text-sm text-tinta-suave">Buscando pacientes…</p>}{!cargando && resultadosVisibles.length === 0 && texto.trim().length >= 2 && <p className="px-4 py-3 text-sm text-tinta-suave">No encontramos coincidencias.</p>}{!cargando && resultadosVisibles.map((paciente) => <Link key={paciente.id} href={`/${locale}/panel/pacientes?paciente=${encodeURIComponent(paciente.id)}`} className="flex min-h-14 items-center gap-3 border-b border-borde px-4 py-3 last:border-0 hover:bg-arena-50"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-turquesa-100 text-petroleo-800"><UserRound className="h-4 w-4" aria-hidden /></span><span><strong className="block text-sm text-petroleo-900">{paciente.nombre}</strong><span className="text-xs text-tinta-suave">{paciente.whatsapp ?? "Sin WhatsApp"}</span></span></Link>)}</div>}</div>;
}
