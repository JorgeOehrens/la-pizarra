# Tech Stack — Decisiones y Justificaciones

> Agente: System Architect Agent
> Cada decisión incluye: qué elegimos, por qué, y qué consideramos y rechazamos.

---

## Frontend

### Next.js 14+ con App Router ✅
**Por qué:** 
- Server Components reduce JS en el cliente (crítico para mobile)
- App Router permite layouts compartidos entre rutas del mismo equipo
- El proyecto ya existe con Next.js

**Alternativas consideradas:**
- Remix — excelente para formularios pero ecosistema más pequeño
- SvelteKit — gran DX pero el proyecto ya está en React

### Tailwind CSS ✅
**Por qué:**
- Velocidad de desarrollo
- Mobile-first por defecto
- El proyecto ya tiene Tailwind configurado

### shadcn/ui ✅
**Por qué:**
- Componentes accesibles y personalizables
- Se copian al repo, no son dependencias negras
- El proyecto ya tiene `components.json`

---

## Backend & Base de Datos

### Supabase ✅
**Por qué:**
- Postgres real (no un NoSQL que luego limita)
- Auth integrado con Row Level Security
- Storage para logos y fotos
- SDK de TypeScript con tipos autogenerados
- Plan gratuito suficiente para MVP
- Compatible con conexión MCP futura

**Alternativas consideradas:**
- PlanetScale — solo MySQL, sin RLS nativo
- Firebase — NoSQL limita las queries de stats
- Railway + Postgres — más control pero más DevOps
- Prisma + Neon — buena opción pero duplica capas

**Alternativas rechazadas:**
- MongoDB — el modelo relacional es superior para stats de fútbol
- SQLite — no escala para multi-tenant

---

## Estado del Cliente

### TanStack Query (React Query) ✅
**Por qué:**
- Caché inteligente de datos del servidor
- Optimistic updates para registrar goles
- Stale-while-revalidate nativo
- Devtools excelentes

### Zustand (estado local)
**Por qué:**
- Estado mínimo del cliente (equipo seleccionado, usuario activo)
- Más simple que Redux para nuestro caso de uso

---

## Autenticación

### Supabase Auth — Fase 1: Anonymous + Username ✅
**Decisión:**
- Fase 1: Usuarios anónimos que pueden reclamar su cuenta con username/password
- No se requiere email
- El username se guarda en `profiles.username`

**Flujo técnico:**
```
1. Usuario abre la app
2. Supabase crea sesión anónima automáticamente
3. Usuario elige username + contraseña para "reclamar" la cuenta
4. La sesión anónima se convierte en cuenta permanente
```

Ver flujo completo en [[04-Auth/Auth-Flow]]

---

## Storage

### Supabase Storage ✅
**Uso:**
- Logos de equipos: `bucket: team-logos`
- Fotos de perfil: `bucket: avatars`

**Configuración:**
- Acceso público para logos de equipos (cualquiera puede ver el logo)
- Acceso autenticado para avatars

---

## Deploy

### Vercel ✅
**Por qué:**
- Integración nativa con Next.js
- Preview deployments para cada PR
- Edge Network para performance global

---

## Herramientas de Desarrollo

| Herramienta | Uso |
|-------------|-----|
| TypeScript | Tipos en todo el proyecto |
| supabase CLI | Migraciones locales |
| supabase gen types | Tipos autogenerados desde el schema |
| ESLint + Prettier | Calidad de código |
| Husky | Pre-commit hooks |

---

## Decisión sobre pnpm vs npm

El proyecto usa `pnpm` (hay `pnpm-lock.yaml`). Se mantiene pnpm.

---

*System Architect Agent — LaPizarra Knowledge Base*
