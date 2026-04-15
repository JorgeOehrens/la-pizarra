import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { ChevronLeft, Edit } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Portero",
  defender: "Defensa",
  midfielder: "Mediocampista",
  forward: "Delantero",
}

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: playerId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Current user's team membership
  const { data: membership } = await supabase
    .from("team_members")
    .select("team_id, role")
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  if (!membership?.team_id) redirect("/onboarding")

  const teamId = membership.team_id
  const isAdmin = membership.role === "admin"
  const isOwnProfile = user.id === playerId

  // Fetch player data in parallel
  const [memberResult, statsResult, eventsResult] = await Promise.all([
    supabase
      .from("team_members")
      .select("jersey_number, position, role, profiles(display_name, username, avatar_url)")
      .eq("user_id", playerId)
      .eq("team_id", teamId)
      .eq("status", "active")
      .maybeSingle(),

    supabase
      .from("player_stats")
      .select("goals, assists, matches_played")
      .eq("player_id", playerId)
      .eq("team_id", teamId)
      .maybeSingle(),

    supabase
      .from("match_events")
      .select("event_type, matches(opponent_name, match_date)")
      .eq("player_id", playerId)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false })
      .limit(15),
  ])

  if (!memberResult.data) redirect("/team")

  const member = memberResult.data
  const profile = member.profiles as unknown as {
    display_name: string | null
    username: string
    avatar_url: string | null
  } | null
  const displayName = profile?.display_name || profile?.username || "Jugador"

  const stats = {
    goals: Number(statsResult.data?.goals ?? 0),
    assists: Number(statsResult.data?.assists ?? 0),
    matches_played: Number(statsResult.data?.matches_played ?? 0),
  }

  type EventRow = {
    event_type: string
    opponent: string
    date: string
  }

  const allEvents: EventRow[] = (eventsResult.data ?? []).map((e) => {
    const match = e.matches as unknown as { opponent_name: string; match_date: string } | null
    return {
      event_type: e.event_type as string,
      opponent: match?.opponent_name ?? "Rival",
      date: match?.match_date
        ? format(new Date(match.match_date), "d MMM", { locale: es })
        : "",
    }
  })

  const yellowCards = allEvents.filter((e) => e.event_type === "yellow_card").length
  const redCards = allEvents.filter((e) => e.event_type === "red_card").length
  const activityFeed = allEvents.filter(
    (e) => e.event_type === "goal" || e.event_type === "assist"
  )

  const canEdit = isAdmin || isOwnProfile

  return (
    <AppShell showNav={false}>
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/team" className="p-2 -ml-2 rounded-lg hover:bg-card">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl">Jugador</h1>
          {canEdit ? (
            <Link
              href={`/players/${playerId}/edit`}
              className="p-2 -mr-2 rounded-lg hover:bg-card"
            >
              <Edit className="h-5 w-5" />
            </Link>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Player hero */}
        <div className="relative mb-6">
          <div className="aspect-[4/3] bg-gradient-to-b from-muted to-card rounded-xl flex items-center justify-center overflow-hidden">
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display text-[120px] text-muted-foreground/10 leading-none">
                {member.jersey_number ?? "?"}
              </span>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
            <h2 className="font-display text-4xl text-white">{displayName}</h2>
            <p className="text-accent text-sm uppercase tracking-wider mt-0.5">
              {POSITION_LABEL[member.position ?? ""] ?? "Sin posición"}
              {member.jersey_number != null ? ` | #${member.jersey_number}` : ""}
            </p>
          </div>
        </div>

        {/* Main stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Partidos" value={stats.matches_played} />
          <StatCard label="Goles" value={stats.goals} variant="accent" />
          <StatCard label="Asistencias" value={stats.assists} />
          <StatCard
            label="Tarjetas"
            value={
              yellowCards === 0 && redCards === 0
                ? "0"
                : `${yellowCards}A${redCards > 0 ? ` ${redCards}R` : ""}`
            }
          />
        </div>

        {/* Recent activity */}
        <section className="bg-card rounded-xl p-5 mb-6 border border-border/40">
          <h3 className="font-display text-lg mb-4">Actividad reciente</h3>
          {activityFeed.length > 0 ? (
            <div className="space-y-3">
              {activityFeed.slice(0, 8).map((activity, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xl">
                    {activity.event_type === "goal" ? "⚽" : "🎯"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-accent font-semibold">
                      {activity.event_type === "goal" ? "Gol" : "Asistencia"}
                    </span>
                    <span className="text-muted-foreground truncate">
                      {" "}vs {activity.opponent}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {activity.date}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin actividad registrada
            </p>
          )}
        </section>

        {/* Detailed stats */}
        <section className="bg-card rounded-xl p-5 border border-border/40">
          <h3 className="font-display text-lg mb-4">Estadísticas detalladas</h3>
          <div className="space-y-1">
            <StatRow
              label="Goles por partido"
              value={
                stats.matches_played > 0
                  ? (stats.goals / stats.matches_played).toFixed(2)
                  : "—"
              }
            />
            <StatRow
              label="Asistencias por partido"
              value={
                stats.matches_played > 0
                  ? (stats.assists / stats.matches_played).toFixed(2)
                  : "—"
              }
            />
            <StatRow label="Tarjetas amarillas" value={yellowCards} />
            <StatRow
              label="Tarjetas rojas"
              value={redCards}
              valueClassName={redCards > 0 ? "text-destructive" : undefined}
              last
            />
          </div>
        </section>
      </div>
    </AppShell>
  )
}

function StatRow({
  label,
  value,
  valueClassName,
  last,
}: {
  label: string
  value: string | number
  valueClassName?: string
  last?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        last ? "" : "border-b border-border/40"
      }`}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-display text-lg ${valueClassName ?? ""}`}>{value}</span>
    </div>
  )
}
