import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type VarianteBoton = "primario" | "secundario" | "fantasma" | "peligro" | "suave";
export type TamanoBoton = "sm" | "md" | "lg";

const VARIANTES: Record<VarianteBoton, string> = {
  primario:
    "bg-petroleo-800 text-white hover:bg-petroleo-700 active:bg-petroleo-900 shadow-sm",
  secundario:
    "border border-petroleo-700/25 bg-white text-petroleo-800 hover:bg-turquesa-100/60",
  fantasma: "text-petroleo-800 hover:bg-petroleo-800/5",
  peligro: "bg-peligro text-white hover:bg-red-800",
  suave: "bg-turquesa-100 text-petroleo-900 hover:bg-turquesa-300/60",
};

const TAMANOS: Record<TamanoBoton, string> = {
  sm: "min-h-9 px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "min-h-11 px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "min-h-12 px-5 py-3 text-base rounded-xl gap-2",
};

export function clasesBoton(variante: VarianteBoton = "primario", tamano: TamanoBoton = "md") {
  return cn(
    "inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTES[variante],
    TAMANOS[tamano],
  );
}

export function Boton({
  children,
  variante = "primario",
  tamano = "md",
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  tamano?: TamanoBoton;
}) {
  return (
    <button type={type} className={cn(clasesBoton(variante, tamano), className)} {...props}>
      {children}
    </button>
  );
}

export function Tarjeta({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-borde bg-superficie p-4 shadow-[0_1px_2px_rgba(6,47,55,0.04)] sm:p-5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function TituloSeccion({
  eyebrow,
  titulo,
  texto,
  centrado = false,
}: {
  eyebrow?: string;
  titulo: string;
  texto?: string;
  centrado?: boolean;
}) {
  return (
    <div className={cn("max-w-2xl", centrado && "mx-auto text-center")}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-turquesa-600">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl leading-tight text-petroleo-900 sm:text-4xl">{titulo}</h2>
      {texto && <p className="mt-3 text-base leading-relaxed text-tinta-suave">{texto}</p>}
    </div>
  );
}

export function Insignia({
  children,
  tono = "neutral",
}: {
  children: ReactNode;
  tono?: "neutral" | "exito" | "aviso" | "peligro" | "info";
}) {
  const tonos = {
    neutral: "bg-arena-100 text-petroleo-800",
    exito: "bg-exito-suave text-exito",
    aviso: "bg-aviso-suave text-aviso",
    peligro: "bg-peligro-suave text-peligro",
    info: "bg-turquesa-100 text-petroleo-800",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", tonos[tono])}>
      {children}
    </span>
  );
}

export function EstadoVacio({
  titulo,
  texto,
  accion,
  icono,
}: {
  titulo: string;
  texto?: string;
  accion?: ReactNode;
  icono?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-borde bg-white/60 px-5 py-10 text-center">
      {icono && <div className="mb-3 text-turquesa-600">{icono}</div>}
      <p className="font-semibold text-petroleo-900">{titulo}</p>
      {texto && <p className="mt-1 max-w-md text-sm text-tinta-suave">{texto}</p>}
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

export function Alerta({
  children,
  tono = "info",
  titulo,
}: {
  children: ReactNode;
  tono?: "info" | "exito" | "aviso" | "peligro";
  titulo?: string;
}) {
  const tonos = {
    info: "border-turquesa-300 bg-turquesa-100/50 text-petroleo-900",
    exito: "border-emerald-200 bg-exito-suave text-emerald-900",
    aviso: "border-amber-200 bg-aviso-suave text-amber-900",
    peligro: "border-red-200 bg-peligro-suave text-red-900",
  };
  return (
    <div className={cn("rounded-xl border p-3 text-sm leading-relaxed", tonos[tono])} role="status">
      {titulo && <p className="mb-1 font-semibold">{titulo}</p>}
      {children}
    </div>
  );
}

export const claseCampo =
  "min-h-11 w-full rounded-xl border border-borde bg-white px-3 py-2 text-base text-tinta placeholder:text-zinc-400 focus:border-turquesa-600 focus:outline-none focus:ring-2 focus:ring-turquesa-300/60";

export const claseEtiqueta = "mb-1.5 block text-sm font-medium text-petroleo-900";

export function Campo({
  etiqueta,
  ayuda,
  error,
  children,
  htmlFor,
  requerido,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string;
  children: ReactNode;
  htmlFor?: string;
  requerido?: boolean;
}) {
  return (
    <div>
      <label className={claseEtiqueta} htmlFor={htmlFor}>
        {etiqueta} {requerido && <span className="text-peligro">*</span>}
      </label>
      {children}
      {ayuda && !error && <p className="mt-1 text-xs text-tinta-suave">{ayuda}</p>}
      {error && (
        <p className="mt-1 text-xs font-medium text-peligro" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-petroleo-800 text-sm font-bold text-white">
        V
      </span>
      <span className={cn("leading-none", compacto && "hidden sm:block")}>
        <span className="block text-sm font-bold tracking-wide text-petroleo-900">VELARDE</span>
        <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-tinta-suave">
          Centro Médico
        </span>
      </span>
    </span>
  );
}
