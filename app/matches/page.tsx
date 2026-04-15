import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { MatchesView } from "./matches-view"

export default async function MatchesPage() {
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

  const team = membership.teams as unknown as { id: string; name: string }
  const isAdmin = membership.role === "admin"

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, match_date, type, status, goals_for, goals_against")
    .eq("team_id", team.id)
    .is("deleted_at", null)
    .order("match_date", { ascending: false })

  return (
    <AppShell>
      <MatchesView matches={matches ?? []} teamName={team.name} isAdmin={isAdmin} />
    </AppShell>
  )
}
