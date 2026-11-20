import Link from "next/link";
import { ArrowLeft, ClipboardPlus, Pill, Stethoscope, UserRoundPlus } from "lucide-react";
import { connection } from "next/server";
import { crearPacienteReal } from "@/lib/acciones/pacientes-real";
import { requerirSesion, puede } from "@/lib/auth/sesion";
import { PERMISOS } from "@/lib/auth/permisos";
import { normalizarLocale } from "@/lib/i18n";
import { Alerta, Campo, claseCampo, Tarjeta } from "@/components/ui/base";
import { BotonGuardarPaciente } from "@/components/panel/boton-guardar-paciente";

export const instant = false;
export const metadata = { title: "Registrar paciente y atención", robots: { index: false, follow: false } };

export default async function NuevoPaciente({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ error?: string }> }) {
  await connection();
  const { lang } = await params;
  const locale = normalizarLocale(lang);
  const consulta = await searchParams;
  const sesion = await requerirSesion(locale);
  if (!puede(sesion, PERMISOS.pacientesGestionar)) return <Alerta tono="peligro">No tienes permiso para registrar pacientes.</Alerta>;

  const esPt = locale === "pt";
  const mensaje =
    consulta.error === "duplicado"
      ? (esPt ? "Já existe um paciente ativo com esse WhatsApp." : "Ya existe un paciente activo con ese WhatsApp.")
      : consulta.error === "servidor"
      ? (esPt ? "Não foi possível salvar o paciente e a consulta. Tente novamente." : "No se pudo guardar el paciente y la atención. Vuelve a intentarlo.")
      : consulta.error === "datos"
      ? (esPt ? "Preencha os dados obrigatórios do paciente." : "Completa los datos obligatorios del paciente.")
      : null;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link href={`/${locale}/panel/pacientes`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-turquesa-700 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden /> {esPt ? "Voltar aos pacientes" : "Volver a pacientes"}
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-turquesa-700">
          {esPt ? "Admissão e consulta unificada" : "Alta y atención unificada"}
        </p>
        <h1 className="mt-1 font-display text-2xl sm:text-3xl text-petroleo-900">
          {esPt ? "Novo paciente e consulta" : "Nuevo paciente y atención clínica"}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-tinta-suave">
          {esPt
            ? "Preencha a ficha do paciente, a avaliação clínica e a prescrição médica em uma única etapa prática."
            : "Registra los datos del paciente, su primera evaluación clínica y la receta médica en un solo paso unificado."}
        </p>
      </header>

      {mensaje && <Alerta tono="peligro">{mensaje}</Alerta>}

      <Tarjeta>
        <form action={crearPacienteReal} className="space-y-6">
          <input type="hidden" name="locale" value={locale} />

          {/* 1. Datos personales y contacto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-borde pb-3">
              <UserRoundPlus className="h-5 w-5 text-turquesa-700" aria-hidden />
              <h2 className="font-display text-lg sm:text-xl text-petroleo-900">
                {esPt ? "1. Dados do paciente" : "1. Datos del paciente"}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta={esPt ? "Nomes" : "Nombres"} htmlFor="nombres" requerido>
                <input id="nombres" name="nombres" required autoComplete="given-name" className={claseCampo} placeholder={esPt ? "Ex. Maria" : "Ej. María"} />
              </Campo>
              <Campo etiqueta={esPt ? "Sobrenomes" : "Apellidos"} htmlFor="apellidos" requerido>
                <input id="apellidos" name="apellidos" required autoComplete="family-name" className={claseCampo} placeholder={esPt ? "Ex. Silva Flores" : "Ej. Pérez Gómez"} />
              </Campo>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="WhatsApp" htmlFor="whatsapp" requerido ayuda={esPt ? "Canal principal de contato" : "Canal principal de contacto"}>
                <input id="whatsapp" name="whatsapp" required inputMode="tel" autoComplete="tel" className={claseCampo} placeholder="Ej. 76860839" />
              </Campo>
              <Campo etiqueta={esPt ? "Idade em anos" : "Edad en años"} htmlFor="edad" requerido>
                <input id="edad" name="edad" type="number" min="0" max="130" required inputMode="numeric" className={claseCampo} placeholder="Ej. 35" />
              </Campo>
            </div>
            <div className="rounded-xl border border-borde bg-arena-50/70 p-3.5">
              <p className="mb-3 text-sm font-semibold text-petroleo-900">
                {esPt ? "Contato de emergência" : "Contacto de emergencia"}{" "}
                <span className="font-normal text-tinta-suave">({esPt ? "opcional" : "opcional"})</span>
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo etiqueta={esPt ? "Nome" : "Nombre"} htmlFor="contactoEmergencia">
                  <input id="contactoEmergencia" name="contactoEmergencia" className={claseCampo} placeholder={esPt ? "Nome do contato" : "Nombre del contacto"} />
                </Campo>
                <Campo etiqueta={esPt ? "Telefone / WhatsApp" : "Teléfono / WhatsApp"} htmlFor="telefonoEmergencia">
                  <input id="telefonoEmergencia" name="telefonoEmergencia" inputMode="tel" className={claseCampo} placeholder="Ej. 71234567" />
                </Campo>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta={esPt ? "E-mail" : "Correo electrónico"} htmlFor="correo">
                <input id="correo" name="correo" type="email" autoComplete="email" className={claseCampo} placeholder="paciente@ejemplo.com" />
              </Campo>
              <Campo etiqueta={esPt ? "Idioma preferencial" : "Idioma de preferencia"} htmlFor="idioma">
                <select id="idioma" name="idioma" defaultValue={locale === "pt" ? "pt-BR" : "es"} className={claseCampo}>
                  <option value="es">Español</option>
                  <option value="pt-BR">Português brasileiro</option>
                </select>
              </Campo>
            </div>
          </div>

          {/* 2. Atención y evaluación clínica */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-borde pb-3">
              <Stethoscope className="h-5 w-5 text-turquesa-700" aria-hidden />
              <h2 className="font-display text-lg sm:text-xl text-petroleo-900">
                {esPt ? "2. Consulta e avaliação clínica" : "2. Atención y evaluación clínica"}
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta={esPt ? "Tipo de atendimento" : "Tipo de atención"} htmlFor="tipoAtencion" requerido>
                <select id="tipoAtencion" name="tipoAtencion" defaultValue="ginecologia" className={claseCampo}>
                  <option value="ginecologia">{esPt ? "Ginecologia" : "Ginecología"}</option>
                  <option value="obstetricia">{esPt ? "Obstetrícia" : "Obstetricia"}</option>
                  <option value="prenatal">{esPt ? "Pré-natal" : "Control prenatal"}</option>
                  <option value="general">{esPt ? "Clínica médica" : "Medicina general"}</option>
                  <option value="ecografia">{esPt ? "Ultrassonografia" : "Ecografía"}</option>
                  <option value="laboratorio">{esPt ? "Laboratório" : "Laboratorio"}</option>
                </select>
              </Campo>
            </div>
            <Campo etiqueta={esPt ? "Motivo da consulta" : "Motivo de consulta"} htmlFor="motivoAtencion" requerido>
              <textarea
                id="motivoAtencion"
                name="motivoAtencion"
                required
                rows={3}
                className={claseCampo}
                placeholder={esPt ? "Descreva o motivo principal do atendimento..." : "¿Por qué acude a la consulta hoy?"}
              />
            </Campo>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo
                etiqueta={esPt ? "Avaliação clínica e exame físico" : "Evaluación clínica y hallazgos"}
                htmlFor="evaluacionAtencion"
                ayuda={esPt ? "Sinais, exame físico e hipóteses" : "Signos clínicos, examen físico y diagnóstico presuntivo"}
              >
                <textarea
                  id="evaluacionAtencion"
                  name="evaluacionAtencion"
                  rows={4}
                  className={claseCampo}
                  placeholder={esPt ? "Exame físico, achados clínicos e avaliação..." : "Hallazgos al examen físico, evaluación y notas..."}
                />
              </Campo>
              <Campo
                etiqueta={esPt ? "Plano e conduta terapêutica" : "Plan de tratamiento e indicaciones"}
                htmlFor="planAtencion"
                ayuda={esPt ? "Orientações gerais e condutas" : "Recomendaciones, cuidados y plan terapéutico"}
              >
                <textarea
                  id="planAtencion"
                  name="planAtencion"
                  rows={4}
                  className={claseCampo}
                  placeholder={esPt ? "Orientações, cuidados e plano acordado..." : "Indicaciones médicas, recomendaciones y cuidados generales..."}
                />
              </Campo>
            </div>
          </div>

          {/* 3. Receta médica y pauta */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 border-b border-borde pb-3">
              <Pill className="h-5 w-5 text-turquesa-700" aria-hidden />
              <div>
                <h2 className="font-display text-lg sm:text-xl text-petroleo-900">
                  {esPt ? "3. Prescrição médica (opcional)" : "3. Receta médica y pauta (opcional)"}
                </h2>
                <p className="text-xs text-tinta-suave">
                  {esPt ? "Adicione os medicamentos prescritos durante este atendimento" : "Añade la medicación prescrita directamente en esta misma consulta"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta={esPt ? "Medicamento" : "Medicamento"} htmlFor="medicamento">
                <input
                  id="medicamento"
                  name="medicamento"
                  className={claseCampo}
                  placeholder={esPt ? "Ex. Amoxicilina 500 mg, Ibuprofeno 400 mg..." : "Ej. Amoxicilina 500 mg, Ibuprofeno 400 mg..."}
                />
              </Campo>
              <Campo
                etiqueta={esPt ? "Posologia completa" : "Pauta completa"}
                htmlFor="pauta"
                ayuda={esPt ? "Exemplo: 500 mg a cada 8 horas por 7 dias via oral" : "Ejemplo: 500 mg cada 8 horas por 7 días vía oral"}
              >
                <input
                  id="pauta"
                  name="pauta"
                  className={claseCampo}
                  placeholder={esPt ? "Dose, frequência, duração e via..." : "Dosis, frecuencia, duración y vía de administración..."}
                />
              </Campo>
            </div>
          </div>

          {/* 4. Antecedentes clínicos relevantes */}
          <details className="rounded-xl border border-borde bg-arena-50/70 p-4">
            <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-petroleo-900 select-none">
              {esPt ? "+ Antecedentes e histórico clínico (opcional)" : "+ Antecedentes clínicos y resumen (opcional)"}
            </summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Campo etiqueta={esPt ? "Alergias conhecidas" : "Alergias conocidas"} htmlFor="alergias">
                <input id="alergias" name="alergias" className={claseCampo} placeholder={esPt ? "Ex. Penicilina, AINEs..." : "Ej. Penicilina, sulfas, látex..."} />
              </Campo>
              <Campo etiqueta={esPt ? "Condições crônicas" : "Condiciones crónicas"} htmlFor="condicionesCronicas">
                <input id="condicionesCronicas" name="condicionesCronicas" className={claseCampo} placeholder={esPt ? "Ex. Hipertensão, Diabetes..." : "Ej. Hipertensión, Diabetes..."} />
              </Campo>
              <Campo etiqueta={esPt ? "Antecedentes cirúrgicos" : "Antecedentes quirúrgicos"} htmlFor="antecedentesQuirurgicos">
                <input id="antecedentesQuirurgicos" name="antecedentesQuirurgicos" className={claseCampo} placeholder={esPt ? "Ex. Cesárea (2021)..." : "Ej. Cesárea previa, apendicectomía..."} />
              </Campo>
              <Campo etiqueta={esPt ? "Medicação em uso" : "Medicación habitual previa"} htmlFor="medicacionHabitual">
                <input id="medicacionHabitual" name="medicacionHabitual" className={claseCampo} placeholder={esPt ? "Ex. Levotiroxina 50 mcg..." : "Ej. Levotiroxina 50 mcg..."} />
              </Campo>
            </div>
          </details>

          <div className="flex items-start gap-3 rounded-xl bg-arena-50 p-3.5 text-sm text-tinta-suave">
            <ClipboardPlus className="mt-0.5 h-5 w-5 shrink-0 text-turquesa-700" aria-hidden />
            <p>
              {esPt
                ? "Ao salvar, o paciente, sua consulta e a receita médica serão registrados conjuntamente no sistema."
                : "Al guardar, el paciente, su primera evaluación médica y la receta quedarán registrados conjuntamente en el sistema, listos para imprimir o consultar."}
            </p>
          </div>

          <BotonGuardarPaciente texto={esPt ? "Salvar paciente e consulta unificada" : "Guardar paciente y atención unificada"} />
        </form>
      </Tarjeta>
    </div>
  );
}
