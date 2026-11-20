import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getDiccionario, normalizarLocale } from "@/lib/i18n";
import { obtenerClinicaPublica } from "@/lib/datos/publico";
import { obtenerEstadoAuth } from "@/lib/auth/sesion";
import { metadataPagina } from "@/lib/seo";
import { FormularioLogin } from "@/components/auth/formulario-login";
import { Alerta, Logo } from "@/components/ui/base";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const locale = normalizarLocale((await params).lang);
  return metadataPagina({
    locale,
    titulo: getDiccionario(locale).auth.titulo,
    descripcion: getDiccionario(locale).auth.subtitulo,
    ruta: "/ingresar",
    noIndex: true,
  });
}

function Cargando() {
  return (
    <div className="mx-auto w-full max-w-md animate-pulse space-y-4" aria-busy="true">
      <div className="h-8 w-2/3 rounded-lg bg-arena-100" />
      <div className="h-11 rounded-xl bg-arena-100" />
      <div className="h-11 rounded-xl bg-arena-100" />
      <div className="h-12 rounded-xl bg-arena-100" />
    </div>
  );
}

async function ContenidoIngreso({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string; estado?: string }>;
}) {
  const locale = normalizarLocale((await params).lang);
  const sp = await searchParams;
  const d = getDiccionario(locale);
  const [estado, clinica] = await Promise.all([obtenerEstadoAuth(), obtenerClinicaPublica()]);
  if (estado.sesion) redirect(`/${locale}/panel`);
  const next =
    typeof sp.next === "string" && sp.next.startsWith("/") && !sp.next.startsWith("//")
      ? sp.next
      : `/${locale}/panel`;

  return (
    <div className="mx-auto w-full max-w-md">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-tinta-suave hover:text-petroleo-900"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {d.nav.inicio}
      </Link>
      <div className="mt-6">
        <Logo />
      </div>
      <h1 className="mt-5 font-display text-3xl text-petroleo-900">{d.auth.titulo}</h1>
      <p className="mt-2 text-sm text-tinta-suave">{d.auth.subtitulo}</p>

      {sp.estado === "sin-configurar" && (
        <div className="mt-4">
          <Alerta tono="aviso">{d.auth.configNo}</Alerta>
        </div>
      )}
      {sp.estado === "sin-acceso" && (
        <div className="mt-4">
          <Alerta tono="peligro">{d.auth.sinAcceso}</Alerta>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-borde bg-white p-5 sm:p-6">
        <FormularioLogin
          locale={locale}
          next={next}
          supabaseConfigurado={estado.configurado}
        />
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-tinta-suave">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-turquesa-600" aria-hidden />
        {d.auth.sinCuenta}
      </p>
      <p className="mt-4 text-center text-xs text-tinta-suave">
        {clinica.nombre} · {clinica.ciudad}
      </p>
    </div>
  );
}

export default function Ingreso({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ next?: string; estado?: string }>;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-arena-50 px-4 py-10">
      <Suspense fallback={<Cargando />}>
        <ContenidoIngreso params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
