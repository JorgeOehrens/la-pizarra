"use server"

import { createClient } from "@/lib/supabase/server"
import { track } from "@/lib/analytics"

type MatchType = "friendly" | "league" | "cup" | "tournament"

interface EventPayload {
  event_type: string
  player_id: string | null
  assisted_by: string | null
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
  events: EventPayload[]
}

export async function createMatch(
  payload: CreateMatchPayload
): Promise<{ matchId: string } | { error: string }> {
  const supabase = await createClient()

  if (!payload.opponentName.trim()) {
    return { error: "El nombre del rival es obligatorio." }
  }
  if (!payload.matchDate) {
    return { error: "La fecha es obligatoria." }
  }
  for (const ev of payload.events) {
    if (ev.event_type === "goal" && !ev.player_id) {
      return { error: "Todos los goles deben tener un goleador asignado." }
    }
  }

  const dateStr = `${payload.matchDate}T${payload.matchTime || "00:00"}:00`
  const matchDatetime = new Date(dateStr)
  if (isNaN(matchDatetime.getTime())) {
    return { error: "Fecha u hora inválida." }
  }

  const { data, error } = await supabase.rpc("create_match_with_events", {
    p_team_id: payload.teamId,
    p_opponent_name: payload.opponentName.trim(),
    p_is_home: payload.isHome,
    p_match_type: payload.matchType,
    p_competition_name: payload.competitionName.trim() || null,
    p_match_date: matchDatetime.toISOString(),
    p_venue_custom: payload.venueCustom.trim() || null,
    p_events: payload.events,
  })

  if (error) {
    console.error("createMatch error:", error)
    return { error: "No se pudo guardar el partido. Intenta de nuevo." }
  }

  const result = data as { match_id?: string; error?: string }

  if (result?.error === "not_authenticated") return { error: "No autenticado." }
  if (result?.error === "not_admin") return { error: "Solo los administradores pueden crear partidos." }
  if (result?.error) return { error: "Error al guardar el partido." }

  // Track match creation (best-effort).
  const {
    data: { user },
  } = await supabase.auth.getUser()
  void track(
    "match_created",
    {
      team_id: payload.teamId,
      match_type: payload.matchType,
      events: payload.events.length,
      goals: payload.events.filter((e) => e.event_type === "goal").length,
    },
    { distinctId: user?.id },
  ).catch(() => undefined)

  return { matchId: result.match_id! }
}
