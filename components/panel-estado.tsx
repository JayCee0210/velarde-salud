// Panel de estado de conexión con Supabase (componente de servidor).
import type { ReactNode } from "react";
import {
  obtenerEstadoConexion,
  type EstadoTabla,
  type ResultadoTabla,
} from "@/lib/clinica/estado";

const ETIQUETA_ESTADO: Record<EstadoTabla, { texto: string; clase: string }> = {
  ok: { texto: "OK", clase: "bg-emerald-100 text-emerald-800" },
  ausente: { texto: "Sin tablas", clase: "bg-amber-100 text-amber-800" },
  sin_permiso: { texto: "RLS activa", clase: "bg-sky-100 text-sky-800" },
  sin_configurar: { texto: "Sin configurar", clase: "bg-zinc-100 text-zinc-700" },
  error: { texto: "Error", clase: "bg-red-100 text-red-800" },
};

function Tarjeta({
  titulo,
  resultado,
  children,
}: {
  titulo: string;
  resultado: ResultadoTabla;
  children?: ReactNode;
}) {
  const etiqueta = ETIQUETA_ESTADO[resultado.estado];
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          {titulo}
        </h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${etiqueta.clase}`}
        >
          {etiqueta.texto}
        </span>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{resultado.detalle}</p>
      {children}
    </section>
  );
}

export async function PanelEstado() {
  const estado = await obtenerEstadoConexion();

  return (
    <div className="flex flex-col gap-5">
      {/* Encabezado del centro médico */}
      <div className="rounded-xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-900 dark:bg-teal-950/40">
        <p className="text-xs font-medium uppercase tracking-wide text-teal-700 dark:text-teal-300">
          Centro Médico Especializado VELARDE
        </p>
        <h1 className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          VELARDE DIGITAL
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Dr. Marco Antonio Velarde Melgar · Guayaramerín, Bolivia
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            "Ginecología",
            "Obstetricia",
            "Prenatal",
            "Ecografías",
            "Medicina General",
            "Laboratorios",
          ].map((area) => (
            <span
              key={area}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-teal-800 ring-1 ring-teal-200 dark:bg-zinc-900 dark:text-teal-200 dark:ring-teal-800"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      {/* Estado de la conexión */}
      <div className="grid gap-4 sm:grid-cols-2">
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Variables de entorno (.env.local)
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                estado.configurado
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {estado.configurado ? "Configurada" : "Pendiente"}
            </span>
          </div>
          {estado.configurado ? (
            <ul className="space-y-1 text-sm text-zinc-500 dark:text-zinc-400">
              <li>
                URL: <code className="font-mono text-xs">{estado.url}</code>
              </li>
              <li>
                Clave pública (anon):{" "}
                <code className="font-mono text-xs">{estado.anonEnmascarada}</code>
              </li>
              <li className="text-emerald-700 dark:text-emerald-400">
                La clave service_role permanece solo en el servidor.
              </li>
            </ul>
          ) : (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {estado.motivo} Copia <code className="font-mono text-xs">.env.example</code> a{" "}
              <code className="font-mono text-xs">.env.local</code> y pega tus valores reales
              de Supabase (Settings → API).
            </p>
          )}
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-2 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
              Conexión con Supabase
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                estado.red.ok
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {estado.configurado ? (estado.red.ok ? "Conectado" : "Sin conexión") : "N/A"}
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{estado.red.detalle}</p>
        </section>
      </div>

      {/* Esquema */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Tarjeta titulo="Tabla: especialidades (esquema)" resultado={estado.especialidades}>
          {estado.especialidades.estado === "ok" &&
            estado.especialidades.datos.length > 0 && (
              <ul className="mt-3 divide-y divide-zinc-100 dark:divide-zinc-800">
                {estado.especialidades.datos.map((area) => (
                  <li
                    key={area.id}
                    className="flex items-start justify-between gap-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                        {area.nombre}
                      </p>
                      {area.descripcion && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {area.descripcion}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        area.activa
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {area.activa ? "Activa" : "Inactiva"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </Tarjeta>

        <div className="flex flex-col gap-4">
          <Tarjeta titulo="Tabla: servicios (esquema)" resultado={estado.servicios} />
          <Tarjeta
            titulo="RLS: pacientes (acceso anónimo)"
            resultado={estado.pacientesRls}
          />
        </div>
      </div>

      <p className="text-right text-xs text-zinc-400 dark:text-zinc-500">
        Verificado: {estado.verificadoEn} (hora de Bolivia)
      </p>
    </div>
  );
}
