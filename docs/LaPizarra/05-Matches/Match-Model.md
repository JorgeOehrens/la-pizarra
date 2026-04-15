# Modelo de Partidos

> Agente: Match & Stats Agent
> Cómo se estructura un partido, sus estados y flujo de registro.

---

## Anatomía de un Partido

```
PARTIDO
├── Metadata
│   ├── rival (nombre libre en MVP, equipo registrado en futuro)
│   ├── fecha y hora
│   ├── lugar (venue predefinido o custom)
│   └── tipo (liga, amistoso, copa, torneo)
│
├── Estado
│   ├── programado
│   ├── en_curso
│   ├── finalizado
│   ├── cancelado
│   └── postergado
│
├── Resultado
│   ├── goles_favor
│   ├── goles_contra
│   └── resultado calculado (W/D/L)
│
└── Eventos
    ├── Gol (jugador, minuto)
    ├── Asistencia (jugador, minuto, relacionado al gol)
    └── Autogol (jugador, minuto)
```

---

## Ciclo de Vida de un Partido

```
[scheduled]
    │
    │ El partido empieza (botón "Iniciar")
    ▼
[in_progress]
    │  ← Aquí se registran eventos en tiempo real (futuro)
    │
    │ El partido termina (botón "Finalizar")
    ▼
[finished] ← Aquí se pueden editar el resultado y eventos
    │
    │ (Opcional) soft-delete
    ▼
[deleted] (deleted_at != null)
```

**MVP simplificado:** El admin puede pasar directamente de `scheduled` a `finished` registrando resultado + eventos post-partido.

---

## Crear un Partido — Flujo

```
Admin selecciona "Nuevo partido"
    │
    ▼
Formulario:
  1. Nombre del rival (text)
  2. Fecha y hora (date + time)
  3. Lugar:
     - Seleccionar de lista predefinida
     - O escribir nombre custom
  4. Tipo: Liga / Amistoso / Copa / Torneo
    │
    ▼
POST /api/teams/{teamId}/matches
  - Crea match con status: 'scheduled'
  - Redirige al detalle del partido
```

---

## Registrar Resultado — Flujo

```
Admin va al partido programado
    │
    ▼
Botón "Registrar resultado"
    │
    ▼
Formulario:
  - Goles a favor: [número]
  - Goles en contra: [número]
    │
    ▼
PATCH /api/teams/{teamId}/matches/{matchId}
  - Actualiza goals_for y goals_against
  - status: 'finished'
    │
    ▼
"¿Quieres agregar los eventos (goles/asistencias)?"
  - Sí → Va a la pantalla de eventos
  - No → Queda con resultado simple
```

---

## Tipos de Partido

| Tipo | Slug | Descripción |
|------|------|-------------|
| Amistoso | `friendly` | Sin impacto en tabla |
| Liga | `league` | Afecta clasificación (futuro) |
| Copa | `cup` | Eliminatoria (futuro) |
| Torneo | `tournament` | Fase de grupos (futuro) |

**MVP:** Todos los tipos registran igual. El tipo es informativo por ahora.

---

## Lugares (Venues)

### Predefinidos (is_system = true)
Se insertan en el seed y son globales para todos los equipos:
- Cancha Municipal Norte
- Cancha Municipal Sur
- Estadio Municipal
- Cancha Sintética Centro
- Local / Visita / Neutral

### Custom (is_system = false)
- El admin escribe el nombre del lugar
- Se guarda asociado al equipo (team_id)
- Aparece en el historial para reutilizar

---

## Queries Frecuentes

### Historial de partidos del equipo

```typescript
const { data: matches } = await supabase
  .from('matches')
  .select(`
    *,
    venues(name, address)
  `)
  .eq('team_id', teamId)
  .is('deleted_at', null)
  .order('match_date', { ascending: false })
  .limit(20)
```

### Partidos del mes

```typescript
const startOfMonth = new Date(year, month, 1).toISOString()
const endOfMonth = new Date(year, month + 1, 0).toISOString()

const { data } = await supabase
  .from('matches')
  .select('*')
  .eq('team_id', teamId)
  .gte('match_date', startOfMonth)
  .lte('match_date', endOfMonth)
  .is('deleted_at', null)
```

---

## TypeScript Types

```typescript
export type MatchStatus = 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed'
export type MatchType = 'friendly' | 'league' | 'cup' | 'tournament'
export type MatchResult = 'W' | 'D' | 'L' | null

export interface Match {
  id: string
  team_id: string
  opponent_name: string
  match_date: string
  venue_id?: string
  venue_custom?: string
  type: MatchType
  status: MatchStatus
  goals_for?: number
  goals_against?: number
  notes?: string
  created_by: string
  deleted_at?: string
  created_at: string
  updated_at: string
}

export function getMatchResult(match: Match): MatchResult {
  if (match.goals_for === undefined || match.goals_against === undefined) return null
  if (match.goals_for > match.goals_against) return 'W'
  if (match.goals_for < match.goals_against) return 'L'
  return 'D'
}
```

---

*Match & Stats Agent — LaPizarra Knowledge Base*
