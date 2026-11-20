import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { leerEntornoSupabase } from "@/lib/supabase/entorno";
import { LOCALES, LOCALE_POR_DEFECTO, type Locale } from "@/lib/i18n";

const RUTAS_SIN_LOCALE = ["/api", "/auth", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml", "/manifest.webmanifest"];

function esRutaTecnica(pathname: string): boolean {
  return (
    RUTAS_SIN_LOCALE.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)) ||
    /\.[a-zA-Z0-9]+$/.test(pathname)
  );
}

function localeDePreferencia(request: NextRequest): Locale {
  const cookie = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && (LOCALES as readonly string[]).includes(cookie)) {
    return cookie as Locale;
  }
  const aceptado = request.headers.get("accept-language")?.toLowerCase() ?? "";
  if (aceptado.includes("pt")) return "pt";
  return LOCALE_POR_DEFECTO;
}

function rutaConLocale(locale: Locale, pathname: string): string {
  if (pathname === "/") return `/${locale}`;
  return `/${locale}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (esRutaTecnica(pathname)) {
    return NextResponse.next();
  }

  const segmentos = pathname.split("/").filter(Boolean);
  const primerSegmento = segmentos[0];

  if (!primerSegmento || !(LOCALES as readonly string[]).includes(primerSegmento)) {
    const locale = localeDePreferencia(request);
    const destino = request.nextUrl.clone();
    destino.pathname = rutaConLocale(locale, pathname);
    destino.search = search;
    return NextResponse.redirect(destino);
  }

  const locale = primerSegmento as Locale;
  const resto = `/${segmentos.slice(1).join("/")}`;
  const esPanel = resto === "/panel" || resto.startsWith("/panel/");

  const respuesta = NextResponse.next({ request });
  respuesta.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  if (!esPanel) return respuesta;

  const entorno = leerEntornoSupabase();
  if (!entorno.configurado) return respuesta;

  try {
    const supabase = createServerClient(entorno.url, entorno.anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            respuesta.cookies.set(name, value, options);
          });
        },
      },
    });

    const claims = await supabase.auth.getClaims();
    if (!claims.data?.claims?.sub) {
      const destino = request.nextUrl.clone();
      destino.pathname = `/${locale}/ingresar`;
      destino.search = `?next=${encodeURIComponent(pathname + search)}`;
      const redireccion = NextResponse.redirect(destino);
      respuesta.cookies.getAll().forEach((cookie) => redireccion.cookies.set(cookie));
      return redireccion;
    }
  } catch {
    // Si Supabase no responde, el panel mostrará el error controlado.
  }

  return respuesta;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
