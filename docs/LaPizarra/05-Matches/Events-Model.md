# Modelo de Eventos de Partido

> Agente: Match & Stats Agent
> Goles, asistencias, autogoles — cómo se registran y relacionan.

---

## Tipos de Evento

| Tipo | Enum | Descripción | Afecta stats |
|------|------|-------------|-------------|
| Gol | `goal` | Gol a favor del equipo | +1 gol al jugador |
| Asistencia | `assist` | Asistencia en un gol | +1 asistencia al jugador |
| Autogol | `own_goal` | Gol en propia puerta | +1 autogol al jugador |
| Tarjeta amarilla | `yellow_card` | Amonestación (fase 2) | futuro |
| Tarjeta roja | `red_card` | Expulsión (fase 2) | futuro |

---

## Relación Gol ↔ Asistencia

Un gol puede tener 0 o 1 asistencia. La asistencia referencia al gol mediante `related_event_id`.

```
match_events:
  id: "gol-001"
  event_type: 'goal'
  player_id: jugador_A
  minute: 23

match_events:
  id: "asist-001"
  event_type: 'assist'
  player_id: jugador_B
  minute: 23
  related_event_id: "gol-001"  ← apunta al gol
```

---

## Flujo de Registro de Gol

```
Admin selecciona "Agregar gol"
    │
    ▼
Formulario:
  1. Jugador que marcó (lista de la plantilla)
  2. Minuto (opcional, 0-120)
  3. ¿Tuvo asistencia? (toggle)
     │ Sí → Seleccionar asistente (no puede ser el mismo jugador)
  4. ¿Autogol? (toggle)
     │ Si autogol: el jugador marca para el rival
    │
    ▼
POST /api/teams/{teamId}/matches/{matchId}/events

  Si autogol:
    - event_type: 'own_goal'
    - El gol suma a goals_against automáticamente (NO, el resultado es manual)
    - El gol suma +1 autogol al jugador

  Si gol normal:
    - INSERT event_type: 'goal' para el goleador
    - INSERT event_type: 'assist' para el asistente (si aplica)
    - related_event_id del assist = id del goal
```

---

## API de Eventos

### Crear evento

```typescript
// app/api/teams/[teamId]/matches/[matchId]/events/route.ts

interface CreateEventInput {
  event_type: 'goal' | 'own_goal' | 'yellow_card' | 'red_card'
  player_id: string
  minute?: number
  assist_player_id?: string // solo para goles con asistencia
}

export async function POST(request: Request, { params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body: CreateEventInput = await request.json()

  // Insertar el evento principal (gol/autogol)
  const { data: event, error } = await supabase
    .from('match_events')
    .insert({
      match_id: params.matchId,
      team_id: params.teamId,
      player_id: body.player_id,
      event_type: body.event_type,
      minute: body.minute,
      created_by: user.id,
    })
    .select()
    .single()

  if (error) return Response.json({ error: error.message }, { status: 500 })

  // Si hay asistente, crear el evento de asistencia
  if (body.assist_player_id && body.event_type === 'goal') {
    await supabase
      .from('match_events')
      .insert({
        match_id: params.matchId,
        team_id: params.teamId,
        player_id: body.assist_player_id,
        event_type: 'assist',
        minute: body.minute,
        related_event_id: event.id,
        created_by: user.id,
      })
  }

  return Response.json({ event })
}
```

### Obtener eventos de un partido

```typescript
const { data: events } = await supabase
  .from('match_events')
  .select(`
    *,
    profiles!player_id(username, display_name, avatar_url),
    related_event:match_events!related_event_id(
      profiles!player_id(username, display_name)
    )
  `)
  .eq('match_id', matchId)
  .order('minute', { ascending: true, nullsFirst: false })
```

---

## Visualización de Eventos

```
⚽ 23' — Lucas Torres (asist: Marco Díaz)
⚽ 45' — Pablo González
↩️ 67' — Carlos Ruiz (autogol)
⚽ 78' — Lucas Torres
```

---

## Eliminar Evento

- Solo admins pueden eliminar eventos
- Hard delete en eventos (son corregibles)
- Si se borra un gol con asistencia, también se borra la asistencia

```typescript
// Eliminar gol y su asistencia asociada
export async function DELETE(request: Request, { params }) {
  const supabase = await createClient()

  // Primero eliminar asistencias que referencian a este evento
  await supabase
    .from('match_events')
    .delete()
    .eq('related_event_id', params.eventId)

  // Luego eliminar el evento principal
  await supabase
    .from('match_events')
    .delete()
    .eq('id', params.eventId)
    .eq('match_id', params.matchId) // seguridad extra
}
```

---

## Consistencia: Resultado vs Eventos

**Decisión de diseño:** El resultado (goals_for, goals_against) se registra manualmente y es independiente de los eventos.

**Por qué:** Los eventos (goles) pueden estar incompletos (no siempre se registra quién marcó cada gol, especialmente en partidos pasados).

**Consecuencia:** Puede haber inconsistencia entre "goles registrados como eventos" y "resultado final". Esto es aceptable en MVP y se indica en la UI.

```
// UI warning:
"El marcador muestra 3-1, pero solo tienes 2 goles registrados.
¿Quieres agregar el gol que falta?"
```

---

*Match & Stats Agent — LaPizarra Knowledge Base*
