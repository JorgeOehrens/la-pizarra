# Arquitectura del Sistema

> Agente: System Architect Agent
> Decisión: Arquitectura elegida, módulos, flujo de datos.

---

## Stack Tecnológico Decisión Final

```
Frontend:     Next.js 14+ (App Router)
Estilos:      Tailwind CSS + shadcn/ui
DB:           Supabase (Postgres + Auth + Storage + Realtime)
Auth:         Supabase Auth (Anonymous + Username en fase 1)
Storage:      Supabase Storage (logos de equipos, fotos de perfil)
ORM/Types:    supabase-js + TypeScript types autogenerados
Deploy:       Vercel
State:        Zustand (client state) + TanStack Query (server state)
```

Ver detalle en [[02-Architecture/Tech-Stack]]

---

## Diagrama de Módulos

```
┌─────────────────────────────────────────────────────────┐
│                     NEXT.JS APP                          │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Auth    │  │  Teams   │  │ Matches  │  │ Stats  │  │
│  │  Module  │  │  Module  │  │  Module  │  │ Module │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       │             │             │              │       │
│  ┌────▼─────────────▼─────────────▼──────────────▼────┐  │
│  │              Supabase Client Layer                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │         SUPABASE            │
              │                            │
              │  ┌────────┐  ┌──────────┐  │
              │  │ Postgres│  │ Storage  │  │
              │  │   DB   │  │ (logos)  │  │
              │  └────────┘  └──────────┘  │
              │                            │
              │  ┌────────┐  ┌──────────┐  │
              │  │  Auth  │  │Realtime  │  │
              │  │        │  │(futuro)  │  │
              │  └────────┘  └──────────┘  │
              └────────────────────────────┘
```

---

## Módulos de la Aplicación

### Module 1: Auth Module
**Responsabilidad:** Registro, login, sesión, gestión de identidad
**Páginas:**
- `/login` — Login con username/password
- `/register` — Registro nuevo usuario
- `/join/[token]` — Unirse por link de invitación
- `/join` — Unirse por código manual

**Dependencias:** Supabase Auth

---

### Module 2: Teams Module
**Responsabilidad:** CRUD de equipos, gestión de plantilla, invitaciones
**Páginas:**
- `/teams` — Mis equipos
- `/teams/new` — Crear equipo
- `/teams/[teamId]` — Dashboard del equipo
- `/teams/[teamId]/squad` — Plantilla
- `/teams/[teamId]/settings` — Configuración del equipo

**Dependencias:** Auth Module, Storage (logos)

---

### Module 3: Matches Module
**Responsabilidad:** Registro y gestión de partidos, eventos
**Páginas:**
- `/teams/[teamId]/matches` — Historial de partidos
- `/teams/[teamId]/matches/new` — Crear partido
- `/teams/[teamId]/matches/[matchId]` — Detalle del partido
- `/teams/[teamId]/matches/[matchId]/events` — Registrar eventos

**Dependencias:** Teams Module

---

### Module 4: Stats Module
**Responsabilidad:** Estadísticas de jugadores y equipos
**Páginas:**
- `/teams/[teamId]/stats` — Stats del equipo
- `/teams/[teamId]/players/[playerId]` — Perfil del jugador

**Dependencias:** Matches Module, Teams Module

---

## Patrones de Datos

### Server Components (RSC) — datos que NO cambian frecuentemente
- Historial de partidos
- Perfil de jugador
- Estadísticas del equipo

### Client Components — datos interactivos
- Formulario de crear partido
- Registrar gol en tiempo real
- Búsqueda de jugadores

### Estrategia de Caché
```
Perfil de equipo:    revalidate: 60s
Historial partidos:  revalidate: 30s
Stats jugador:       revalidate: 30s
Partido en curso:    revalidate: 0 (real-time)
```

---

## Consideraciones de Escalabilidad

| Componente | MVP | Futuro |
|------------|-----|--------|
| Auth | Anonymous + Username | Email, OAuth, Magic Link |
| Multi-equipo | Soportado en modelo | UI para cambiar de equipo |
| Liga | No implementado | Capa de organización sobre equipos |
| Realtime | No (polling) | Supabase Realtime para partido en vivo |
| Offline | No | PWA con sync offline |
| Mobile | Web responsive | React Native (modelo de datos compatible) |

---

## Seguridad

- **Row Level Security (RLS)** en todas las tablas de Supabase
- Solo los miembros de un equipo pueden ver los datos de ese equipo
- Solo los admins pueden modificar datos del equipo
- Los tokens de invitación expiran en 7 días
- Ver políticas detalladas en [[03-Database/RLS-Policies]]

---

*System Architect Agent — LaPizarra Knowledge Base*
