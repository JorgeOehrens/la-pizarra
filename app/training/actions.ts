"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getActiveTeamMembership } from "@/lib/team"

export type TrainingSessionType = "running" | "gym" | "field" | "cycling" | "other"
export type TrainingIntensity = "low" | "medium" | "high"

export interface LogSessionPayload {
  session_type: TrainingSessionType
  title: string | null
  session_date: string
  duration_minutes: number
  distance_km: number | null
  calories: number | null
  intensity: TrainingIntensity
  notes: string | null
}

export async function logTrainingSession(
  payload: LogSessionPayload
): Promise<{ ok: true; id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  if (payload.duration_minutes <= 0) return { error: "La duración debe ser mayor a 0" }

  const membership = await getActiveTeamMembership(supabase, user.id)

  const { data, error } = await supabase
    .from("training_sessions")
    .insert({
      user_id: user.id,
      team_id: membership?.team_id ?? null,
      session_type: payload.session_type,
      title: payload.title || null,
      session_date: payload.session_date,
      duration_minutes: payload.duration_minutes,
      distance_km: payload.distance_km || null,
      calories: payload.calories || null,
      intensity: payload.intensity,
      notes: payload.notes || null,
      source: "manual",
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("logTrainingSession:", error)
    return { error: "No se pudo guardar la sesión" }
  }

  revalidatePath("/training")
  return { ok: true, id: data.id }
}

export async function deleteTrainingSession(
  sessionId: string
): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("training_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id)

  if (error) return { error: "No se pudo eliminar" }

  revalidatePath("/training")
  return { ok: true }
}
