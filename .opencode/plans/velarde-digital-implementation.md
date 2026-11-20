# VELARDE DIGITAL — Plan de implementación

Fecha de auditoría: 2026-11-19  
Estado: aprobado para ejecución local por fases; no autoriza cambios remotos en Supabase.

## 1. Hechos confirmados

- El repositorio es una aplicación Next.js App Router con Next 16.4.6, React 19.3.0, TypeScript, Tailwind 4, Supabase SSR, Zod, React Hook Form, Vitest y Playwright.
- El proyecto no tiene historial Git confirmado: todos los archivos de aplicación aparecen como no rastreados en la auditoría inicial.
- Existe internacionalización `es`/`pt`, rutas públicas, reserva, asistente, autenticación y un panel con navegación adaptada a móvil.
- El código de dominio ya contempla clínca, sucursal, roles, permisos, agenda, solicitudes, pacientes, consultas, notas, enmiendas, diagnósticos, mediciones, embarazos, laboratorio, documentos, seguimientos, personal y auditoría.
- El respaldo local `supabase/schema.sql` solo define `especialidades`, `servicios` y `pacientes`, con RLS insuficiente para el alcance multiclínica: no contiene `clinica_id`, identidad de personal ni políticas por recurso.
- El cliente de datos usa la clave anónima en servidor con cookies SSR; no se encontró exposición directa de `service_role` al cliente.
- `npm run typecheck` pasa actualmente.
- `npm run lint` falla por un error de React en el formulario de reserva y un `prefer-const`; hay advertencias adicionales.
- `npm test` no puede declarar éxito: no existen archivos de prueba.

## 2. Supuestos explícitos

- El esquema remoto puede ser más completo que el respaldo local, pero no se asume que exista ninguna tabla o columna sin confirmación mediante una exportación autorizada del esquema.
- Los datos institucionales confirmados son únicamente los incluidos en el plan maestro. Horarios, tarifas, fotografías, coordenadas, credenciales, experiencia y reseñas permanecen pendientes.
- La disponibilidad real solo se mostrará cuando las tablas y políticas correspondientes estén presentes y devuelvan datos; de lo contrario se ofrece solicitud/WhatsApp sin inventar horarios.
- Las pruebas locales usarán fixtures sintéticos y no ejecutarán escrituras contra producción.

## 3. Pendientes y bloqueadores de datos

Se necesita una exportación/inspección autorizada del esquema remoto, sin modificarlo, para validar nombres, relaciones, funciones, triggers, RLS, Storage y Edge Functions. El respaldo local requiere al menos confirmar o añadir de forma independiente:

- `clinicas`, `sucursales`, configuración institucional y módulos habilitados.
- `perfiles`, `miembros_clinica`, roles, permisos y relación profesional-clínica.
- Catálogo de servicios multiclínica, profesionales, horarios, bloqueos y disponibilidad.
- Solicitudes de cita, citas, historial de estados y restricciones contra solapamientos.
- Pacientes multiclínica y relaciones de atención.
- Consultas, notas inmutables, enmiendas, diagnósticos, mediciones y plantillas.
- Embarazos, controles prenatales y ecografías/documentos asociados.
- Órdenes y resultados de laboratorio.
- Prescripciones y sus ítems.
- Seguimientos, notificaciones, automatizaciones y auditoría.
- Artículos, preguntas frecuentes, Storage privado y políticas de acceso.

La migración propuesta debe permanecer en un archivo pendiente de aprobación; no se ejecutará mediante CLI, SQL Editor, `db push`, `db reset` ni despliegue.

## 4. Fases de construcción

### Fase 0 — Baseline y seguridad

- Corregir lint sin alterar el comportamiento seguro del formulario.
- Consolidar validación de entorno y clientes Supabase.
- Mantener todo acceso clínico en servidor, con sesión, clínica, rol, permiso y recurso.
- Asegurar que URLs, logs, analítica y asistente no transporten información clínica.
- Crear documentación operativa y de seguridad.

