import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { TeamView, type MemberWithStats } from "./team-view"

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  const team = membership.teams
  const isAdmin = membership.role === "admin"

  // Fetch members + stats in parallel
  const [membersResult, statsResult, playerStatsResult] = await Promise.all([
    supabase
      .from("team_members")
      .select(`
        id, user_id, role, jersey_number, position, guest_name,
        profiles ( username, display_name, avatar_url )
      `)
      .eq("team_id", team.id)
      .eq("status", "active")
      .order("jersey_number", { ascending: true, nullsFirst: false }),

    supabase
      .from("team_stats")
      .select("matches_played, wins, draws, losses, goals_for, goals_against")
      .eq("team_id", team.id)
      .maybeSingle(),

    supabase
      .from("player_stats")
      .select("player_id, matches_played, goals, assists")
      .eq("team_id", team.id),
  ])

  // Build a lookup map for player stats
  const statsMap = new Map(
    (playerStatsResult.data ?? []).map((s) => [
      s.player_id,
      { matches_played: Number(s.matches_played), goals: Number(s.goals), assists: Number(s.assists) },
    ])
  )

  // Merge members with their stats
  const members: MemberWithStats[] = (membersResult.data ?? []).map((m) => {
    const profile = m.profiles as unknown as { username: string; display_name: string | null; avatar_url: string | null } | null
    const pStats = m.user_id ? (statsMap.get(m.user_id) ?? { matches_played: 0, goals: 0, assists: 0 })
      : { matches_played: 0, goals: 0, assists: 0 }

    return {
      id: m.id,
      user_id: m.user_id ?? null,
      role: m.role,
      jersey_number: m.jersey_number,
      position: m.position,
      display_name: profile?.display_name || profile?.username || (m as { guest_name?: string }).guest_name || "Jugador",
      avatar_url: profile?.avatar_url ?? null,
      is_guest: !m.user_id,
      ...pStats,
    }
  })

  const teamStats = {
    matches_played: Number(statsResult.data?.matches_played ?? 0),
    wins: Number(statsResult.data?.wins ?? 0),
    draws: Number(statsResult.data?.draws ?? 0),
    losses: Number(statsResult.data?.losses ?? 0),
    goals_for: Number(statsResult.data?.goals_for ?? 0),
    goals_against: Number(statsResult.data?.goals_against ?? 0),
  }

  return (
    <AppShell>
      <TeamView team={team} members={members} stats={teamStats} isAdmin={isAdmin} />
    </AppShell>
  )
}
