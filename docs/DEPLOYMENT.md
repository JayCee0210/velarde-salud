# Despliegue

## Variables

Configurar en el entorno de despliegue las variables de `.env.example`. Nunca copiar valores reales al repositorio ni al navegador. `NEXT_PUBLIC_SITE_URL` debe apuntar al dominio canónico.

## Preflight

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
```

No ejecutar `db push`, `db reset` ni migraciones durante el despliegue de la aplicación. La base de datos se cambia por un proceso separado, revisado y aprobado.
