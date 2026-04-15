"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function joinByToken(token: string): Promise<{ error: string } | void> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data, error } = await supabase.rpc("join_team_by_token", { p_token: token })

  if (error) {
    console.error("joinByToken error:", error)
    return { error: "No se pudo procesar la solicitud." }
  }

  if (data?.error === "invalid_or_expired") {
    return { error: "Link inválido o expirado. Pide uno nuevo al administrador." }
  }

  redirect("/onboarding/setup-player")
}

export async function searchTeams(query: string): Promise<{
  id: string
  name: string
  logo_url: string | null
  member_count: number
}[]> {
  const supabase = await createClient()
  const { data } = await supabase.rpc("search_teams", { p_query: query.trim() })
  return (data ?? []).map((t: { id: string; name: string; logo_url: string | null; member_count: number }) => ({
    id: t.id,
    name: t.name,
    logo_url: t.logo_url,
    member_count: Number(t.member_count),
  }))
}
