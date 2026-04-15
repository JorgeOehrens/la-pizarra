# Mapa de Módulos y Dependencias

> Agente: System Architect Agent
> Relaciones entre módulos, dependencias y orden de implementación.

---

## Árbol de Dependencias

```
                    ┌──────────────────┐
                    │   Auth Module    │ ← Sin dependencias
                    │ (profiles, auth) │
                    └────────┬─────────┘
                             │ dependen de →
                    ┌────────▼─────────┐
                    │   Teams Module   │
                    │ (teams, members, │
                    │  invitations)    │
                    └────────┬─────────┘
                             │ dependen de →
                    ┌────────▼─────────┐
                    │  Matches Module  │
                    │ (matches,        │
                    │  venues, events) │
                    └────────┬─────────┘
                             │ dependen de →
                    ┌────────▼─────────┐
                    │   Stats Module   │
                    │ (player_stats,   │
                    │  team_stats,     │
                    │  manual_adj)     │
                    └──────────────────┘
```

**Orden de implementación obligatorio:** Auth → Teams → Matches → Stats

---

## Rutas de la Aplicación

```
/ (landing - público)
├── /login
├── /register
├── /join
│   └── /join/[token]
│
└── (app) [auth requerida]
    ├── /dashboard
    ├── /profile
    └── /teams
        ├── /teams/new
        └── /teams/[teamId]
            ├── /teams/[teamId]/squad
            │   └── /teams/[teamId]/squad/[memberId]
            ├── /teams/[teamId]/matches
            │   ├── /teams/[teamId]/matches/new
            │   └── /teams/[teamId]/matches/[matchId]
            │       └── /teams/[teamId]/matches/[matchId]/events
            ├── /teams/[teamId]/stats
            ├── /teams/[teamId]/players/[playerId]
            └── /teams/[teamId]/settings
```

---

## API Routes

```
POST   /api/auth/register
POST   /api/auth/login

GET    /api/teams
POST   /api/teams
GET    /api/teams/[teamId]
PATCH  /api/teams/[teamId]
DELETE /api/teams/[teamId]

GET    /api/teams/[teamId]/members
POST   /api/teams/[teamId]/members
PATCH  /api/teams/[teamId]/members/[memberId]
DELETE /api/teams/[teamId]/members/[memberId]

POST   /api/teams/[teamId]/invitations
GET    /api/teams/[teamId]/invitations
PATCH  /api/teams/[teamId]/invitations/[invitationId]  (revocar)

GET    /api/invitations/[token]           (validar token/código)
POST   /api/invitations/[token]/accept

GET    /api/teams/[teamId]/matches
POST   /api/teams/[teamId]/matches
GET    /api/teams/[teamId]/matches/[matchId]
PATCH  /api/teams/[teamId]/matches/[matchId]
DELETE /api/teams/[teamId]/matches/[matchId]

GET    /api/teams/[teamId]/matches/[matchId]/events
POST   /api/teams/[teamId]/matches/[matchId]/events
DELETE /api/teams/[teamId]/matches/[matchId]/events/[eventId]

GET    /api/teams/[teamId]/stats
GET    /api/teams/[teamId]/players/[playerId]/stats
POST   /api/teams/[teamId]/players/[playerId]/adjustments
```

---

## Componentes Compartidos

```
components/
  ui/                     ← shadcn/ui (Button, Input, Card, etc.)
  layout/
    Header.tsx            ← Nav + avatar usuario
    TeamSidebar.tsx       ← Navegación dentro de un equipo
  shared/
    PlayerCard.tsx        ← Card de jugador (avatar, nombre, posición)
    MatchCard.tsx         ← Card de partido (rival, resultado, fecha)
    StatBadge.tsx         ← Badge de stat (goles, asistencias)
    EmptyState.tsx        ← Estado vacío reutilizable
    LoadingSkeleton.tsx   ← Skeleton genérico
    ConfirmDialog.tsx     ← Diálogo de confirmación
```

---

## Flujo de Datos

### Server Components (datos iniciales)
```
Page (RSC)
  └── fetch data via supabase server client
      └── renderiza con datos
          └── Client Component para interactividad
```

### Client Components (mutaciones)
```
Form / Button (CC)
  └── Server Action o fetch a API Route
      └── supabase server client (con auth del usuario)
          └── mutación en DB
              └── revalidatePath() o router.refresh()
                  └── Page se re-renderiza con datos frescos
```

---

*System Architect Agent — LaPizarra Knowledge Base*
