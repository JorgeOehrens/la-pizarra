"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function directJoin(teamId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { data: team } = await supabase
    .from("teams")
    .select("join_mode")
    .eq("id", teamId)
    .single()

  if (team?.join_mode !== "open") return { error: "Este equipo no admite uniones directas" }

  const { data: existing } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existing) return { error: "Ya eres miembro de este equipo" }

  const { error } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: user.id,
    role: "player",
    status: "active",
  })

  if (error) return { error: error.message }

  revalidatePath("/directory")
  return { ok: true }
}

export async function requestJoin(teamId: string): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { data: team } = await supabase
    .from("teams")
    .select("join_mode")
    .eq("id", teamId)
    .single()

  if (team?.join_mode !== "request") return { error: "Este equipo no acepta solicitudes" }

  const { data: member } = await supabase
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (member) return { error: "Ya eres miembro de este equipo" }

  const { error } = await supabase.from("join_requests").upsert(
    { team_id: teamId, user_id: user.id, status: "pending" },
    { onConflict: "team_id,user_id", ignoreDuplicates: false }
  )

  if (error) return { error: error.message }

  revalidatePath("/directory")
  return { ok: true }
}

export async function enterTeam(teamId: string): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc("set_active_team", { p_team_id: teamId })
  redirect("/matches")
}
