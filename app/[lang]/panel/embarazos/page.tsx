import { ModuloPanel } from "@/components/panel/modulo";
export default function Page({ params }: { params: Promise<{ lang: string }> }) { return <ModuloPanel params={params.then(({ lang }) => ({ lang, modulo: "embarazos" }))} />; }
