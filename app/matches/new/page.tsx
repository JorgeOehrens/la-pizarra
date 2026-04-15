import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NewMatchForm } from "./new-match-form"

export default async function NewMatchPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, role, teams(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!membership?.teams) redirect("/onboarding")
  if (membership.role !== "admin") redirect("/matches")

  const team = membership.teams as unknown as { id: string; name: string }

  // Only non-guest members with real user accounts can be scorers/assisters
  const { data: members } = await supabase
    .from("team_members")
    .select("user_id, jersey_number, position, profiles(display_name, username)")
    .eq("team_id", team.id)
    .eq("status", "active")
    .not("user_id", "is", null)
    .order("jersey_number", { ascending: true, nullsFirst: false })

  const players = (members ?? []).map((m) => {
    const profile = m.profiles as unknown as {
      display_name: string | null
      username: string
    } | null
    return {
      id: m.user_id as string,
      name: profile?.display_name || profile?.username || "Jugador",
      number: m.jersey_number ?? null,
      position: m.position ?? null,
    }
  })

  return <NewMatchForm teamId={team.id} teamName={team.name} players={players} />
}
