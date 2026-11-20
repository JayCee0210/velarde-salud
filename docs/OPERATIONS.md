# Operaciones

## Proveedores externos

WhatsApp, correo, SMS y LLM no se consideran configurados hasta disponer de credenciales reales y una prueba en entorno no productivo. La aplicación no muestra envíos exitosos cuando un proveedor no responde.

## Incidentes

Ante sospecha de exposición: revocar/rotar claves, preservar auditoría mínima, bloquear el acceso afectado, revisar RLS y documentar alcance. No incluir datos clínicos en tickets, logs o capturas.

## Datos de prueba

Usar únicamente fixtures sintéticos. Probar concurrencia, aislamiento multiclínica y permisos en un proyecto de desarrollo separado.
