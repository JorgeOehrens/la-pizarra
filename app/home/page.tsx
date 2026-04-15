import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { MatchCard } from "@/components/match-card"
import { AttendanceWidget } from "@/components/attendance-widget"
import { getActiveTeamMembership } from "@/lib/team"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  ChevronDown,
  Calendar,
  Users,
  Settings,
  Plus,
  UserPlus,
  MapPin,
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// ─── Types ───────────────────────────────────────────────────────────────────

type Team = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  created_at: string
}

type TeamStats = {
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
}

type Match = {
  id: string
  opponent_name: string
  match_date: string
  type: "friendly" | "league" | "cup" | "tournament"
  status: string
  goals_for: number | null
  goals_against: number | null
  venue_custom: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "d MMM · HH:mm", { locale: es })
  } catch {
    return dateStr
  }
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    friendly: "Amistoso",
    league: "Liga",
    cup: "Copa",
    tournament: "Torneo",
  }
  return map[type] ?? type
}

function matchResult(m: Match): "win" | "loss" | "draw" {
  if (m.goals_for === null || m.goals_against === null) return "draw"
  if (m.goals_for > m.goals_against) return "win"
  if (m.goals_for < m.goals_against) return "loss"
  return "draw"
}

function getFormLetter(m: Match): "W" | "L" | "D" {
  const r = matchResult(m)
  return r === "win" ? "W" : r === "loss" ? "L" : "D"
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Auth guard
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // 2. Get active team membership
  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  const team = membership.teams as Team

  // Check if user belongs to multiple teams (for switcher)
  const { count: teamCount } = await supabase
    .from("team_members")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active")

  // 3. Fetch all data in parallel
  const [statsResult, nextMatchResult, recentMatchesResult] = await Promise.all([
    supabase
      .from("team_stats")
      .select("*")
      .eq("team_id", team.id)
      .maybeSingle(),

    supabase
      .from("matches")
      .select("id, opponent_name, match_date, type, status, goals_for, goals_against, venue_custom")
      .eq("team_id", team.id)
      .eq("status", "scheduled")
      .gt("match_date", new Date().toISOString())
      .is("deleted_at", null)
      .order("match_date", { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from("matches")
      .select("id, opponent_name, match_date, type, status, goals_for, goals_against, venue_custom")
      .eq("team_id", team.id)
      .eq("status", "finished")
      .is("deleted_at", null)
      .order("match_date", { ascending: false })
      .limit(5),
  ])

  const stats: TeamStats = {
    matches_played: Number(statsResult.data?.matches_played ?? 0),
    wins: Number(statsResult.data?.wins ?? 0),
    draws: Number(statsResult.data?.draws ?? 0),
    losses: Number(statsResult.data?.losses ?? 0),
    goals_for: Number(statsResult.data?.goals_for ?? 0),
    goals_against: Number(statsResult.data?.goals_against ?? 0),
    goal_difference: Number(statsResult.data?.goal_difference ?? 0),
  }

  const nextMatch: Match | null = nextMatchResult.data ?? null
  const recentMatches: Match[] = recentMatchesResult.data ?? []

  // 4. Fetch attendance in parallel: next match + recent finished matches
  const recentMatchIds = recentMatches.map((m) => m.id)
  const recentAttendanceMap: Record<string, "confirmed" | "declined" | null> =
    Object.fromEntries(recentMatchIds.map((id) => [id, null]))

  const [nextAttResult, recentAttResult] = await Promise.all([
    nextMatch
      ? supabase
          .from("match_attendance")
          .select("status")
          .eq("match_id", nextMatch.id)
          .eq("user_id", user.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    recentMatchIds.length > 0
      ? supabase
          .from("match_attendance")
          .select("match_id, status")
          .eq("user_id", user.id)
          .in("match_id", recentMatchIds)
      : Promise.resolve({ data: [] as { match_id: string; status: string }[], error: null }),
  ])

  const myNextMatchAttendance =
    (nextAttResult.data?.status as "confirmed" | "declined" | null) ?? null

  for (const row of recentAttResult.data ?? []) {
    recentAttendanceMap[row.match_id] = row.status as "confirmed" | "declined"
  }

  // 5. Derived values
  const isEmpty = stats.matches_played === 0 && !nextMatch

  const winRate =
    stats.matches_played > 0
      ? Math.round((stats.wins / stats.matches_played) * 100)
      : 0

  const recentForm = recentMatches.slice(0, 5).map(getFormLetter)

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="px-4 pt-6 pb-6 max-w-lg mx-auto">

        {/* ── Header ── */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {team.logo_url ? (
              <Image
                src={team.logo_url}
                alt={team.name}
                width={48}
                height={48}
                className="rounded-xl object-cover flex-shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl font-bold flex-shrink-0"
                style={{
                  backgroundColor: team.primary_color || "#D7FF00",
                  color: team.secondary_color || "#000000",
                }}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground">
                Bienvenido a
              </p>
              {(teamCount ?? 0) >= 2 ? (
                <Link
                  href="/team-select"
                  className="flex items-center gap-1 group"
                >
                  <h1 className="font-display text-2xl leading-tight truncate group-hover:text-accent transition-colors">
                    {team.name}
                  </h1>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                </Link>
              ) : (
                <h1 className="font-display text-2xl leading-tight truncate">
                  {team.name}
                </h1>
              )}
            </div>
          </div>
          <Link
            href="/profile"
            className="p-2 -mr-1 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </header>

        {/* ── ZONA CERO ── */}
        {isEmpty ? (
          <ZonaCero teamName={team.name} />
        ) : (
          <Dashboard
            team={team}
            stats={stats}
            winRate={winRate}
            recentForm={recentForm}
            nextMatch={nextMatch}
            recentMatches={recentMatches}
            myNextMatchAttendance={myNextMatchAttendance}
            recentAttendanceMap={recentAttendanceMap}
          />
        )}
      </div>
    </AppShell>
  )
}

// ─── Zona Cero ───────────────────────────────────────────────────────────────

function ZonaCero({ teamName }: { teamName: string }) {
  return (
    <div className="space-y-4">
      {/* Main card */}
      <div className="rounded-2xl bg-card border border-border p-8 text-center">
        {/* Visual */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 bg-accent/10 rounded-full" />
          <div className="absolute inset-3 bg-accent/15 rounded-full" />
          <div className="absolute inset-6 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="font-display text-3xl text-accent leading-none">0</span>
          </div>
        </div>

        <h2 className="font-display text-2xl mb-2">Tu equipo está listo</h2>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-[260px] mx-auto mb-8">
          <span className="text-foreground font-medium">{teamName}</span> existe,
          pero aún no tiene partidos ni estadísticas registradas.
        </p>

        {/* CTAs */}
        <div className="space-y-3">
          <Link
            href="/matches/new"
            className="flex items-center justify-center gap-2 w-full bg-accent text-accent-foreground py-4 rounded-xl font-medium uppercase tracking-wider hover:bg-accent-hover active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Crear primer partido
          </Link>
          <Link
            href="/team"
            className="flex items-center justify-center gap-2 w-full bg-transparent border border-border text-foreground py-4 rounded-xl font-medium uppercase tracking-wider hover:border-accent/50 active:scale-[0.98] transition-all"
          >
            <UserPlus className="h-4 w-4 text-accent" />
            Gestionar plantilla
          </Link>
        </div>
      </div>

      {/* Feature hints */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border/40">
          <Calendar className="h-5 w-5 text-accent mb-3" />
          <p className="text-sm font-medium mb-1">Registra partidos</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Guarda resultados, goles y asistencias
          </p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/40">
          <Users className="h-5 w-5 text-accent mb-3" />
          <p className="text-sm font-medium mb-1">Gestiona jugadores</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Añade miembros y asigna posiciones
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Full Dashboard ───────────────────────────────────────────────────────────

function Dashboard({
  team,
  stats,
  winRate,
  recentForm,
  nextMatch,
  recentMatches,
  myNextMatchAttendance,
  recentAttendanceMap,
}: {
  team: Team
  stats: TeamStats
  winRate: number
  recentForm: ("W" | "L" | "D")[]
  nextMatch: Match | null
  recentMatches: Match[]
  myNextMatchAttendance: "confirmed" | "declined" | null
  recentAttendanceMap: Record<string, "confirmed" | "declined" | null>
}) {
  return (
    <div className="space-y-5">
      {/* ── Win Rate Card ── */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: team.primary_color || "#D7FF00" }}
      >
        <div className="flex items-end justify-between">
          <div>
            <p
              className="text-[11px] uppercase tracking-widest mb-1 opacity-60"
              style={{ color: team.secondary_color || "#000" }}
            >
              Tasa de victoria
            </p>
            <p
              className="font-display text-7xl leading-none"
              style={{ color: team.secondary_color || "#000" }}
            >
              {winRate}
              <span className="text-3xl">%</span>
            </p>
            <p
              className="text-xs mt-2 opacity-50"
              style={{ color: team.secondary_color || "#000" }}
            >
              {stats.matches_played} partidos · {stats.wins}G {stats.draws}E {stats.losses}P
            </p>
          </div>

          {/* Recent form */}
          <div className="flex flex-col items-end gap-1.5">
            <p
              className="text-[10px] uppercase tracking-widest opacity-50 mb-0.5"
              style={{ color: team.secondary_color || "#000" }}
            >
              Forma
            </p>
            <div className="flex gap-1">
              {recentForm.map((r, i) => (
                <div
                  key={i}
                  className="w-7 h-9 rounded flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor:
                      r === "W"
                        ? "rgba(0,0,0,0.85)"
                        : r === "L"
                        ? "rgba(0,0,0,0.25)"
                        : "rgba(0,0,0,0.12)",
                    color:
                      r === "W"
                        ? team.primary_color || "#D7FF00"
                        : "rgba(0,0,0,0.5)",
                  }}
                >
                  {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Partidos" value={stats.matches_played} size="sm" />
        <StatCard label="Victorias" value={stats.wins} size="sm" />
        <StatCard label="Goles" value={stats.goals_for} size="sm" />
      </div>

      {/* ── Next Match ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Próximo partido</h2>
          <Link
            href="/matches/new"
            className="text-accent text-xs uppercase tracking-wider flex items-center gap-1 hover:opacity-80"
          >
            <Plus className="h-3 w-3" />
            Crear
          </Link>
        </div>

        {nextMatch ? (
          <div className="bg-card rounded-xl p-4 border border-border/30">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                {typeLabel(nextMatch.type)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(nextMatch.match_date)}
              </span>
            </div>

            <div className="flex items-center justify-center gap-4 py-2">
              <span className="text-sm font-semibold flex-1 text-right">
                {team.name}
              </span>
              <span className="text-xs text-muted-foreground uppercase tracking-widest px-3 py-1 bg-muted rounded">
                vs
              </span>
              <span className="text-sm font-semibold flex-1">
                {nextMatch.opponent_name}
              </span>
            </div>

            {nextMatch.venue_custom && (
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/50">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {nextMatch.venue_custom}
                </span>
              </div>
            )}

            <AttendanceWidget
              matchId={nextMatch.id}
              currentStatus={myNextMatchAttendance}
              compact
            />
          </div>
        ) : (
          <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-dashed border-border">
            <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm text-muted-foreground">
                No hay próximos partidos
              </p>
              <Link
                href="/matches/new"
                className="text-accent text-xs hover:underline"
              >
                Registrar partido →
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* ── Recent Results ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl">Últimos resultados</h2>
          <Link
            href="/matches"
            className="text-accent text-xs uppercase tracking-wider flex items-center gap-1 hover:opacity-80"
          >
            Ver todos
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {recentMatches.length > 0 ? (
          <div className="space-y-2">
            {recentMatches.map((m) => (
              <div key={m.id}>
                <MatchCard
                  id={m.id}
                  homeTeam={team.name}
                  awayTeam={m.opponent_name}
                  homeScore={m.goals_for ?? undefined}
                  awayScore={m.goals_against ?? undefined}
                  date={formatDate(m.match_date)}
                  competition={typeLabel(m.type)}
                  result={matchResult(m)}
                  className={recentAttendanceMap[m.id] === null ? "rounded-b-none" : ""}
                />
                {recentAttendanceMap[m.id] === null && (
                  <div className="bg-card rounded-b-lg border-x border-b border-border/30 px-4 pb-3">
                    <AttendanceWidget
                      matchId={m.id}
                      currentStatus={null}
                      compact
                      matchStatus="finished"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card rounded-xl p-5 text-center border border-border/30">
            <p className="text-sm text-muted-foreground">Sin partidos jugados</p>
          </div>
        )}
      </section>

      {/* ── Quick Actions ── */}
      <section>
        <h2 className="font-display text-xl mb-3">Acciones rápidas</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/team"
            className="bg-card rounded-xl p-4 flex flex-col gap-2.5 active:scale-[0.97] transition-transform border border-border/40 hover:border-border"
          >
            <Users className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Ver plantilla</span>
          </Link>
          <Link
            href="/matches/new"
            className="bg-card rounded-xl p-4 flex flex-col gap-2.5 active:scale-[0.97] transition-transform border border-border/40 hover:border-border"
          >
            <Calendar className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Registrar partido</span>
          </Link>
        </div>
      </section>
    </div>
  )
}
