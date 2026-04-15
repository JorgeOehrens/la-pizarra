"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function setupPlayerProfile(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Get current membership to know teamId, display_name and role
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, role, profiles(display_name, username)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!membership?.team_id) redirect("/onboarding")

  const profile = membership.profiles as unknown as { display_name: string | null; username: string } | null
  const displayName = profile?.display_name || profile?.username || user.email || "Jugador"

  const position = formData.get("position") as string | null
  const jerseyNumberRaw = formData.get("jersey_number") as string
  const jerseyNumber = jerseyNumberRaw ? Number(jerseyNumberRaw) : null

  const { error } = await supabase.rpc("update_player_info", {
    p_player_user_id: user.id,
    p_team_id: membership.team_id,
    p_display_name: displayName,
    p_position: position || null,
    p_jersey_number: jerseyNumber,
    p_role: membership.role,
  })

  if (error) {
    console.error("setupPlayerProfile error:", error)
    return { error: "No se pudo guardar. Intenta de nuevo." }
  }

  redirect("/home")
}
