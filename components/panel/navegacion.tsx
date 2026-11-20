"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Baby,
  BarChart3,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Settings,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

export type IconoPanel =
  | "inicio"
  | "agenda"
  | "pacientes"
  | "solicitudes"
  | "embarazos"
  | "laboratorio"
  | "documentos"
  | "seguimiento"
  | "reportes"
  | "admin"
  | "mas";

const ICONOS: Record<IconoPanel, LucideIcon> = {
  inicio: LayoutDashboard,
  agenda: CalendarDays,
  pacientes: Users,
  solicitudes: ClipboardList,
  embarazos: Baby,
  laboratorio: FlaskConical,
  documentos: FileText,
  seguimiento: Activity,
  reportes: BarChart3,
  admin: Settings,
  mas: MoreHorizontal,
};

export type ItemNavegacion = {
  href: string;
  etiqueta: string;
  icono: IconoPanel;
};

export function NavegacionPanel({
  items,
  modo,
}: {
  items: ItemNavegacion[];
  modo: "lateral" | "inferior";
}) {
  const ruta = usePathname() ?? "";
  const visibles =
    modo === "inferior" && items.length > 4
      ? [
          ...items.slice(0, 4),
          {
            href: `${items[0]?.href.split("/panel")[0] ?? ""}/panel/mas`,
            etiqueta: "Más",
            icono: "mas" as IconoPanel,
          },
        ]
      : modo === "inferior"
        ? items.slice(0, 5)
        : items;

  return (
    <nav
      aria-label="Navegación del panel"
      className={
        modo === "lateral"
          ? "flex flex-col gap-1"
          : "grid grid-cols-5 gap-1 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1"
      }
    >
      {visibles.map((item) => {
        const activo =
          item.href === "/panel"
            ? ruta.replace(/^\/(es|pt)/, "") === "/panel"
            : ruta.includes(item.href);
        const Icono = ICONOS[item.icono];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activo ? "page" : undefined}
            className={
              modo === "lateral"
                ? `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    activo
                      ? "bg-petroleo-800 text-white"
                      : "text-tinta-suave hover:bg-arena-50 hover:text-petroleo-900"
                  }`
                : `flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-semibold ${
                    activo ? "bg-turquesa-100 text-petroleo-900" : "text-tinta-suave"
                  }`
            }
          >
            <Icono className={modo === "lateral" ? "h-4 w-4" : "h-5 w-5"} aria-hidden />
            <span className={modo === "lateral" ? "" : "leading-tight"}>{item.etiqueta}</span>
          </Link>
        );
      })}
    </nav>
  );
}
