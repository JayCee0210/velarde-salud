# VELARDE DIGITAL

**Centro Médico Especializado VELARDE**
Dr. Marco Antonio Velarde Melgar — Guayaramerín, Bolivia

## Propósito

VELARDE DIGITAL es el sistema clínico digital del Centro Médico Especializado VELARDE. Su objetivo es centralizar la atención al paciente, la agenda médica, la historia clínica, los estudios (ecografías y laboratorios) y el seguimiento prenatal en una plataforma web moderna y segura construida con **Next.js + TypeScript** y respaldada por **Supabase (PostgreSQL)**.

## Áreas médicas atendidas

- Ginecología
- Obstetricia
- Prenatal (control de embarazo)
- Ecografías
- Medicina General
- Laboratorios

## Flujo de trabajo en Git + Supabase

1. **Git**: se trabaja por ramas (`feature/*`), con commits frecuentes y pull requests revisados antes de fusionar a la rama principal.
2. **Supabase**: el esquema SQL (tablas, triggers, políticas RLS y datos semilla) se respalda en `supabase/schema.sql`. Los cambios al esquema se:
   - prueban primero en el proyecto de desarrollo de Supabase;
   - se ejecutan en el SQL Editor;
   - se documentan/respaldan en `supabase/schema.sql`.
3. **Entornos**: local (`.env.local`) → desarrollo → producción. Las credenciales de cada entorno nunca se comparten entre sí ni se versionan.

## Reglas de seguridad de credenciales

- **Nunca** se suben claves reales a Git.
- Los valores reales van **solo** en `.env.local` (archivo ignorado por Git).
- `.env.example` es la plantilla pública: solo contiene nombres de variables y valores de ejemplo.
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicos por diseño: la protección real de datos se hace con **Row Level Security (RLS)** en Supabase.
- `SUPABASE_SERVICE_ROLE_KEY` **bypasea RLS**: se usa únicamente en código de servidor (Route Handlers / Server Actions) y jamás con prefijo `NEXT_PUBLIC_`.
- Antes de compartir una captura o un diff, revisar que no contenga secretos.
- Si una clave se filtra: rotarla inmediatamente desde el dashboard de Supabase (Settings → API).

## Estructura inicial

```
velarde-salud/
├── .gitignore                  # Excluye secretos, builds y temporales
├── .env.example                # Plantilla de variables (sin secretos reales)
├── .env.local                  # Valores reales (git ignorado, tú lo completas)
├── app/                        # Next.js App Router (vista inicial en español)
├── components/                 # Componentes de UI (panel de estado Supabase)
├── lib/
│   ├── supabase/               # Clientes: navegador, servidor y admin
│   └── clinica/                # Lógica de dominio (estado de conexión)
├── supabase/
│   └── schema.sql              # Respaldo del esquema SQL (tablas, triggers, RLS, seed)
└── docs/
    └── README.md               # Este documento
```

## Cómo correr la aplicación

```bash
npm install        # primera vez
npm run dev        # desarrollo → http://localhost:3000
npm run build      # build de producción
npm start          # servir el build de producción
npm run lint       # eslint
```

