# SETUP - Support Pilot

Este documento describe la configuracion necesaria para levantar el proyecto completo (backend + frontend).

## 1) Requisitos

- Node.js 20+
- npm 10+

## 2) Instalacion de dependencias

Desde la raiz del proyecto [support-pilot/](/Users/jaiver/Projects/T/support-pilot):

```bash
npm install
npm --prefix frontend install
```

## 3) Configuracion de variables de entorno

### Backend

1. Copia [.env.example](/Users/jaiver/Projects/T/support-pilot/.env.example) a `.env`.
2. Define:

- `PORT`: puerto del backend (default: `3000`)
- `FRONTEND_ORIGIN`: origen permitido por CORS (default: `http://localhost:5173`)
- `GEMINI_MODEL`: modelo de Gemini (default: `gemini-2.5-flash`)
- `GOOGLE_API_KEY`: API key de Google (si no se define, se usa respuesta por plantilla)
- `KB_PATH`: ruta de la knowledge base Markdown (default: `knowledge-base`)
- `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`: requeridas solo para persistencia en Supabase

### Frontend

1. Copia [frontend/.env.example](/Users/jaiver/Projects/T/support-pilot/frontend/.env.example) a `frontend/.env`.
2. Define:

- `VITE_API_BASE_URL`: base URL para API (default: `/api`)

## 4) Supabase (opcional)

Si deseas persistencia real:

1. Crea un proyecto en Supabase.
2. Ejecuta el esquema SQL [schema.sql](/Users/jaiver/Projects/T/support-pilot/supabase/schema.sql).
3. Configura `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en `.env`.

Si no configuras Supabase, el sistema usa persistencia en memoria.

## 5) Ejecutar en desarrollo

### Opcion recomendada (todo junto)

```bash
npm run dev:all
```

### Opcion separada

Backend:

```bash
npm run dev:api
```

Frontend:

```bash
npm run dev:web
```

## 6) Verificacion

Typecheck:

```bash
npm run typecheck
```

Tests:

```bash
npm test
```

Build:

```bash
npm run build
```

## 7) Endpoints backend

- `GET /health`
- `POST /tickets/resolve`
