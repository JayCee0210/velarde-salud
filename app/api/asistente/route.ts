import { NextResponse } from "next/server";
import { z } from "zod";
import { CLINICA_VELARDE } from "@/lib/clinica/config";
import { ipDeCabeceras, limitar } from "@/lib/seguridad/limite";

const esquema = z.object({
  mensaje: z.string().trim().min(1).max(500),
  locale: z.enum(["es", "pt"]).default("es"),
});

type Sugerencia = { texto: string; href: string };

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function contiene(texto: string, palabras: string[]): boolean {
  return palabras.some((palabra) => texto.includes(palabra));
}

export async function POST(request: Request) {
  const ip = ipDeCabeceras(request.headers);
  if (!limitar(`asistente:${ip}`, 20, 60_000).permitido) {
    return NextResponse.json(
      { error: "Demasiadas consultas. Espera un momento." },
      { status: 429 },
    );
  }

  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const resultado = esquema.safeParse(cuerpo);
  if (!resultado.success) {
    return NextResponse.json({ error: "Escribe una consulta breve." }, { status: 400 });
  }

  const texto = normalizar(resultado.data.mensaje);
  const pt = resultado.data.locale === "pt";
  const L = (es: string, portugues: string) => (pt ? portugues : es);

  const base = `/${resultado.data.locale}`;
  let respuesta = L(
    "Puedo orientarte sobre servicios, cómo solicitar una cita y cómo llegar al centro. Para una valoración médica necesitas una consulta.",
    "Posso orientar sobre serviços, como solicitar uma consulta e como chegar ao centro. Para uma avaliação médica é necessária uma consulta.",
  );
  let sugerencias: Sugerencia[] = [
    { texto: L("Solicitar una cita", "Solicitar uma consulta"), href: `${base}/reservar` },
    { texto: L("Ver servicios", "Ver serviços"), href: `${base}/servicios/ginecologia` },
  ];

  if (contiene(texto, ["sangrado", "hemorragia", "dolor fuerte", "dolor intenso", "convulsion", "desmayo", "fiebre alta", "no se mueve", "disminucion de movimientos", "emergencia", "urgencia", "sangramento", "convulsao", "desmaio"])) {
    respuesta = L(
      "Si presentas sangrado, dolor intenso, fiebre alta, convulsiones, desmayo o una disminución de los movimientos del bebé, acude de inmediato a un servicio de emergencia. Este asistente no evalúa urgencias.",
      "Se você apresenta sangramento, dor intensa, febre alta, convulsões, desmaio ou diminuição dos movimentos do bebê, procure imediatamente um serviço de emergência. Este assistente não avalia urgências.",
    );
    sugerencias = [{ texto: L("Ver ubicación y contacto", "Ver localização e contato"), href: `${base}/ubicacion` }];
  } else if (contiene(texto, ["cita", "turno", "reservar", "agendar", "atencion", "consulta", "consulta", "marcar"])) {
    respuesta = L(
      "Puedes solicitar una cita desde el formulario. Recepción confirmará la disponibilidad por teléfono o WhatsApp. Si prefieres, escríbenos directamente.",
      "Você pode solicitar uma consulta pelo formulário. A recepção confirmará a disponibilidade por telefone ou WhatsApp. Se preferir, fale conosco diretamente.",
    );
    sugerencias = [{ texto: L("Ir al formulario de cita", "Ir ao formulário de consulta"), href: `${base}/reservar` }];
  } else if (contiene(texto, ["embarazo", "prenatal", "gestacion", "gravidez", "gestante", "bebe", "feto"])) {
    respuesta = L(
      "El control prenatal permite acompañar el embarazo con evaluaciones periódicas. En la sección de embarazo encontrarás información general; si tienes síntomas de alarma, busca atención inmediata.",
      "O pré-natal acompanha a gestação com avaliações periódicas. Na seção de gestação você encontra informação geral; se tiver sintomas de alarme, procure atendimento imediato.",
    );
    sugerencias = [
      { texto: L("Información sobre el embarazo", "Informações sobre a gestação"), href: `${base}/embarazo` },
      { texto: L("Solicitar control prenatal", "Solicitar pré-natal"), href: `${base}/reservar` },
    ];
  } else if (contiene(texto, ["ecografia", "ultrasonido", "ultrassom", "ultrassonografia", "ecografia"])) {
    respuesta = L(
      "Las ecografías se realizan con indicación médica. Solicita una cita para que el profesional valore qué estudio necesitas.",
      "As ultrassonografias são realizadas com indicação médica. Solicite uma consulta para que o profissional avalie qual exame você precisa.",
    );
    sugerencias = [{ texto: L("Ver ecografías", "Ver ultrassonografias"), href: `${base}/servicios/ecografias` }];
  } else if (contiene(texto, ["laboratorio", "examen", "analisis", "sangre", "laboratorial", "exame"])) {
    respuesta = L(
      "Los exámenes de laboratorio se solicitan con orden médica. Consulta la sección de laboratorios y coordina la toma de muestra.",
      "Os exames laboratoriais são solicitados com pedido médico. Consulte a seção de laboratório e coordene a coleta.",
    );
    sugerencias = [{ texto: L("Ver laboratorios", "Ver laboratório"), href: `${base}/servicios/laboratorios` }];
  } else if (contiene(texto, ["ginecologia", "ginecologa", "menstruacion", "dolor pelvico", "ginecologia", "menstruacao"])) {
    respuesta = L(
      "La consulta ginecológica permite evaluar síntomas, prevención y salud reproductiva. Para síntomas intensos o sangrado anormal, solicita una valoración.",
      "A consulta ginecológica permite avaliar sintomas, prevenção e saúde reprodutiva. Para sintomas intensos ou sangramento anormal, solicite uma avaliação.",
    );
    sugerencias = [{ texto: L("Ver ginecología", "Ver ginecologia"), href: `${base}/servicios/ginecologia` }];
  } else if (contiene(texto, ["donde", "ubicacion", "direccion", "llegar", "localizacion", "endereco", "localizacao", "como chegar"])) {
    respuesta = L(
      `El centro está en ${CLINICA_VELARDE.direccion}, ${CLINICA_VELARDE.ciudad}. Puedes abrir la ubicación y escribir por WhatsApp si necesitas una referencia.`,
      `O centro fica em ${CLINICA_VELARDE.direccion}, ${CLINICA_VELARDE.ciudad}. Você pode abrir a localização e falar por WhatsApp se precisar de uma referência.`,
    );
    sugerencias = [{ texto: L("Ubicación y contacto", "Localização e contato"), href: `${base}/ubicacion` }];
  } else if (contiene(texto, ["precio", "costo", "cuanto", "tarifa", "preco", "valor", "quanto"])) {
    respuesta = L(
      "No publicamos precios porque dependen del servicio y la valoración. Recepción puede informarte por WhatsApp.",
      "Não publicamos preços porque dependem do serviço e da avaliação. A recepção pode informar por WhatsApp.",
    );
    sugerencias = [{ texto: L("Contactar por WhatsApp", "Contatar por WhatsApp"), href: `${base}/contacto` }];
  } else if (contiene(texto, ["horario", "hora", "abren", "atienden", "horario", "atendem"])) {
    respuesta = L(
      "No mostramos horarios sin confirmación. Escríbenos por WhatsApp o revisa la página de contacto para coordinar el horario de atención.",
      "Não mostramos horários sem confirmação. Fale por WhatsApp ou consulte a página de contato para coordenar o horário de atendimento.",
    );
    sugerencias = [{ texto: L("Contacto", "Contato"), href: `${base}/contacto` }];
  } else if (contiene(texto, ["doctor", "medico", "especialista", "medica", "medico"])) {
    respuesta = L(
      "El centro cuenta con atención médica en ginecología, obstetricia y áreas relacionadas. Puedes revisar el perfil profesional y solicitar una cita.",
      "O centro conta com atendimento médico em ginecologia, obstetrícia e áreas relacionadas. Você pode ver o perfil profissional e solicitar uma consulta.",
    );
    sugerencias = [{ texto: L("Conocer al profesional", "Conhecer o profissional"), href: `${base}/doctor` }];
  }

  return NextResponse.json(
    {
      respuesta,
      sugerencias,
      whatsapp: CLINICA_VELARDE.whatsapp,
      telefono: CLINICA_VELARDE.telefono,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
