"use server"

import { createClient } from "@/lib/supabase/server"

type MatchStatus = "scheduled" | "finished" | "cancelled" | "postponed"
type MatchType = "friendly" | "league" | "cup" | "tournament"

interface EventPayload {
  event_type: string
  player_id: string | null
  assisted_by: string | null
  minute: number | null
}

interface SaveMatchPayload {
  matchId: string
  opponentName: string
  isHome: boolean
  matchType: MatchType
  competitionName: string
  matchDate: string   // "YYYY-MM-DD"
  matchTime: string   // "HH:mm"
  venueCustom: string
  status: MatchStatus
  notes: string
  events: EventPayload[]
}

export async function saveMatch(
  payload: SaveMatchPayload
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()

  if (!payload.opponentName.trim()) {
    return { error: "El nombre del rival es obligatorio." }
  }
  if (!payload.matchDate) {
    return { error: "La fecha es obligatoria." }
  }

  const dateStr = `${payload.matchDate}T${payload.matchTime || "00:00"}:00`
  const matchDatetime = new Date(dateStr)
  if (isNaN(matchDatetime.getTime())) {
    return { error: "Fecha u hora inválida." }
  }

  // 1. Update match metadata
  const { data: updateData, error: updateError } = await supabase.rpc("update_match", {
    p_match_id: payload.matchId,
    p_opponent_name: payload.opponentName.trim(),
    p_is_home: payload.isHome,
    p_match_type: payload.matchType,
    p_competition_name: payload.competitionName.trim() || null,
    p_match_date: matchDatetime.toISOString(),
    p_venue_custom: payload.venueCustom.trim() || null,
    p_status: payload.status,
    p_notes: payload.notes.trim() || null,
  })

  if (updateError) {
    console.error("update_match error:", updateError)
    return { error: "No se pudo actualizar el partido." }
  }

  const updateResult = updateData as { ok?: boolean; error?: string }
  if (updateResult?.error === "not_found") return { error: "Partido no encontrado." }
  if (updateResult?.error === "not_admin") return { error: "Solo los administradores pueden editar partidos." }
  if (updateResult?.error) return { error: "Error al actualizar el partido." }

  // 2. Replace events
  const { data: eventsData, error: eventsError } = await supabase.rpc("replace_match_events", {
    p_match_id: payload.matchId,
    p_events: payload.events,
  })

  if (eventsError) {
    console.error("replace_match_events error:", eventsError)
    return { error: "No se pudieron actualizar los eventos." }
  }

  const eventsResult = eventsData as { ok?: boolean; error?: string }
  if (eventsResult?.error) return { error: "Error al actualizar los eventos." }

  return { ok: true }
}
