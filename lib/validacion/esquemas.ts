import { z } from "zod";

const texto = (min: number, max: number, mensaje: string) =>
  z.string().trim().min(min, mensaje).max(max, `Máximo ${max} caracteres.`);

const textoOpcional = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres.`)
    .optional()
    .transform((valor) => (valor ? valor : null));

const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usa una fecha válida.")
  .refine((valor) => !Number.isNaN(new Date(`${valor}T12:00:00`).getTime()), "Fecha inválida.");

const uuid = z.string().uuid("Identificador inválido.");

export const esquemaLogin = z.object({
  email: z.string().trim().email("Correo inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
});

export const esquemaSolicitudCita = z.object({
  servicioId: z.coerce.number().int().positive("Selecciona un servicio.").optional(),
  servicioSlug: z.string().trim().min(1).max(80),
  profesionalId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  fechaPreferida: fecha,
  horaPreferida: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida.")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  franja: z.enum(["manana", "tarde", "indiferente"]).default("indiferente"),
  nombreSolicitante: texto(3, 160, "Ingresa tu nombre completo."),
  telefono: texto(7, 30, "Ingresa un teléfono válido."),
  correo: z
    .string()
    .trim()
    .email("Correo inválido.")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  avisoPrivacidad: z.literal("on", {
    error: "Debes aceptar el aviso de privacidad.",
  }),
  sitioWeb: z.string().max(0).optional().default(""),
});

export const esquemaContacto = z.object({
  nombre: texto(3, 120, "Ingresa tu nombre."),
  telefono: texto(7, 30, "Ingresa un teléfono válido."),
  mensaje: texto(10, 1000, "Escribe un mensaje."),
  sitioWeb: z.string().max(0).optional().default(""),
});

export const esquemaPaciente = z.object({
  nombreCompleto: texto(3, 160, "Ingresa el nombre completo."),
  ci: textoOpcional(30),
  fechaNacimiento: fecha.optional().or(z.literal("")).transform((v) => v || null),
  sexo: z.enum(["F", "M", "X"]).optional().or(z.literal("")).transform((v) => v || null),
  telefono: textoOpcional(30),
  correo: z
    .string()
    .trim()
    .email("Correo inválido.")
    .optional()
    .or(z.literal(""))
    .transform((v) => v || null),
  direccion: textoOpcional(200),
  ciudad: textoOpcional(100),
  departamento: textoOpcional(100),
  pais: textoOpcional(100),
  notasAdministrativas: textoOpcional(1000),
});

export const esquemaConsulta = z.object({
  pacienteId: uuid,
  citaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  tipo: z.enum(["ginecologia", "obstetricia", "prenatal", "general", "ecografia", "laboratorio"]),
  motivoConsulta: texto(3, 2000, "Registra el motivo de consulta."),
  enfermedadActual: textoOpcional(6000),
  examenFisico: textoOpcional(6000),
  evaluacion: textoOpcional(6000),
  plan: textoOpcional(6000),
  finalizar: z.enum(["0", "1"]).default("0"),
});

export const esquemaNota = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  titulo: texto(3, 160, "Ingresa un título."),
  contenido: texto(3, 12000, "Escribe el contenido de la nota."),
  finalizar: z.enum(["0", "1"]).default("0"),
});

export const esquemaEnmienda = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  notaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  motivo: texto(3, 500, "Registra el motivo de la enmienda."),
  contenido: texto(3, 8000, "Escribe la enmienda."),
});

export const esquemaDiagnostico = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  codigoCie10: textoOpcional(20),
  descripcion: texto(3, 500, "Describe el diagnóstico."),
  tipo: z.enum(["presuntivo", "definitivo"]).default("presuntivo"),
  principal: z.enum(["0", "1"]).default("0"),
});

export const esquemaMedicion = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  fechaHora: z.string().trim().optional().or(z.literal("")).transform((v) => v || null),
  pesoKg: z.coerce.number().positive().max(400).optional().or(z.literal("")).transform((v) => v || null),
  tallaCm: z.coerce.number().positive().max(300).optional().or(z.literal("")).transform((v) => v || null),
  presionSistolica: z.coerce.number().int().positive().max(300).optional().or(z.literal("")).transform((v) => v || null),
  presionDiastolica: z.coerce.number().int().positive().max(200).optional().or(z.literal("")).transform((v) => v || null),
  temperatura: z.coerce.number().positive().max(50).optional().or(z.literal("")).transform((v) => v || null),
  frecuenciaCardiaca: z.coerce.number().int().positive().max(300).optional().or(z.literal("")).transform((v) => v || null),
  saturacion: z.coerce.number().int().positive().max(100).optional().or(z.literal("")).transform((v) => v || null),
  glucosa: z.coerce.number().positive().max(1000).optional().or(z.literal("")).transform((v) => v || null),
  notas: textoOpcional(1000),
});

export const esquemaPrescripcion = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  indicacionesGenerales: textoOpcional(2000),
  items: z
    .array(
      z.object({
        medicamento: texto(2, 200, "Ingresa el medicamento."),
        presentacion: textoOpcional(120),
        dosis: textoOpcional(120),
        via: textoOpcional(80),
        frecuencia: textoOpcional(120),
        duracion: textoOpcional(120),
        cantidad: textoOpcional(80),
        indicaciones: textoOpcional(500),
      }),
    )
    .min(1, "Agrega al menos un medicamento."),
});

export const esquemaEmbarazo = z.object({
  pacienteId: uuid,
  fum: fecha.optional().or(z.literal("")).transform((v) => v || null),
  fpp: fecha.optional().or(z.literal("")).transform((v) => v || null),
  gestas: z.coerce.number().int().min(0).max(30).optional().or(z.literal("")).transform((v) => v || null),
  partos: z.coerce.number().int().min(0).max(30).optional().or(z.literal("")).transform((v) => v || null),
  abortos: z.coerce.number().int().min(0).max(30).optional().or(z.literal("")).transform((v) => v || null),
  cesareas: z.coerce.number().int().min(0).max(30).optional().or(z.literal("")).transform((v) => v || null),
  riesgo: z.enum(["bajo", "alto", "no_definido"]).default("no_definido"),
  notas: textoOpcional(2000),
});

export const esquemaControlPrenatal = z.object({
  pacienteId: uuid,
  embarazoId: uuid,
  fecha: fecha,
  edadGestacionalSemanas: z.coerce.number().int().min(0).max(50).optional().or(z.literal("")).transform((v) => v || null),
  edadGestacionalDias: z.coerce.number().int().min(0).max(6).optional().or(z.literal("")).transform((v) => v || null),
  pesoKg: z.coerce.number().positive().max(400).optional().or(z.literal("")).transform((v) => v || null),
  presionSistolica: z.coerce.number().int().positive().max(300).optional().or(z.literal("")).transform((v) => v || null),
  presionDiastolica: z.coerce.number().int().positive().max(200).optional().or(z.literal("")).transform((v) => v || null),
  alturaUterinaCm: z.coerce.number().positive().max(100).optional().or(z.literal("")).transform((v) => v || null),
  fcfLpm: z.coerce.number().int().positive().max(300).optional().or(z.literal("")).transform((v) => v || null),
  presentacion: textoOpcional(120),
  edema: textoOpcional(120),
  proteinuria: textoOpcional(120),
  proximoControl: fecha.optional().or(z.literal("")).transform((v) => v || null),
  notas: textoOpcional(2000),
});

export const esquemaEcografia = z.object({
  pacienteId: uuid,
  embarazoId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  fecha: fecha,
  tipo: texto(2, 120, "Ingresa el tipo de ecografía."),
  hallazgos: textoOpcional(6000),
  conclusiones: textoOpcional(6000),
});

export const esquemaOrdenLaboratorio = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  observaciones: textoOpcional(2000),
});

export const esquemaResultadoLaboratorio = z.object({
  ordenId: uuid,
  examen: texto(2, 200, "Ingresa el examen."),
  valor: texto(1, 200, "Ingresa el resultado."),
  unidad: textoOpcional(80),
  rangoReferencia: textoOpcional(200),
  flag: z.enum(["normal", "alto", "bajo", "critico", "no_definido"]).default("no_definido"),
  observaciones: textoOpcional(1000),
  validar: z.enum(["0", "1"]).default("0"),
});

export const esquemaSeguimiento = z.object({
  pacienteId: uuid,
  consultaId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  tipo: texto(2, 100, "Ingresa el tipo de seguimiento."),
  descripcion: texto(3, 2000, "Describe el seguimiento."),
  fechaProgramada: fecha,
  asignadoA: uuid.optional().or(z.literal("")).transform((v) => v || null),
});

export const esquemaCita = z.object({
  pacienteId: uuid,
  servicioId: z.coerce.number().int().positive("Selecciona un servicio."),
  profesionalId: uuid.optional().or(z.literal("")).transform((v) => v || null),
  inicio: z.string().min(16, "Indica fecha y hora."),
  duracionMinutos: z.coerce.number().int().min(5).max(240).default(30),
  estado: z.enum(["solicitada", "confirmada", "en_espera", "atendida", "cancelada", "no_asistio", "reprogramada"]).default("confirmada"),
  motivoAdministrativo: textoOpcional(500),
});

export const esquemaHorario = z.object({
  profesionalId: uuid,
  diaSemana: z.coerce.number().int().min(0).max(6),
  horaInicio: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  horaFin: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  vigenteDesde: fecha.optional().or(z.literal("")).transform((v) => v || null),
  vigenteHasta: fecha.optional().or(z.literal("")).transform((v) => v || null),
});

export const esquemaServicioAdmin = z.object({
  nombre: texto(2, 160, "Ingresa el nombre."),
  descripcion: textoOpcional(1000),
  especialidadId: z.coerce.number().int().positive("Selecciona un área."),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Usa minúsculas, números y guiones."),
  duracionMinutos: z.coerce.number().int().min(5).max(240).default(30),
  precio: z.coerce.number().min(0).optional().or(z.literal("")).transform((v) => v || null),
  visibleWeb: z.enum(["0", "1"]).default("1"),
});

export type ResultadoAccion =
  | { ok: true; mensaje: string; id?: string; referencia?: string }
  | { ok: false; mensaje: string; campos?: Record<string, string[]> };
