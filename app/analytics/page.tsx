import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { AnalyticsChart } from "./analytics-chart"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, teams(id, name)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!membership?.teams) redirect("/onboarding")

  const team = membership.teams as { id: string; name: string }

  // Fetch everything in parallel
  const [statsResult, playerStatsResult, membersResult, matchesResult] =
    await Promise.all([
      supabase
        .from("team_stats")
        .select("matches_played, wins, draws, losses, goals_for, goals_against, goal_difference")
        .eq("team_id", team.id)
        .maybeSingle(),

      supabase
        .from("player_stats")
        .select("player_id, goals, assists, matches_played")
        .eq("team_id", team.id),

      supabase
        .from("team_members")
        .select("user_id, profiles(username, display_name)")
        .eq("team_id", team.id)
        .eq("status", "active"),

      supabase
        .from("matches")
        .select("match_date, goals_for, goals_against, status")
        .eq("team_id", team.id)
        .eq("status", "finished")
        .is("deleted_at", null)
        .order("match_date", { ascending: true }),
    ])

  const stats = {
    matches_played: Number(statsResult.data?.matches_played ?? 0),
    wins: Number(statsResult.data?.wins ?? 0),
    draws: Number(statsResult.data?.draws ?? 0),
    losses: Number(statsResult.data?.losses ?? 0),
    goals_for: Number(statsResult.data?.goals_for ?? 0),
    goals_against: Number(statsResult.data?.goals_against ?? 0),
    goal_difference: Number(statsResult.data?.goal_difference ?? 0),
  }

  // Build name lookup from members
  const nameMap = new Map(
    (membersResult.data ?? []).map((m) => {
      const p = m.profiles as { username: string; display_name: string | null } | null
      return [m.user_id, p?.display_name || p?.username || "Jugador"]
    })
  )

  // Enrich player stats with names
  const enrichedStats = (playerStatsResult.data ?? []).map((s) => ({
    player_id: s.player_id,
    display_name: nameMap.get(s.player_id) ?? "Jugador",
    goals: Number(s.goals),
    assists: Number(s.assists),
    matches_played: Number(s.matches_played),
  }))

  const topScorers = [...enrichedStats]
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals)
    .slice(0, 5)
    .map((s) => ({ display_name: s.display_name, value: s.goals }))

  const topAssists = [...enrichedStats]
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists)
    .slice(0, 5)
    .map((s) => ({ display_name: s.display_name, value: s.assists }))

  // Group matches by month for chart
  const monthMap = new Map<string, { wins: number; draws: number; losses: number }>()
  for (const m of matchesResult.data ?? []) {
    const month = format(new Date(m.match_date), "MMM", { locale: es })
    if (!monthMap.has(month)) monthMap.set(month, { wins: 0, draws: 0, losses: 0 })
    const bucket = monthMap.get(month)!
    if ((m.goals_for ?? 0) > (m.goals_against ?? 0)) bucket.wins++
    else if ((m.goals_for ?? 0) < (m.goals_against ?? 0)) bucket.losses++
    else bucket.draws++
  }

  const chartData = Array.from(monthMap.entries()).map(([month, v]) => ({
    month,
    ...v,
  }))

  // Simple trend: compare last two "months" win rate
  let trend = 0
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1]
    const prev = chartData[chartData.length - 2]
    const lastTotal = last.wins + last.draws + last.losses
    const prevTotal = prev.wins + prev.draws + prev.losses
    if (lastTotal > 0 && prevTotal > 0) {
      const lastWR = Math.round((last.wins / lastTotal) * 100)
      const prevWR = Math.round((prev.wins / prevTotal) * 100)
      trend = lastWR - prevWR
    }
  }

  // Goals per match
  const goalsFor = stats.matches_played > 0
    ? (stats.goals_for / stats.matches_played).toFixed(1)
    : "—"
  const goalsAgainst = stats.matches_played > 0
    ? (stats.goals_against / stats.matches_played).toFixed(1)
    : "—"
  const goalDiff = stats.goal_difference >= 0
    ? `+${stats.goal_difference}`
    : `${stats.goal_difference}`

  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        {/* Header */}
        <header className="mb-6">
          <p className="label-text mb-1 text-muted-foreground">{team.name}</p>
          <h1 className="font-display text-3xl">Estadísticas</h1>
        </header>

        {/* Overview */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard label="Partidos" value={stats.matches_played} />
          <StatCard label="Victorias" value={stats.wins} variant="accent" />
          <StatCard label="Goles a favor" value={stats.goals_for} />
          <StatCard label="Goles en contra" value={stats.goals_against} />
        </div>

        {/* Goals per match */}
        <section className="bg-card rounded-xl p-5 mb-5 border border-border/40">
          <h2 className="font-display text-lg mb-4">Goles por partido</h2>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="font-display text-4xl text-accent">{goalsFor}</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">A favor</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center flex-1">
              <p className="font-display text-4xl">{goalsAgainst}</p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">En contra</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center flex-1">
              <p className={`font-display text-4xl ${stats.goal_difference >= 0 ? "text-accent" : "text-destructive"}`}>
                {stats.matches_played > 0 ? goalDiff : "—"}
              </p>
              <p className="text-[10px] text-muted-foreground uppercase mt-1">Diferencia</p>
            </div>
          </div>
        </section>

        {/* Chart + Rankings (client) */}
        <AnalyticsChart
          chartData={chartData}
          topScorers={topScorers}
          topAssists={topAssists}
          trend={trend}
        />
      </div>
    </AppShell>
  )
}
