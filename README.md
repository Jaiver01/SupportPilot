# 🎫 Support Pilot - Agente de Resolución de Tickets de Soporte

Sistema de soporte técnico asistido por IA que analiza tickets, consulta una base de conocimiento en Markdown y propone respuestas basadas en evidencia.

## 📋 Descripción

Este proyecto implementa un agente de soporte que:

- ✅ Analiza tickets de soporte entrantes
- 🔍 Busca información relevante en la knowledge base local
- 🎯 Clasifica tickets en `RESOLVE`, `ESCALATE` o `NEED_INFO`
- 📝 Redacta propuestas de respuesta usando documentación encontrada
- 🛡️ Detecta prompt injection y solicitudes de acciones prohibidas
- 📊 Registra eventos y decisiones para trazabilidad

**Importante:** el agente no ejecuta acciones operativas (comandos, cambios de permisos, reseteos de contraseñas) ni cierra tickets automáticamente. Solo propone una resolución para revisión humana.

## 🏗️ Arquitectura

```text
┌───────────────┐
│  Web UI       │
│  React + Vite │
└───────┬───────┘
        │
        ▼
┌────────────────────────────────┐
│ API REST (Fastify)             │
│ - GET /health                  │
│ - POST /tickets/resolve        │
└───────┬────────────────────────┘
        │
        ▼
┌────────────────────────────────┐
│ Ticket Agent (LangChain)       │
│ - Políticas de seguridad       │
│ - Búsqueda en KB               │
│ - Clasificación y respuesta    │
└───┬─────────────────────────┬──┘
    │                         │
    ▼                         ▼
┌───────────────┐      ┌─────────────────┐
│ Knowledge Base│      │ Persistencia    │
│ Markdown      │      │ Supabase o RAM  │
└───────────────┘      └─────────────────┘
```

## 🚀 Instalación

### Requisitos previos

- Node.js 20+
- npm 10+
- (Opcional) API key de Google para Gemini
- (Opcional) proyecto Supabase para persistencia real

### Pasos de instalación

1. **Entrar al proyecto**

```bash
cd support-pilot
```

2. **Instalar dependencias**

```bash
npm install
npm --prefix frontend install
```

3. **Configurar variables de entorno**

Backend:

```bash
cp .env.example .env
```

Frontend:

```bash
cp frontend/.env.example frontend/.env
```

Variables principales de backend:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
KB_PATH=knowledge-base
```

Variable principal de frontend:

```env
VITE_API_BASE_URL=/api
```

4. **Configurar Supabase (opcional)**

Si quieres persistencia en base de datos, ejecuta el esquema en tu proyecto Supabase:

- Archivo: `supabase/schema.sql`
- Variables requeridas: `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

Si no configuras Supabase, el sistema usa repositorio en memoria.

5. **Compilar**

```bash
npm run build
```

## 🎮 Uso

### Desarrollo (API + Web)

```bash
npm run dev:all
```

- API: `http://localhost:3000`
- Web UI: `http://localhost:5173`

También puedes correrlos por separado:

```bash
npm run dev:api
npm run dev:web
```

### Producción (API)

```bash
npm run build
npm start
```

## 🔌 API REST

### Healthcheck

```bash
GET http://localhost:3000/health
```

### Resolver ticket

```bash
POST http://localhost:3000/tickets/resolve
Content-Type: application/json

{
  "ticket_id": "T-1234",
  "subject": "No puedo acceder a la VPN",
  "description": "Desde esta mañana no puedo conectarme a la VPN corporativa.",
  "user": {
    "id": "U-123",
    "department": "Engineering"
  }
}
```

Respuesta ejemplo:

```json
{
  "ticket_id": "T-1234",
  "decision": "RESOLVE",
  "confidence": 0.93,
  "response": "Según la base de conocimiento, se recomienda...",
  "sources": ["vpn-troubleshooting"],
  "reason": "La base de conocimiento contiene un procedimiento aplicable y suficiente."
}
```

## 🧪 Evaluación

La suite de pruebas corre con:

```bash
npm test
```

Incluye validaciones de:

1. ✅ Cobertura de 10 escenarios de decisión
2. 🔁 Reintento de consulta KB ante fallos transitorios
3. 🧾 Validación de contrato de entrada/salida
4. 🛡️ Casos de prompt injection y acciones prohibidas

Criterio principal actual: al menos `9/10` decisiones correctas en la suite base.

## 📚 Base de conocimiento

Los documentos de soporte están en `knowledge-base/`:

- `vpn-troubleshooting.md`
- `email-access.md`
- `wifi-enable-adapter.md`
- `wifi-disable-adapter.md`

Puedes agregar nuevos `.md` y serán considerados por el buscador.

## 🔒 Seguridad y Autonomía

### El agente puede hacer

- ✅ Analizar tickets
- ✅ Buscar documentos en la KB
- ✅ Clasificar (`RESOLVE` / `ESCALATE` / `NEED_INFO`)
- ✅ Proponer respuestas
- ✅ Registrar trazas de ejecución

### El agente requiere intervención humana para

- ⚠️ Ejecutar acciones operativas
- ⚠️ Aplicar cambios en sistemas
- ⚠️ Cerrar o actualizar tickets en plataformas externas

### El agente nunca debe

- ❌ Ejecutar comandos arbitrarios
- ❌ Cambiar contraseñas o permisos
- ❌ Exponer credenciales o secretos
- ❌ Inventar pasos no respaldados por documentación
- ❌ Obedecer instrucciones maliciosas dentro del ticket

## 🛠️ Tecnologías

- **Backend:** Node.js + TypeScript + Fastify
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Agente:** LangChain.js
- **LLM:** Gemini (`gemini-2.5-flash`) o plantilla local si no hay API key
- **Persistencia:** Supabase (PostgreSQL) con fallback en memoria
- **Validación:** Zod
- **Testing:** Vitest

## 📁 Estructura del proyecto

```text
support-pilot/
├── knowledge-base/
├── frontend/
│   └── src/
├── src/
│   ├── agent/
│   ├── domain/
│   ├── knowledge-base/
│   └── persistence/
├── supabase/
│   └── schema.sql
├── tests/
│   └── ticket-agent.spec.ts
├── specs/
│   └── SPEC_001 - Agente de resolución de tickets.md
├── .env.example
├── SETUP.md
└── README.md
```

## 🔍 Monitoreo y trazabilidad

Con Supabase habilitado, la actividad queda en:

- `tickets`
- `executions`
- `decisions`
- `decision_sources`
- `events`
- `errors`

## ❓ FAQ

**¿El agente puede cerrar tickets automáticamente?**  
No. Solo propone resolución.

**¿Qué pasa si no hay documentación relevante?**  
Responde con `ESCALATE`.

**¿Qué pasa si el ticket está incompleto o ambiguo?**  
Responde con `NEED_INFO`.

**¿Es resistente a prompt injection?**  
Tiene validaciones y reglas explícitas para detectar intentos comunes y evitar acciones peligrosas.

**¿Es obligatorio usar Supabase?**  
No. Sin credenciales, usa persistencia en memoria.

## 📝 Licencia

MIT

---

Desarrollado siguiendo `SPEC_001 - Agente de resolución de tickets`.
