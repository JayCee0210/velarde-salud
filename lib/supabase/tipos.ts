// Tipos del esquema de Supabase (VELARDE DIGITAL)
// Ajusta/reescribe este archivo cuando cambies `supabase/schema.sql`
// (ideal: regenerar con `supabase gen types typescript`).

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface EspecialidadRow {
  id: number;
  nombre: string;
  descripcion: string | null;
  activa: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface ServicioRow {
  id: number;
  especialidad_id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  creado_en: string;
  actualizado_en: string;
}

export interface PacienteRow {
  id: string;
  ci: string | null;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  correo: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type Especialidad = EspecialidadRow;
export type Servicio = ServicioRow;
export type Paciente = PacienteRow;

export interface Database {
  public: {
    Tables: {
      especialidades: {
        Row: EspecialidadRow;
        Insert: Partial<EspecialidadRow> & { nombre: string };
        Update: Partial<EspecialidadRow>;
        Relationships: [];
      };
      servicios: {
        Row: ServicioRow;
        Insert: Partial<ServicioRow> & {
          especialidad_id: number;
          nombre: string;
        };
        Update: Partial<ServicioRow>;
        Relationships: [];
      };
      pacientes: {
        Row: PacienteRow;
        Insert: Partial<PacienteRow> & { nombre_completo: string };
        Update: Partial<PacienteRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
