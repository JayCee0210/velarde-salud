<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Reglas permanentes VELARDE DIGITAL

- No ejecutar migraciones, `db push`, `db reset` ni cambios remotos de Supabase sin autorización explícita.
- No inventar tablas, columnas, credenciales, horarios, precios, registros profesionales, fotos, reseñas ni disponibilidad.
- Toda información clínica se consulta y modifica únicamente en servidor, con sesión, clínica, rol, permiso y recurso validados.
- Nunca usar `service_role` en código cliente ni guardar expedientes en almacenamiento del navegador.
- Mantener `es` y `pt`, accesibilidad móvil desde 360 px y navegación contextual por rol.
- Ejecutar `npm run lint`, `npm run typecheck`, `npm test` y `npm run build`; reportar resultados reales.
