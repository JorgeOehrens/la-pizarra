"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function setAttendance(
  matchId: string,
  status: "confirmed" | "declined"
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("set_match_attendance", {
    p_match_id: matchId,
    p_status: status,
  })

  if (error) {
    console.error("setAttendance error:", error)
    return { error: "No se pudo guardar tu asistencia." }
  }

  const result = data as { ok?: boolean; error?: string }
  if (result?.error) return { error: "Error al guardar asistencia." }

  revalidatePath(`/matches/${matchId}`)
  revalidatePath("/home")
  return { ok: true }
}

export async function setPlayerAttendance(
  matchId: string,
  playerId: string,
  status: "confirmed" | "declined"
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()

  const { data, error } = await supabase.rpc("set_player_attendance_by_admin", {
    p_match_id: matchId,
    p_player_id: playerId,
    p_status: status,
  })

  if (error) {
    console.error("setPlayerAttendance error:", error)
    return { error: "No se pudo guardar la asistencia." }
  }

  const result = data as { ok?: boolean; error?: string }
  if (result?.error) return { error: "Error al guardar asistencia." }

  revalidatePath(`/matches/${matchId}`)
  return { ok: true }
}
