import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { CreateChargeForm, type TeamMember, type RecentMatch } from "./create-charge-form"

export default async function NewChargePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")
  if (membership.role !== "admin") redirect("/finance")

  const [membersRes, matchesRes] = await Promise.all([
    supabase
      .from("team_members")
      .select(`id, user_id, role, jersey_number, profiles ( display_name, username )`)
      .eq("team_id", membership.team_id)
      .eq("status", "active")
      .order("jersey_number", { ascending: true, nullsFirst: false }),

    supabase
      .from("matches")
      .select("id, opponent, match_date, status")
      .eq("team_id", membership.team_id)
      .order("match_date", { ascending: false })
      .limit(12),
  ])

  const teamMembers: TeamMember[] = (membersRes.data ?? []).map((m) => {
    const profile = m.profiles as unknown as { display_name: string | null; username: string } | null
    return {
      id: m.user_id ?? m.id,
      membership_id: m.id,
      display_name: profile?.display_name || profile?.username || "Jugador",
      jersey_number: m.jersey_number,
      role: m.role as "admin" | "player",
    }
  })

  const recentMatches: RecentMatch[] = (matchesRes.data ?? []).map((m) => ({
    id: m.id,
    opponent: m.opponent,
    date: m.match_date,
    status: m.status,
  }))

  return (
    <AppShell showNav={false}>
      <CreateChargeForm
        teamId={membership.team_id}
        members={teamMembers}
        currentUserId={user.id}
        recentMatches={recentMatches}
      />
    </AppShell>
  )
}
