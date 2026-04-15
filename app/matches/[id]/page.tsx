import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { ChevronLeft, Clock, MapPin, Trophy, Pencil } from "lucide-react"
import { AttendanceWidget } from "@/components/attendance-widget"
import { MatchAttendeesPanel, type AttendeeInfo } from "@/components/match-attendees-panel"
import { getActiveTeamMembership } from "@/lib/team"
import { getMatchDerivedStatus } from "@/lib/match-utils"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const TYPE_LABEL: Record<string, string> = {
  friendly: "Amistoso",
  league: "Liga",
  cup: "Copa",
  tournament: "Torneo",
}

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "POR",
  defender: "DEF",
  midfielder: "MED",
  forward: "DEL",
}

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: matchId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Current user's active team
  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")

  const teamId = membership.team_id
  const isAdmin = membership.role === "admin"
  const team = membership.teams as { id: string; name: string }

  // Parallel fetch: match + events + team members + attendance
  const [matchRes, eventsRes, membersRes, attendanceRes] = await Promise.all([
    supabase
      .from("matches")
      .select("id, opponent_name, match_date, venue_custom, type, status, goals_for, goals_against, is_home, competition_name")
      .eq("id", matchId)
      .eq("team_id", teamId)
      .maybeSingle(),

    supabase
      .from("match_events")
      .select("id, event_type, minute, player_id, assisted_by, profiles!match_events_player_id_fkey(display_name, username)")
      .eq("match_id", matchId)
      .order("minute", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),

    supabase
      .from("team_members")
      .select("user_id, jersey_number, position, guest_name, profiles(display_name, username)")
      .eq("team_id", teamId)
      .eq("status", "active"),

    supabase
      .from("match_attendance")
      .select("user_id, status")
      .eq("match_id", matchId),
  ])

  if (!matchRes.data) redirect("/matches")

  const match = matchRes.data
  const rawEvents = eventsRes.data ?? []
  const members = membersRes.data ?? []
  const attendanceRecords = attendanceRes.data ?? []

  // ── Attendance lookups ───────────────────────────────────────────────────
  const attendanceMap = new Map<string, "confirmed" | "declined">()
  for (const r of attendanceRecords) {
    attendanceMap.set(r.user_id, r.status as "confirmed" | "declined")
  }
  const myAttendance = attendanceMap.get(user.id) ?? null

  // ── Jersey/position lookup by user_id ────────────────────────────────────
  const memberMap = new Map<string, { number: number | null; position: string | null; name: string }>()
  for (const m of members) {
    if (!m.user_id) continue
    const profile = m.profiles as unknown as { display_name: string | null; username: string } | null
    memberMap.set(m.user_id, {
      number: m.jersey_number ?? null,
      position: m.position ?? null,
      name: profile?.display_name || profile?.username || (m as { guest_name?: string }).guest_name || "Jugador",
    })
  }

  function playerName(playerId: string | null, fallbackProfile: { display_name: string | null; username: string } | null): string | null {
    if (!playerId) return null
    const fromMap = memberMap.get(playerId)
    if (fromMap) return fromMap.name
    return fallbackProfile?.display_name || fallbackProfile?.username || "Jugador"
  }

  // ── Build display events ──────────────────────────────────────────────────
  type AssistInfo = { name: string; number: number | null }
  type DisplayEvent = {
    id: string
    type: "goal" | "own_goal" | "opponent_goal" | "yellow_card" | "red_card"
    minute: number | null
    playerName: string | null
    playerNumber: number | null
    assist: AssistInfo | null
    isOpponent: boolean
  }

  const displayEvents: DisplayEvent[] = []
  for (const ev of rawEvents) {
    if (!["goal", "own_goal", "opponent_goal", "yellow_card", "red_card"].includes(ev.event_type)) continue

    const profile = ev.profiles as unknown as { display_name: string | null; username: string } | null
    const pName = ev.player_id ? playerName(ev.player_id, profile) : null
    const pNumber = ev.player_id ? (memberMap.get(ev.player_id)?.number ?? null) : null
    const isOpponent = !ev.player_id || ev.event_type === "opponent_goal"

    const assistedById = (ev as { assisted_by?: string | null }).assisted_by ?? null
    const assistInfo: AssistInfo | null = assistedById
      ? {
          name: memberMap.get(assistedById)?.name ?? "Jugador",
          number: memberMap.get(assistedById)?.number ?? null,
        }
      : null

    displayEvents.push({
      id: ev.id,
      type: ev.event_type as DisplayEvent["type"],
      minute: ev.minute ?? null,
      playerName: pName,
      playerNumber: pNumber,
      assist: assistInfo,
      isOpponent,
    })
  }

  // ── Attendees list for panel ──────────────────────────────────────────────
  const attendees: AttendeeInfo[] = members
    .filter((m) => m.user_id)
    .map((m) => {
      const profile = m.profiles as unknown as { display_name: string | null; username: string } | null
      return {
        userId: m.user_id!,
        name: profile?.display_name || profile?.username || "Jugador",
        number: m.jersey_number ?? null,
        position: m.position ?? null,
        status: attendanceMap.get(m.user_id!) ?? null,
      }
    })

  // ── Derived status ───────────────────────────────────────────────────────
  const derivedStatus = getMatchDerivedStatus(match.status, match.match_date)
  const isUpcoming = derivedStatus === 'upcoming'
  const isPendingResult = derivedStatus === 'pending_result'

  // ── Result ────────────────────────────────────────────────────────────────
  const gf = match.goals_for ?? null
  const ga = match.goals_against ?? null
  const result: "win" | "draw" | "loss" | null =
    gf === null || ga === null ? null
    : gf > ga ? "win"
    : gf < ga ? "loss"
    : "draw"

  // ── Score display (respects home/away order) ──────────────────────────────
  const isHome = match.is_home ?? true
  const leftTeamName = isHome ? team.name : match.opponent_name
  const rightTeamName = isHome ? match.opponent_name : team.name
  const leftScore = isHome ? gf : ga
  const rightScore = isHome ? ga : gf
  const leftIsOurs = isHome

  // ── Formatted date/time ───────────────────────────────────────────────────
  const matchDate = new Date(match.match_date)
  const dateLabel = format(matchDate, "EEEE d 'de' MMMM yyyy", { locale: es })
  const timeLabel = format(matchDate, "HH:mm")

  const competitionLabel = match.competition_name || TYPE_LABEL[match.type] || match.type

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4 max-w-lg mx-auto">
          <Link href="/matches" className="p-2 -ml-2 rounded-lg hover:bg-card">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-lg truncate px-2">{competitionLabel}</h1>
          {isAdmin && match.status !== "cancelled" && match.status !== "postponed" ? (
            <Link
              href={`/matches/${matchId}/edit`}
              className="p-2 -mr-2 rounded-lg hover:bg-card text-muted-foreground"
            >
              <Pencil className="h-4 w-4" />
            </Link>
          ) : (
            <div className="w-9" />
          )}
        </div>
      </div>

      <div className="px-4 pb-10 max-w-lg mx-auto">
        {/* ── Score card ───────────────────────────────────── */}
        <div className="bg-card rounded-2xl p-6 mb-4">
          <p className="text-center text-xs text-muted-foreground mb-5 capitalize">{dateLabel}</p>

          <div className="flex items-center justify-between gap-2">
            {/* Left team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                leftIsOurs ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-xl",
                  leftIsOurs ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {leftTeamName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center leading-tight max-w-[80px] truncate">
                {leftTeamName}
              </p>
            </div>

            {/* Score */}
            <div className="flex flex-col items-center gap-1 px-2">
              {isUpcoming ? (
                <div className="flex items-center gap-3 py-1">
                  <span className="font-display text-3xl text-muted-foreground/40">vs</span>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="font-display text-5xl tabular-nums">
                    {leftScore ?? "–"}
                  </span>
                  <span className="text-2xl text-muted-foreground">–</span>
                  <span className="font-display text-5xl tabular-nums">
                    {rightScore ?? "–"}
                  </span>
                </div>
              )}
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                {match.status === "finished" ? "Final"
                  : isUpcoming ? "Próximo"
                  : isPendingResult ? "Pendiente"
                  : match.status}
              </span>
            </div>

            {/* Right team */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                !leftIsOurs ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-xl",
                  !leftIsOurs ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {rightTeamName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground text-center leading-tight max-w-[80px] truncate">
                {rightTeamName}
              </p>
            </div>
          </div>

          {/* Result badge */}
          {result && (
            <div className="flex justify-center mt-5">
              <span className={cn(
                "px-4 py-1.5 rounded-full text-xs uppercase tracking-widest font-medium",
                result === "win" && "bg-accent/20 text-accent",
                result === "loss" && "bg-destructive/20 text-destructive",
                result === "draw" && "bg-muted text-muted-foreground"
              )}>
                {result === "win" && "Victoria"}
                {result === "loss" && "Derrota"}
                {result === "draw" && "Empate"}
              </span>
            </div>
          )}
        </div>

        {/* ── Attendance Widget — for upcoming and finished matches ─── */}
        {(match.status === "scheduled" || match.status === "finished") && (
          <div className="mb-4">
            <AttendanceWidget
              matchId={matchId}
              currentStatus={myAttendance}
              matchStatus={match.status}
            />
          </div>
        )}

        {/* ── Match info pills ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-card rounded-xl p-4 flex items-center gap-3">
            <Trophy className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Tipo</p>
              <p className="font-medium text-sm truncate">{competitionLabel}</p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-4 flex items-center gap-3">
            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Hora</p>
              <p className="font-medium text-sm">{timeLabel}</p>
            </div>
          </div>
          {match.venue_custom && (
            <div className="col-span-2 bg-card rounded-xl p-4 flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Lugar</p>
                <p className="font-medium text-sm truncate">{match.venue_custom}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Pending result banner (admin) ─────────────────── */}
        {isPendingResult && isAdmin && (
          <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-yellow-400">Este partido ya pasó</p>
              <p className="text-xs text-muted-foreground mt-0.5">¿Ya tienes el resultado?</p>
            </div>
            <Link
              href={`/matches/${matchId}/edit`}
              className="bg-yellow-400/20 text-yellow-400 text-xs uppercase tracking-wider px-3 py-2 rounded-lg shrink-0"
            >
              Agregar resultado
            </Link>
          </div>
        )}

        {/* ── Events timeline ───────────────────────────────── */}
        {!isUpcoming && displayEvents.length > 0 && (
          <section className="mb-6">
            <h2 className="font-display text-lg mb-3">Cronología</h2>
            <div className="bg-card rounded-xl divide-y divide-border/30">
              {displayEvents.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 px-4 py-3">
                  {/* Minute */}
                  <span className="w-8 text-xs text-muted-foreground text-right shrink-0 tabular-nums">
                    {ev.minute != null ? `${ev.minute}'` : "—"}
                  </span>

                  {/* Icon */}
                  <div className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0",
                    (ev.type === "goal" || ev.type === "own_goal" || ev.type === "opponent_goal") && "bg-accent/15",
                    ev.isOpponent && ev.type !== "yellow_card" && ev.type !== "red_card" && "bg-muted",
                    ev.type === "yellow_card" && "bg-yellow-400/20",
                    ev.type === "red_card" && "bg-destructive/20",
                  )}>
                    {(ev.type === "goal" || ev.type === "own_goal" || ev.type === "opponent_goal") && "⚽"}
                    {ev.type === "yellow_card" && "🟨"}
                    {ev.type === "red_card" && "🟥"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {ev.type === "goal" && (
                      <>
                        <p className="text-sm font-medium leading-tight truncate">
                          {ev.playerName ?? "Jugador"}
                          {ev.playerNumber != null && (
                            <span className="text-muted-foreground font-normal"> #{ev.playerNumber}</span>
                          )}
                        </p>
                        {ev.assist && (
                          <p className="text-xs text-muted-foreground truncate">
                            Asistencia: {ev.assist.name}
                            {ev.assist.number != null && ` #${ev.assist.number}`}
                          </p>
                        )}
                      </>
                    )}
                    {ev.type === "own_goal" && (
                      <p className="text-sm font-medium leading-tight text-muted-foreground">
                        Autogol rival
                      </p>
                    )}
                    {ev.type === "opponent_goal" && (
                      <p className="text-sm font-medium leading-tight text-muted-foreground">
                        Gol del rival
                      </p>
                    )}
                    {ev.type === "yellow_card" && (
                      <p className="text-sm font-medium leading-tight">
                        {ev.isOpponent ? (
                          <span className="text-muted-foreground">Rival</span>
                        ) : (
                          <>
                            {ev.playerName ?? "Jugador"}
                            {ev.playerNumber != null && (
                              <span className="text-muted-foreground font-normal"> #{ev.playerNumber}</span>
                            )}
                          </>
                        )}
                      </p>
                    )}
                    {ev.type === "red_card" && (
                      <p className="text-sm font-medium leading-tight text-destructive">
                        {ev.isOpponent ? (
                          <span>Rival</span>
                        ) : (
                          <>
                            {ev.playerName ?? "Jugador"}
                            {ev.playerNumber != null && (
                              <span className="font-normal"> #{ev.playerNumber}</span>
                            )}
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── No events yet (upcoming) ──────────────────────── */}
        {isUpcoming && (
          <div className="bg-card rounded-xl p-5 text-center mb-6 border border-border/30">
            <p className="text-muted-foreground text-sm">El partido aún no ha comenzado</p>
          </div>
        )}

        {/* ── Attendees panel ───────────────────────────────── */}
        <MatchAttendeesPanel
          matchId={matchId}
          attendees={attendees}
          isAdmin={isAdmin}
          matchStatus={match.status}
        />
      </div>
    </AppShell>
  )
}
