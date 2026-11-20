import { notFound } from "next/navigation";
import { Encabezado } from "@/components/sitio/encabezado";
import { Pie } from "@/components/sitio/pie";
import { Asistente } from "@/components/sitio/asistente";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { esLocale, getDiccionario, normalizarLocale } from "@/lib/i18n";

export default async function LayoutSitio({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esLocale(lang)) notFound();
  const locale = normalizarLocale(lang);
  const [clinica, d] = await Promise.all([
    obtenerClinicaPublica(),
    Promise.resolve(getDiccionario(locale)),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <Encabezado locale={locale} clinica={clinica} d={d} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Pie locale={locale} clinica={clinica} d={d} />
      <Asistente locale={locale} whatsapp={clinica.whatsapp} d={d} />
    </div>
  );
}
