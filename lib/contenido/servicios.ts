import type { Locale } from "@/lib/clinica/config";

export type ServicioPublico = {
  slug: string;
  especialidad: string;
  nombre: Record<Locale, string>;
  resumen: Record<Locale, string>;
  descripcion: Record<Locale, string>;
  incluye: Record<Locale, string[]>;
  preguntas: Array<{
    pregunta: Record<Locale, string>;
    respuesta: Record<Locale, string>;
  }>;
};

const preguntasComunes = (nombre: Record<Locale, string>) => [
  {
    pregunta: {
      es: `¿Cómo solicito una cita de ${nombre.es.toLowerCase()}?`,
      pt: `Como solicito uma consulta de ${nombre.pt.toLowerCase()}?`,
    },
    respuesta: {
      es: "Puedes enviar una solicitud desde la página de reservas o escribir por WhatsApp. La solicitud queda pendiente hasta que recepción la confirme.",
      pt: "Você pode enviar uma solicitação pela página de agendamento ou escrever pelo WhatsApp. A solicitação fica pendente até a confirmação da recepção.",
    },
  },
  {
    pregunta: {
      es: "¿Atienden a personas de otras localidades?",
      pt: "Atendem pessoas de outras localidades?",
    },
    respuesta: {
      es: "Sí. El centro atiende a pacientes de Guayaramerín, Riberalta, localidades cercanas y visitantes de la zona fronteriza. Recomendamos coordinar la cita antes de viajar.",
      pt: "Sim. O centro atende pacientes de Guayaramerín, Riberalta, localidades próximas e visitantes da região fronteiriça. Recomendamos agendar antes de viajar.",
    },
  },
  {
    pregunta: {
      es: "¿Los horarios y precios están publicados?",
      pt: "Os horários e preços estão publicados?",
    },
    respuesta: {
      es: "Los horarios y tarifas se confirman directamente con recepción. No publicamos disponibilidad ni precios que no hayan sido confirmados.",
      pt: "Os horários e valores são confirmados diretamente com a recepção. Não publicamos disponibilidade nem preços que não tenham sido confirmados.",
    },
  },
];

export const SERVICIOS_PUBLICOS: ServicioPublico[] = [
  {
    slug: "ginecologia",
    especialidad: "Ginecología",
    nombre: { es: "Ginecología", pt: "Ginecologia" },
    resumen: {
      es: "Consulta y seguimiento de la salud femenina en un entorno privado y respetuoso.",
      pt: "Consulta e acompanhamento da saúde feminina em um ambiente privado e respeitoso.",
    },
    descripcion: {
      es: "La consulta ginecológica permite evaluar y dar seguimiento a la salud femenina. El Dr. Marco Antonio Velarde Melgar atiende de forma presencial en el Centro Médico Especializado VELARDE.",
      pt: "A consulta ginecológica permite avaliar e acompanhar a saúde feminina. O Dr. Marco Antonio Velarde Melgar atende presencialmente no Centro Médico Especializado VELARDE.",
    },
    incluye: {
      es: ["Evaluación ginecológica", "Orientación y seguimiento", "Coordinación de estudios cuando corresponda"],
      pt: ["Avaliação ginecológica", "Orientações e acompanhamento", "Coordenação de exames quando indicado"],
    },
    preguntas: preguntasComunes({ es: "Ginecología", pt: "Ginecologia" }),
  },
  {
    slug: "obstetricia",
    especialidad: "Obstetricia",
    nombre: { es: "Obstetricia", pt: "Obstetrícia" },
    resumen: {
      es: "Acompañamiento médico durante el embarazo y coordinación de la atención.",
      pt: "Acompanhamento médico durante a gestação e coordenação do atendimento.",
    },
    descripcion: {
      es: "La atención obstétrica acompaña el embarazo y permite coordinar controles y estudios. La frecuencia de las consultas se define según cada caso y la indicación del profesional.",
      pt: "O atendimento obstétrico acompanha a gestação e permite coordenar consultas e exames. A frequência das consultas é definida conforme cada caso e a indicação do profissional.",
    },
    incluye: {
      es: ["Consulta obstétrica", "Coordinación de controles", "Orientación durante el embarazo"],
      pt: ["Consulta obstétrica", "Coordenação de consultas de acompanhamento", "Orientações durante a gestação"],
    },
    preguntas: preguntasComunes({ es: "Obstetricia", pt: "Obstetrícia" }),
  },
  {
    slug: "control-prenatal",
    especialidad: "Control prenatal",
    nombre: { es: "Control prenatal", pt: "Pré-natal" },
    resumen: {
      es: "Seguimiento periódico de la gestante con registro de controles y mediciones.",
      pt: "Acompanhamento periódico da gestante com registro de controles e medidas.",
    },
    descripcion: {
      es: "El control prenatal organiza el seguimiento de la gestante. En la plataforma interna se registran controles, mediciones y documentos autorizados para mantener continuidad en la atención.",
      pt: "O pré-natal organiza o acompanhamento da gestante. Na plataforma interna são registrados controles, medidas e documentos autorizados para manter a continuidade do atendimento.",
    },
    incluye: {
      es: ["Registro de controles", "Seguimiento de mediciones", "Coordinación de ecografías y laboratorio"],
      pt: ["Registro de controles", "Acompanhamento de medidas", "Coordenação de ultrassonografias e laboratório"],
    },
    preguntas: preguntasComunes({ es: "Control prenatal", pt: "Pré-natal" }),
  },
  {
    slug: "ecografias",
    especialidad: "Ecografías",
    nombre: { es: "Ecografías", pt: "Ultrassonografias" },
    resumen: {
      es: "Estudios de imagen por ecografía con registro del informe autorizado.",
      pt: "Exames de imagem por ultrassonografia com registro do laudo autorizado.",
    },
    descripcion: {
      es: "El centro realiza estudios de ecografía. El informe y las imágenes se incorporan a la historia clínica digital cuando corresponda y con las autorizaciones de acceso definidas.",
      pt: "O centro realiza exames de ultrassonografia. O laudo e as imagens são incorporados ao prontuário digital quando indicado e com as autorizações de acesso definidas.",
    },
    incluye: {
      es: ["Ecografía obstétrica", "Estudios ecográficos coordinados", "Entrega de documentación autorizada"],
      pt: ["Ultrassonografia obstétrica", "Exames de ultrassonografia coordenados", "Entrega de documentação autorizada"],
    },
    preguntas: preguntasComunes({ es: "Ecografías", pt: "Ultrassonografias" }),
  },
  {
    slug: "medicina-general",
    especialidad: "Medicina general",
    nombre: { es: "Medicina general", pt: "Clínica geral" },
    resumen: {
      es: "Atención médica general y coordinación de estudios cuando sean necesarios.",
      pt: "Atendimento médico geral e coordenação de exames quando necessário.",
    },
    descripcion: {
      es: "La consulta de medicina general brinda atención médica presencial y permite coordinar estudios o derivaciones según la evaluación del profesional.",
      pt: "A consulta de clínica geral oferece atendimento médico presencial e permite coordenar exames ou encaminhamentos conforme a avaliação do profissional.",
    },
    incluye: {
      es: ["Consulta médica general", "Orientación preventiva", "Coordinación de laboratorio"],
      pt: ["Consulta médica geral", "Orientações preventivas", "Coordenação de laboratório"],
    },
    preguntas: preguntasComunes({ es: "Medicina general", pt: "Clínica geral" }),
  },
  {
    slug: "laboratorios",
    especialidad: "Laboratorios",
    nombre: { es: "Laboratorios", pt: "Laboratório" },
    resumen: {
      es: "Análisis clínicos y entrega de resultados mediante acceso autorizado.",
      pt: "Análises clínicas e entrega de resultados mediante acesso autorizado.",
    },
    descripcion: {
      es: "El área de laboratorio recibe órdenes médicas, registra resultados y resguarda los documentos clínicos. Los resultados se consultan únicamente a través de los canales autorizados.",
      pt: "A área de laboratório recebe pedidos médicos, registra resultados e protege os documentos clínicos. Os resultados são consultados apenas pelos canais autorizados.",
    },
    incluye: {
      es: ["Recepción de órdenes", "Registro de resultados", "Documentos clínicos protegidos"],
      pt: ["Recepção de pedidos", "Registro de resultados", "Documentos clínicos protegidos"],
    },
    preguntas: preguntasComunes({ es: "Laboratorios", pt: "Laboratório" }),
  },
];

