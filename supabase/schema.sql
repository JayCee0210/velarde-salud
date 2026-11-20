-- ============================================================
-- VELARDE DIGITAL — Esquema SQL (PostgreSQL / Supabase)
-- Centro Médico Especializado VELARDE
-- Dr. Marco Antonio Velarde Melgar — Guayaramerín, Bolivia
--
-- IMPORTANTE:
-- Este archivo es el RESPALDO del esquema de la base de datos.
-- Aquí se conservan:
--   * Tablas
--   * Triggers
--   * Políticas RLS
--   * Datos semilla (seed)
--
-- CONTENIDO ACTUAL: esquema inicial propuesto (áreas médicas,
-- servicios y pacientes) para arrancar VELARDE DIGITAL.
-- Si ya tienes tu SQL real en Supabase, pégalo aquí reemplazando
-- este contenido (o fusionándolo) para que el respaldo quede
-- completo.
--
-- Para aplicar cambios en un proyecto nuevo:
--   1. Copia el SQL completo desde el Editor SQL de Supabase
--      (Dashboard → SQL Editor).
--   2. Ejecútalo en un proyecto de desarrollo antes de
--      llevarlo a producción.
-- ============================================================

-- ------------------------------------------------------------
-- 1) TABLAS
-- ------------------------------------------------------------

-- Áreas médicas de la clínica (catálogo público)
create table if not exists public.especialidades (
  id            bigint generated always as identity primary key,
  nombre        text not null unique,
  descripcion   text,
  activa        boolean not null default true,
  creado_en     timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- Servicios vinculados a un área médica
create table if not exists public.servicios (
  id              bigint generated always as identity primary key,
  especialidad_id bigint not null references public.especialidades (id) on delete restrict,
  nombre          text not null,
  descripcion     text,
  activo          boolean not null default true,
  creado_en       timestamptz not null default now(),
  actualizado_en  timestamptz not null default now()
);

-- Pacientes (datos clínicos sensibles: RLS estricta, sin acceso anónimo)
create table if not exists public.pacientes (
  id               uuid primary key default gen_random_uuid(),
  ci               text,                     -- cédula de identidad
  nombre_completo  text not null,
  fecha_nacimiento date,
  telefono         text,
  correo           text,
  creado_en        timestamptz not null default now(),
  actualizado_en   timestamptz not null default now()
);

create index if not exists servicios_especialidad_id_idx
  on public.servicios (especialidad_id);

create index if not exists pacientes_nombre_idx
  on public.pacientes (lower(nombre_completo));

-- ------------------------------------------------------------
-- 2) TRIGGERS (marca automática de actualización)
-- ------------------------------------------------------------

create or replace function public.marcar_actualizado_en()
returns trigger
language plpgsql
as $$
begin
  new.actualizado_en = now();
  return new;
end;
$$;

drop trigger if exists especialidades_marcar_actualizado_en on public.especialidades;
create trigger especialidades_marcar_actualizado_en
  before update on public.especialidades
  for each row execute function public.marcar_actualizado_en();

drop trigger if exists servicios_marcar_actualizado_en on public.servicios;
create trigger servicios_marcar_actualizado_en
  before update on public.servicios
  for each row execute function public.marcar_actualizado_en();

drop trigger if exists pacientes_marcar_actualizado_en on public.pacientes;
create trigger pacientes_marcar_actualizado_en
  before update on public.pacientes
  for each row execute function public.marcar_actualizado_en();

-- ------------------------------------------------------------
-- 3) POLÍTICAS RLS (Row Level Security)
-- ------------------------------------------------------------

alter table public.especialidades enable row level security;
alter table public.servicios enable row level security;
alter table public.pacientes enable row level security;

-- Catálogo público: cualquiera puede leer áreas y servicios
drop policy if exists especialidades_lectura_publica on public.especialidades;
create policy especialidades_lectura_publica
  on public.especialidades
  for select
  to anon, authenticated
  using (true);

drop policy if exists servicios_lectura_publica on public.servicios;
create policy servicios_lectura_publica
  on public.servicios
  for select
  to anon, authenticated
  using (true);

-- Escritura del catálogo: solo usuarios autenticados (personal).
-- En producción, restringir por rol (tabla de personal o custom claim).
drop policy if exists especialidades_escritura_personal on public.especialidades;
create policy especialidades_escritura_personal
  on public.especialidades
  for all
  to authenticated
  using (true)
  with check (true);

drop policy if exists servicios_escritura_personal on public.servicios;
create policy servicios_escritura_personal
  on public.servicios
  for all
  to authenticated
  using (true)
  with check (true);

-- Pacientes: NINGÚN acceso anónimo (sin policy para `anon` = 0 filas).
-- Solo personal autenticado. En producción, restringir además a
-- usuarios con rol de personal (p. ej. tabla `personal` o claim JWT).
drop policy if exists pacientes_lectura_personal on public.pacientes;
create policy pacientes_lectura_personal
  on public.pacientes
  for select
  to authenticated
  using (true);

drop policy if exists pacientes_escritura_personal on public.pacientes;
create policy pacientes_escritura_personal
  on public.pacientes
  for insert
  to authenticated
  with check (true);

drop policy if exists pacientes_actualizacion_personal on public.pacientes;
create policy pacientes_actualizacion_personal
  on public.pacientes
  for update
  to authenticated
  using (true)
  with check (true);

-- ------------------------------------------------------------
-- 4) DATOS SEMILLA (áreas médicas de la clínica)
-- ------------------------------------------------------------

insert into public.especialidades (nombre, descripcion)
values
  ('Ginecología',        'Consulta y tratamiento de la salud femenina.'),
  ('Obstetricia',        'Atención del embarazo y el parto.'),
  ('Prenatal',           'Control prenatal y seguimiento de la gestante.'),
  ('Ecografías',         'Estudios de imagen por ecografía.'),
  ('Medicina General',   'Atención médica general y prevención.'),
  ('Laboratorios',       'Análisis y estudios de laboratorio.')
on conflict (nombre) do nothing;

insert into public.servicios (especialidad_id, nombre, descripcion)
select e.id, s.nombre, s.descripcion
from (values
  ('Ginecología',      'Consulta ginecológica',      'Evaluación ginecológica de rutina.'),
  ('Obstetricia',      'Consulta de obstetricia',    'Seguimiento del embarazo.'),
  ('Prenatal',         'Control prenatal',           'Control periódico de la gestante.'),
  ('Ecografías',       'Ecografía obstétrica',       'Control del desarrollo fetal.'),
  ('Medicina General', 'Consulta médica general',    'Atención primaria y prevención.'),
  ('Laboratorios',     'Perfil de laboratorio',      'Análisis clínicos básicos.')
) as s(nombre_area, nombre, descripcion)
join public.especialidades e on e.nombre = s.nombre_area
where not exists (
  select 1 from public.servicios v
  where v.especialidad_id = e.id and v.nombre = s.nombre
);

-- ============================================================
-- FIN DEL ESQUEMA
-- ============================================================
