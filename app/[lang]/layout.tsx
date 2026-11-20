import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { CLINICA_VELARDE, urlSitio } from "@/lib/clinica/config";
import { esLocale, getDiccionario, normalizarLocale } from "@/lib/i18n";
import "../globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#062f37",
};

export const instant = false;

export function generateStaticParams() {
  return [{ lang: "es" }, { lang: "pt" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale = normalizarLocale(lang);
  const d = getDiccionario(locale);
  const base = urlSitio();

  return {
    metadataBase: new URL(base),
    title: {
      default: `${CLINICA_VELARDE.nombreCorto} DIGITAL | ${d.inicio.etiqueta}`,
      template: `%s | ${CLINICA_VELARDE.nombreCorto}`,
    },
    description: CLINICA_VELARDE.descripcion[locale],
    applicationName: "VELARDE DIGITAL",
    alternates: {
      canonical: `${base}/${locale}`,
      languages: { es: `${base}/es`, "pt-BR": `${base}/pt`, "x-default": `${base}/es` },
    },
    icons: { icon: "/favicon.ico" },
    robots: { index: true, follow: true },
    formatDetection: { telephone: true, address: true, email: true },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!esLocale(lang)) notFound();
  const locale = normalizarLocale(lang);

  return (
    <html
      lang={locale === "pt" ? "pt-BR" : "es-BO"}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body data-scroll-behavior="smooth" className="flex min-h-dvh flex-col bg-fondo text-tinta">{children}</body>
    </html>
  );
}
