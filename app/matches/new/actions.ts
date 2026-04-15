"use server"

import { createClient } from "@/lib/supabase/server"

type MatchType = "friendly" | "league" | "cup" | "tournament"

interface EventPayload {
  type: "goal" | "own_goal"
  playerId: string | null
  assistPlayerId: string | null
  minute: number | null
}

interface CreateMatchPayload {
  teamId: string
  opponentName: string
  isHome: boolean
  matchType: MatchType
  competitionName: string
  matchDate: string   // "YYYY-MM-DD"
  matchTime: string   // "HH:mm"
  venueCustom: string
  goalsAgainst: number
  events: EventPayload[]
}

export async function createMatch(
  payload: CreateMatchPayload
): Promise<{ matchId: string } | { error: string }> {
  const supabase = await createClient()

  // Validate
  if (!payload.opponentName.trim()) {
    return { error: "El nombre del rival es obligatorio." }
  }
  if (!payload.matchDate) {
    return { error: "La fecha es obligatoria." }
  }
  if (payload.goalsAgainst < 0) {
    return { error: "El marcador del rival no puede ser negativo." }
  }
  for (const ev of payload.events) {
    if (ev.type === "goal" && !ev.playerId) {
      return { error: "Todos los goles deben tener un goleador asignado." }
    }
  }

  // Build datetime
  const dateStr = `${payload.matchDate}T${payload.matchTime || "00:00"}:00`
  const matchDatetime = new Date(dateStr)
  if (isNaN(matchDatetime.getTime())) {
    return { error: "Fecha u hora inválida." }
  }

  const eventsJson = payload.events.map((e) => ({
    type: e.type,
    player_id: e.playerId ?? null,
    assist_player_id: e.assistPlayerId ?? null,
    minute: e.minute ?? null,
  }))

  const { data, error } = await supabase.rpc("create_match_with_events", {
    p_team_id: payload.teamId,
    p_opponent_name: payload.opponentName.trim(),
    p_is_home: payload.isHome,
    p_match_type: payload.matchType,
    p_competition_name: payload.competitionName.trim() || null,
    p_match_date: matchDatetime.toISOString(),
    p_venue_custom: payload.venueCustom.trim() || null,
    p_goals_against: payload.goalsAgainst,
    p_events: eventsJson,
  })

  if (error) {
    console.error("createMatch error:", error)
    return { error: "No se pudo guardar el partido. Intenta de nuevo." }
  }

  const result = data as { match_id?: string; error?: string }

  if (result?.error === "not_authenticated") return { error: "No autenticado." }
  if (result?.error === "not_admin") return { error: "Solo los administradores pueden crear partidos." }
  if (result?.error) return { error: "Error al guardar el partido." }

  return { matchId: result.match_id! }
}
