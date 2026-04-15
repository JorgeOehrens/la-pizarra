"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function updatePlayer(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const playerId = formData.get("player_id") as string
  const teamId = formData.get("team_id") as string
  const displayName = (formData.get("display_name") as string)?.trim()
  const position = formData.get("position") as string | null
  const jerseyNumberRaw = formData.get("jersey_number") as string
  const jerseyNumber = jerseyNumberRaw ? Number(jerseyNumberRaw) : null
  const role = formData.get("role") as string | null

  if (!playerId || !teamId || !displayName) {
    return { error: "Faltan datos obligatorios." }
  }

  const { error } = await supabase.rpc("update_player_info", {
    p_player_user_id: playerId,
    p_team_id: teamId,
    p_display_name: displayName,
    p_position: position || null,
    p_jersey_number: jerseyNumber,
    p_role: role || null,
  })

  if (error) {
    console.error("updatePlayer error:", error)
    return { error: "No se pudo guardar. Intenta de nuevo." }
  }

  redirect(`/players/${playerId}`)
}

export async function removePlayer(playerId: string, teamId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { error } = await supabase.rpc("remove_player_from_team", {
    p_player_user_id: playerId,
    p_team_id: teamId,
  })

  if (error) {
    console.error("removePlayer error:", error)
    return { error: "No se pudo eliminar. Intenta de nuevo." }
  }

  redirect("/team")
}
