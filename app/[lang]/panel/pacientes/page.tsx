import { ModuloPanel } from "@/components/panel/modulo";

export const instant = false;

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ paciente?: string; creado?: string; atencion?: string; receta?: string; vista?: string }>;
}) {
  const [{ lang }, valores] = await Promise.all([params, searchParams]);
  return (
    <ModuloPanel
      params={Promise.resolve({ lang, modulo: "pacientes" })}
      pacienteId={valores.paciente}
      atencionInicial={valores.atencion === "1"}
      creado={valores.creado === "1"}
      recetaId={valores.receta}
      vista={valores.vista}
    />
  );
}
