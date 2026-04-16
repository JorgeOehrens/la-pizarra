import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { TeamView, type MemberWithStats, type JoinRequest, type TrainingWeekEntry } from "./team-view"
import { features } from "@/lib/features"
import { startOfWeek } from "date-fns"

export default async function TeamPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  const team = membership.teams
  const isAdmin = membership.role === "admin"

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
    .toISOString()
    .split("T")[0]

  // Fetch members + stats + admin data in parallel
  const [membersResult, statsResult, playerStatsResult, teamDataResult, joinRequestsResult, trainingWeekResult] = await Promise.all([
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

    supabase
      .from("teams")
      .select("join_mode")
      .eq("id", team.id)
      .single(),

    isAdmin
      ? supabase
          .from("join_requests")
          .select("id, user_id, created_at, profiles(display_name, username)")
          .eq("team_id", team.id)
          .eq("status", "pending")
          .order("created_at")
      : Promise.resolve({ data: [], error: null }),

    features.training
      ? supabase
          .from("training_sessions")
          .select("user_id, duration_minutes, distance_km, session_type")
          .eq("team_id", team.id)
          .gte("session_date", weekStart)
      : Promise.resolve({ data: [], error: null }),
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

  const joinMode = (teamDataResult.data?.join_mode ?? "invite_only") as "open" | "request" | "invite_only"

  // Build per-user training aggregates for this week
  const trainingWeekMap = new Map<string, TrainingWeekEntry>()
  for (const s of trainingWeekResult.data ?? []) {
    if (!s.user_id) continue
    const entry = trainingWeekMap.get(s.user_id) ?? { user_id: s.user_id, sessions: 0, minutes: 0, km: 0 }
    entry.sessions += 1
    entry.minutes += s.duration_minutes ?? 0
    entry.km += s.distance_km ?? 0
    trainingWeekMap.set(s.user_id, entry)
  }
  const trainingWeek = Array.from(trainingWeekMap.values())

  const joinRequests: JoinRequest[] = (joinRequestsResult.data ?? []).map((r) => {
    const profile = r.profiles as unknown as { display_name: string | null; username: string } | null
    return {
      id: r.id,
      user_id: r.user_id,
      created_at: r.created_at,
      display_name: profile?.display_name || profile?.username || "Usuario",
      username: profile?.username || "",
    }
  })

  return (
    <AppShell>
      <TeamView
        team={team}
        members={members}
        stats={teamStats}
        isAdmin={isAdmin}
        joinMode={joinMode}
        joinRequests={joinRequests}
        trainingWeek={trainingWeek}
      />
    </AppShell>
  )
}