### Fase 1 — Web pública bilingüe y SEO

- Completar páginas públicas para inicio, centro, profesional, servicios individuales, embarazo, instalaciones, blog, FAQ, ubicación y contacto.
- Mantener contenido verificado y pendientes visibles; no crear credenciales, reseñas, fotos, precios ni disponibilidad ficticios.
- Implementar metadata, canonical, hreflang, Open Graph, sitemap, robots y JSON-LD solo con datos confirmados.
- Hacer que la reserva pública consulte disponibilidad real o degrade a solicitud administrativa/WhatsApp.
- Mantener portugués brasileño revisado en diccionarios y contenidos.

### Fase 2 — Captación, asistente y agenda

- Validar solicitudes públicas sin síntomas ni datos clínicos.
- Persistir solicitudes solo mediante tablas/policies confirmadas.
- Separar solicitud de cita confirmada y mostrar estado al usuario.
- Implementar agenda, horarios, bloqueos, estados y protección de concurrencia cuando el esquema real lo permita.
- Asistente FAQ bilingüe y guiado; IA opcional solo mediante backend configurado y sin funciones clínicas.

### Fase 3 — Panel por rol y móvil Android

- Médico: inicio contextual, agenda, ficha de paciente y flujo de atención con borrador/finalización/enmienda.
- Recepción: solicitudes, agenda, pacientes y contacto sin historia clínica.
- Administración: personal, roles, servicios, sucursales, contenido, configuración, estadísticas y auditoría sin acceso clínico implícito.
- Laboratorio: órdenes, resultados y documentos autorizados.
- Navegación inferior de 3–5 destinos, carga progresiva, tarjetas, touch targets, estados de guardado y errores.
- No guardar expedientes en localStorage, sessionStorage, IndexedDB ni caché pública.

### Fase 4 — Clínico integral

- Consultas, notas inmutables, enmiendas, diagnósticos, mediciones, prescripciones, documentos, laboratorio, embarazos, controles y seguimientos.
- Formularios cortos con Zod y React Hook Form donde aporte valor.
- Inmutabilidad aplicada en backend/RLS, no solo en UI.
- Contexto persistente del paciente en navegación y permisos de recurso.

### Fase 5 — Calidad, operación y producto SaaS

- Tests unitarios de validadores, permisos, fechas y contenido.
- Tests de integración con Supabase mockeado y fixtures sintéticos.
- E2E público y panel con entorno de prueba, sin producción.
- Verificación responsive 360 px, desktop y throttling de red.
- Documentación de despliegue, backup, monitoreo, incidentes, secretos y migraciones.
- Generación de tipos únicamente desde un esquema real autorizado.

## 5. Rutas objetivo

Públicas: `/{lang}`, `/centro-medico`, `/doctor`, `/servicios`, `/servicios/{slug}`, `/embarazo`, `/instalaciones`, `/blog`, `/blog/{slug}`, `/preguntas-frecuentes`, `/ubicacion`, `/contacto`, `/reservar`.

Panel contextual: `/panel`, `/panel/agenda`, `/panel/solicitudes`, `/panel/pacientes`, `/panel/pacientes/{id}`, `/panel/pacientes/{id}/atencion`, `/panel/embarazos`, `/panel/laboratorio`, `/panel/documentos`, `/panel/seguimiento`, `/panel/reportes`, `/panel/admin`.

## 6. Criterios de aceptación

- No se afirma que un módulo sea funcional cuando solo existe una vista.
- Cada operación clínica valida sesión, membresía, clínica, rol, permiso y recurso en servidor.
- No se cambia la base remota durante esta implementación.
- Lint, typecheck, tests y build se ejecutan y se reportan con su resultado real.
- Toda limitación por falta de esquema, credenciales o proveedor externo queda documentada.
