# Cálculo de Estadísticas — Lógica Completa

> Agente: Match & Stats Agent
> Reglas de negocio para el cálculo de cada métrica.

---

## Reglas de Negocio

### ¿Cuándo se cuenta un partido en las stats?

Un partido **cuenta** en las estadísticas si:
- `status = 'finished'`
- `deleted_at IS NULL`

Un partido **NO cuenta** si:
- `status = 'cancelled'` o `status = 'postponed'`
- `deleted_at IS NOT NULL`

---

### ¿Cuándo se cuenta un jugador como "habiendo jugado"?

Un jugador **aparece como participante** de un partido si:
- Tiene al menos 1 evento (goal, assist, own_goal) en ese partido

**Limitación conocida:** Si un jugador jugó pero no tuvo ningún evento, no aparece en los stats de ese partido. En MVP esto es aceptable. En futuro se puede agregar "lineup" (alineación explícita).

---

### ¿Cómo se manejan los ajustes manuales?

Los ajustes manuales se **suman algebraicamente** a los eventos reales:

```
stat_final = events_count + SUM(manual_adjustments.delta)
```

Si delta es negativo, resta. Esto permite:
- Corregir errores
- Importar datos históricos
- El total nunca baja de 0 (se valida en la UI)

---

### ¿Los autogoles afectan al resultado?

**No automáticamente.** El resultado (goals_for, goals_against) se registra manualmente. Un autogol registrado como evento solo afecta las estadísticas del jugador (`own_goals`).

La UI puede advertir si hay inconsistencia entre eventos registrados y el marcador final.

---

## Fórmulas Completas

### Player Stats

```
goals = 
  (SELECT COUNT(*) FROM match_events 
   JOIN matches ON matches.id = match_events.match_id
   WHERE event_type = 'goal' 
     AND player_id = :player_id 
     AND team_id = :team_id
     AND matches.status = 'finished'
     AND matches.deleted_at IS NULL)
  +
  (SELECT COALESCE(SUM(delta), 0) FROM manual_stat_adjustments
   WHERE player_id = :player_id 
     AND team_id = :team_id
     AND stat_type = 'goals')

assists = [misma lógica con event_type = 'assist']

own_goals = [misma lógica con event_type = 'own_goal', sin ajuste manual]

matches_played = 
  (SELECT COUNT(DISTINCT match_id) FROM match_events
   JOIN matches ON matches.id = match_events.match_id
   WHERE player_id = :player_id
     AND team_id = :team_id
     AND matches.status = 'finished'
     AND matches.deleted_at IS NULL)
  +
  (SELECT COALESCE(SUM(delta), 0) FROM manual_stat_adjustments
   WHERE player_id = :player_id
     AND team_id = :team_id
     AND stat_type = 'matches_played')

goals_per_game = goals / NULLIF(matches_played, 0)
```

### Team Stats

```
matches_played = COUNT(matches WHERE status = 'finished' AND deleted_at IS NULL)
wins           = COUNT(matches WHERE goals_for > goals_against AND finished)
draws          = COUNT(matches WHERE goals_for = goals_against AND finished)
losses         = COUNT(matches WHERE goals_for < goals_against AND finished)
goals_for      = SUM(goals_for WHERE finished)
goals_against  = SUM(goals_against WHERE finished)
goal_difference = goals_for - goals_against
win_rate       = wins / NULLIF(matches_played, 0) * 100
points         = wins * 3 + draws * 1  -- para cuando se implemente liga
```

---

## Filtros Soportados

### Por tipo de partido

```typescript
// Solo partidos de liga
.eq('type', 'league')

// Solo amistosos
.eq('type', 'friendly')

// Todos (por defecto)
// sin filtro adicional
```

### Por rango de fechas

```typescript
// Stats de la temporada actual (2026)
const seasonStart = '2026-01-01'
const seasonEnd = '2026-12-31'

.gte('match_date', seasonStart)
.lte('match_date', seasonEnd)
```

**Nota:** Las vistas actuales no soportan filtro por fecha directamente. Para filtrar por temporada, usar query directo a `match_events` con JOIN a `matches`. En futuro agregar columna `season` a `matches`.

---

## Edge Cases

| Caso | Comportamiento |
|------|---------------|
| Partido sin goles registrados | Aparece en historial pero no suma a stats de ningún jugador |
| Jugador eliminado (status = 'inactive') | Sus stats históricas siguen visibles |
| Ajuste manual negativo que da total < 0 | La UI previene; la DB no tiene constraint (por diseño) |
| Gol sin minuto | Aparece como "min: -" en la UI, se ordena al final |
| Asistencia sin gol relacionado | No debería ocurrir (la API lo previene) |
| Mismo jugador goleador y asistente | Bloqueado en validación de la API |

---

## Performance

### Cargas esperadas en MVP

- Equipos: < 1.000
- Jugadores por equipo: 5-30
- Partidos por equipo: < 100/temporada
- Eventos por partido: < 20

Con estos volúmenes, las vistas calculadas en tiempo real son más que suficientes. Sin cache adicional.

### Cuando escalar

Si se detecta `player_stats` tardando > 500ms:
1. Convertir a `MATERIALIZED VIEW` con `REFRESH MATERIALIZED VIEW CONCURRENTLY`
2. Agregar trigger en `match_events` y `manual_stat_adjustments` que haga refresh
3. O calcular en el servidor con TanStack Query + revalidación de 30s

---

*Match & Stats Agent — LaPizarra Knowledge Base*
