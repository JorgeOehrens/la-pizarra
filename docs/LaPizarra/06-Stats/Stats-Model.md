# Modelo de Estadísticas

> Agente: Match & Stats Agent
> Cómo se calculan, almacenan y presentan las estadísticas en LaPizarra.

---

## Arquitectura de Stats

**Decisión:** Stats calculadas en vistas SQL, no en tablas de cache.

**Razón:** Con el volumen de un equipo amateur (< 50 partidos/temporada, < 25 jugadores), las vistas calculadas en tiempo real son más simples y siempre consistentes. No necesitamos materializar.

**Cuándo cambiar:** Si hay más de 100 equipos con > 200 partidos cada uno, considerar `MATERIALIZED VIEW` con refresh programado.

---

## Stats por Jugador

### Fuentes de datos

```
Goles del jugador =
  COUNT(match_events WHERE event_type = 'goal' AND player_id = X AND partido finalizado)
  + SUM(manual_stat_adjustments WHERE stat_type = 'goals' AND player_id = X)

Asistencias del jugador =
  COUNT(match_events WHERE event_type = 'assist' AND player_id = X AND partido finalizado)
  + SUM(manual_stat_adjustments WHERE stat_type = 'assists' AND player_id = X)

Partidos jugados =
  COUNT(DISTINCT match_id WHERE player tiene al menos 1 evento en el partido)
  + SUM(manual_stat_adjustments WHERE stat_type = 'matches_played' AND player_id = X)
```

### Vista SQL (`player_stats`)

Ver definición completa en [[03-Database/Schema]]

### Query desde el cliente

```typescript
// Obtener stats de todos los jugadores de un equipo
const { data: playerStats } = await supabase
  .from('player_stats')
  .select('*')
  .eq('team_id', teamId)
  .order('goals', { ascending: false })

// Obtener stats de un jugador específico
const { data: myStats } = await supabase
  .from('player_stats')
  .select('*')
  .eq('player_id', userId)
  .eq('team_id', teamId)
  .single()
```

---

## Stats por Equipo

### Métricas

| Métrica | Cálculo |
|---------|---------|
| Partidos jugados | COUNT(matches WHERE status = 'finished') |
| Victorias | COUNT(matches WHERE goals_for > goals_against) |
| Empates | COUNT(matches WHERE goals_for = goals_against) |
| Derrotas | COUNT(matches WHERE goals_for < goals_against) |
| Goles a favor | SUM(goals_for) |
| Goles en contra | SUM(goals_against) |
| Diferencia de goles | SUM(goals_for) - SUM(goals_against) |
| % de victorias | wins / matches_played * 100 |

### Vista SQL (`team_stats`)

Ver definición completa en [[03-Database/Schema]]

---

## Historial de Forma

Los últimos 5 partidos para mostrar forma reciente:

```typescript
const { data: recentForm } = await supabase
  .from('matches')
  .select('goals_for, goals_against, match_date, opponent_name')
  .eq('team_id', teamId)
  .eq('status', 'finished')
  .is('deleted_at', null)
  .order('match_date', { ascending: false })
  .limit(5)

const form = recentForm.map(m => {
  if (m.goals_for > m.goals_against) return 'W'
  if (m.goals_for < m.goals_against) return 'L'
  return 'D'
})
// Resultado: ['W', 'W', 'D', 'L', 'W']
```

---

## Ranking de Goleadores

```typescript
const { data: topScorers } = await supabase
  .from('player_stats')
  .select(`
    goals,
    assists,
    matches_played,
    profiles!player_id(display_name, avatar_url),
    team_members!inner(position, jersey_number)
  `)
  .eq('team_id', teamId)
  .order('goals', { ascending: false })
  .limit(10)
```

---

## Stats Manuales

Para corregir o importar estadísticas históricas sin crear partidos:

```typescript
// Agregar 5 goles históricos a un jugador
await supabase
  .from('manual_stat_adjustments')
  .insert({
    team_id: teamId,
    player_id: playerId,
    stat_type: 'goals',
    delta: 5,
    reason: 'Importación temporada 2024',
    created_by: adminId,
  })

// Corregir un error (restar 1 gol)
await supabase
  .from('manual_stat_adjustments')
  .insert({
    team_id: teamId,
    player_id: playerId,
    stat_type: 'goals',
    delta: -1,
    reason: 'Corrección: ese gol fue autogol del rival',
    created_by: adminId,
  })
```

---

## Perfil de Jugador — Pantalla

```
┌─────────────────────────────────────┐
│  [Avatar]  Lucas Torres             │
│  #10 · Delantero                    │
│  Los Guerreros FC                   │
│                                     │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐   │
│  │ 23 │  │ 15 │  │  8 │  │  2 │   │
│  │⚽  │  │ 🅰  │  │ ⏱  │  │ ↩️ │   │
│  │Goles│ │Asis│  │PJ  │  │AG  │   │
│  └────┘  └────┘  └────┘  └────┘   │
│                                     │
│  Últimos partidos:                  │
│  ✅ vs Leones FC    2-1  (⚽ ⚽)    │
│  ✅ vs Eagles       3-0  (⚽ 🅰)   │
│  ✅ vs FC Norte     1-1  ( - )     │
│  ❌ vs Real Oeste   0-2  ( - )     │
└─────────────────────────────────────┘
```

---

## Dashboard del Equipo — Estadísticas

```
┌─────────────────────────────────────┐
│  Los Guerreros FC                   │
│  Temporada 2026                     │
│                                     │
│  Forma: W W D L W                  │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐          │
│  │ 15  │ │  8  │ │  4  │          │
│  │ PJ  │ │  V  │ │  D  │          │
│  └─────┘ └─────┘ └─────┘          │
│                                     │
│  GF: 28 | GC: 15 | GD: +13        │
│                                     │
│  Goleadores:                        │
│  1. Lucas Torres    ⚽ 12           │
│  2. Marco Díaz      ⚽  8           │
│  3. Pablo González  ⚽  5           │
└─────────────────────────────────────┘
```

---

*Match & Stats Agent — LaPizarra Knowledge Base*
