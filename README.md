# VELARDE DIGITAL

Sistema clínico del **Centro Médico Especializado VELARDE**
(Dr. Marco Antonio Velarde Melgar — Guayaramerín, Bolivia).

Áreas médicas: Ginecología · Obstetricia · Prenatal · Ecografías ·
Medicina General · Laboratorios.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript + Tailwind CSS
- [Supabase](https://supabase.com) (PostgreSQL + RLS)

## Inicio rápido

```bash
cp .env.example .env.local   # y pega tus claves reales de Supabase
npm install
npm run dev
```

Consulta `supabase/schema.sql` para el esquema (tablas, triggers, RLS y
datos semilla) y `docs/README.md` para la documentación completa del
proyecto.

## Seguridad

- Los valores reales van **solo** en `.env.local` (ignorado por Git).
- Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el cliente.
- La protección de datos se aplica con **Row Level Security (RLS)** en Supabase.
