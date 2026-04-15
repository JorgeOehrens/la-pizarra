import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { MatchesView } from "./matches-view"

export default async function MatchesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  const team = membership.teams
  const isAdmin = membership.role === "admin"

  const { data: matches } = await supabase
    .from("matches")
    .select("id, opponent_name, match_date, type, status, goals_for, goals_against")
    .eq("team_id", team.id)
    .is("deleted_at", null)
    .order("match_date", { ascending: false })

  // Fetch user's attendance for all matches
  const allMatchIds = (matches ?? []).map((m) => m.id)
  const attendanceMap: Record<string, "confirmed" | "declined" | null> =
    Object.fromEntries(allMatchIds.map((id) => [id, null]))

  if (allMatchIds.length > 0) {
    const { data: attRows } = await supabase
      .from("match_attendance")
      .select("match_id, status")
      .eq("user_id", user.id)
      .in("match_id", allMatchIds)
    for (const row of attRows ?? []) {
      attendanceMap[row.match_id] = row.status as "confirmed" | "declined"
    }
  }

  return (
    <AppShell>
      <MatchesView matches={matches ?? []} teamName={team.name} isAdmin={isAdmin} attendanceMap={attendanceMap} />
    </AppShell>
  )
}