export function buscarServicio(slug: string): ServicioPublico | undefined {
  return SERVICIOS_PUBLICOS.find((servicio) => servicio.slug === slug);
}

export const PREGUNTAS_FRECUENTES: ServicioPublico["preguntas"] = [
  {
    pregunta: { es: "¿Dónde está ubicado el centro médico?", pt: "Onde fica o centro médico?" },
    respuesta: {
      es: "En Calle Nicolás Gozdanovich, al lado de Farmacia La Familia, Guayaramerín, Beni, Bolivia.",
      pt: "Na Calle Nicolás Gozdanovich, ao lado da Farmacia La Familia, Guayaramerín, Beni, Bolívia.",
    },
  },
  {
    pregunta: { es: "¿Cómo puedo comunicarme?", pt: "Como posso entrar em contato?" },
    respuesta: {
      es: "Por WhatsApp al +591 76860839. No envíes información clínica sensible por ese canal.",
      pt: "Pelo WhatsApp +591 76860839. Não envie informações clínicas sensíveis por esse canal.",
    },
  },
  {
    pregunta: { es: "¿Necesito crear una cuenta para reservar?", pt: "Preciso criar uma conta para agendar?" },
    respuesta: {
      es: "No. Puedes enviar una solicitud con tu nombre y teléfono. La cita queda confirmada solo cuando recepción te contacta.",
      pt: "Não. Você pode enviar uma solicitação com seu nome e telefone. A consulta só é confirmada quando a recepção entrar em contato.",
    },
  },
  {
    pregunta: { es: "¿Atienden en español y portugués?", pt: "Atendem em espanhol e português?" },
    respuesta: {
      es: "La atención se brinda en español. El sitio web también está disponible en portugués para facilitar la información a visitantes brasileños.",
      pt: "O atendimento é realizado em espanhol. O site também está disponível em português para facilitar as informações aos visitantes brasileiros.",
    },
  },
  {
    pregunta: { es: "¿Se publican precios y horarios?", pt: "Os preços e horários são publicados?" },
    respuesta: {
      es: "Los horarios y tarifas se confirman directamente con recepción. La disponibilidad en línea depende de la agenda configurada.",
      pt: "Os horários e valores são confirmados diretamente com a recepção. A disponibilidade on-line depende da agenda configurada.",
    },
  },
  {
    pregunta: { es: "¿Puedo pedir una receta o resultados por WhatsApp?", pt: "Posso pedir receita ou resultados pelo WhatsApp?" },
    respuesta: {
      es: "No. Los documentos clínicos se entregan por los canales autorizados. Por WhatsApp solo se coordinan aspectos administrativos.",
      pt: "Não. Os documentos clínicos são entregues pelos canais autorizados. Pelo WhatsApp são tratados apenas aspectos administrativos.",
    },
  },
];
