export const PERMISOS = {
  panelMedico: "panel.medico",
  panelRecepcion: "panel.recepcion",
  panelAdmin: "panel.admin",
  panelLaboratorio: "panel.laboratorio",
  agendaLeer: "agenda.leer",
  agendaGestionar: "agenda.gestionar",
  solicitudesGestionar: "solicitudes.gestionar",
  pacientesLeer: "pacientes.leer",
  pacientesGestionar: "pacientes.gestionar",
  pacientesDemografia: "pacientes.demografia",
  clinicoLeer: "clinico.leer",
  clinicoEscribir: "clinico.escribir",
  obstetriciaGestionar: "obstetricia.gestionar",
  prescripcionesGestionar: "prescripciones.gestionar",
  documentosLeer: "documentos.leer",
  documentosGestionar: "documentos.gestionar",
  laboratorioLeer: "laboratorio.leer",
  laboratorioGestionar: "laboratorio.gestionar",
  seguimientosGestionar: "seguimientos.gestionar",
  reportesLeer: "reportes.leer",
  personalGestionar: "personal.gestionar",
  rolesGestionar: "roles.gestionar",
  serviciosGestionar: "servicios.gestionar",
  configuracionGestionar: "configuracion.gestionar",
  contenidoGestionar: "contenido.gestionar",
  auditoriaLeer: "auditoria.leer",
  notificacionesGestionar: "notificaciones.gestionar",
} as const;

export type Permiso = (typeof PERMISOS)[keyof typeof PERMISOS];

export type RolPanel = "medico" | "recepcion" | "administrador" | "laboratorio";

export const PERMISOS_POR_ROL: Record<RolPanel, Permiso[]> = {
  medico: [
    PERMISOS.panelMedico,
    PERMISOS.agendaLeer,
    PERMISOS.pacientesLeer,
    PERMISOS.pacientesGestionar,
    PERMISOS.clinicoLeer,
    PERMISOS.clinicoEscribir,
    PERMISOS.obstetriciaGestionar,
    PERMISOS.prescripcionesGestionar,
    PERMISOS.documentosLeer,
    PERMISOS.documentosGestionar,
    PERMISOS.laboratorioLeer,
    PERMISOS.seguimientosGestionar,
    PERMISOS.reportesLeer,
  ],
  recepcion: [
    PERMISOS.panelRecepcion,
    PERMISOS.agendaLeer,
    PERMISOS.agendaGestionar,
    PERMISOS.solicitudesGestionar,
    PERMISOS.pacientesLeer,
    PERMISOS.pacientesGestionar,
    PERMISOS.pacientesDemografia,
    PERMISOS.notificacionesGestionar,
  ],
  administrador: [
    PERMISOS.panelAdmin,
    PERMISOS.personalGestionar,
    PERMISOS.rolesGestionar,
    PERMISOS.serviciosGestionar,
    PERMISOS.configuracionGestionar,
    PERMISOS.contenidoGestionar,
    PERMISOS.reportesLeer,
    PERMISOS.auditoriaLeer,
  ],
  laboratorio: [
    PERMISOS.panelLaboratorio,
    PERMISOS.laboratorioLeer,
    PERMISOS.laboratorioGestionar,
    PERMISOS.pacientesDemografia,
    PERMISOS.documentosLeer,
  ],
};

export function permisosDeRol(rol: string): Permiso[] {
  return PERMISOS_POR_ROL[rol as RolPanel] ?? [];
}

export function esRolPanel(valor: string): valor is RolPanel {
  return valor in PERMISOS_POR_ROL;
}

export function rutaPanelPorRol(rol: RolPanel): string {
  switch (rol) {
    case "medico":
      return "/panel/medico";
    case "recepcion":
      return "/panel/recepcion";
    case "administrador":
      return "/panel/admin";
    case "laboratorio":
      return "/panel/laboratorio";
  }
}

export function etiquetaRol(rol: string): string {
  switch (rol) {
    case "medico":
      return "Médico";
    case "recepcion":
      return "Recepción";
    case "administrador":
      return "Administración";
    case "laboratorio":
      return "Laboratorio";
    default:
      return rol;
  }
}
