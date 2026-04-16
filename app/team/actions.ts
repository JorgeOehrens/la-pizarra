"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateJoinMode(
  teamId: string,
  mode: "open" | "request" | "invite_only"
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from("teams")
    .update({ join_mode: mode })
    .eq("id", teamId)

  if (error) return { error: error.message }
  revalidatePath("/team")
  return { ok: true }
}

export async function approveJoinRequest(
  requestId: string,
  teamId: string,
  userId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  // Insert as team member
  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: teamId,
    user_id: userId,
    role: "player",
    status: "active",
  })

  if (memberError) return { error: memberError.message }

  // Mark request as approved
  await supabase
    .from("join_requests")
    .update({ status: "approved", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  revalidatePath("/team")
  return { ok: true }
}

export async function rejectJoinRequest(
  requestId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("join_requests")
    .update({ status: "rejected", reviewed_by: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)

  if (error) return { error: error.message }
  revalidatePath("/team")
  return { ok: true }
}
