# Integración con Supabase

## Estado auditado

El único respaldo local disponible (`supabase/schema.sql`) define `especialidades`, `servicios` y `pacientes`. El código de la plataforma requiere además módulos multiclínica, agenda, historia clínica, obstetricia, laboratorio, documentos, personal y auditoría. No se presume que esas tablas existan en remoto y no se ejecutó ninguna operación remota.

## Regla de integración

La aplicación usa clientes SSR con la clave anónima y cookies de sesión. El cliente administrativo está restringido a servidor. Las consultas filtran `clinica_id` y las acciones validan permisos antes de escribir. La fuente de verdad debe ser una exportación autorizada del proyecto Supabase real.

## Pendiente de aprobación

Antes de habilitar los módulos clínicos se necesita:

1. Exportar tablas, relaciones, funciones, triggers, RLS y Storage del entorno de desarrollo.
2. Comparar nombres y columnas con `lib/datos` y `lib/acciones`.
3. Generar `lib/supabase/tipos.generado.ts` con `npm run types:db` usando ese esquema.
4. Probar políticas con usuarios sintéticos de médico, recepción, administración y laboratorio.
5. Revisar y aprobar una migración versionada en Supabase.

No se debe aplicar el esquema inicial incluido como si fuera el esquema de producción.
