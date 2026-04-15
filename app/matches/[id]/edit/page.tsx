import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getActiveTeamMembership } from "@/lib/team"
import { EditMatchForm } from "./edit-match-form"

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: matchId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect("/team-select")
  if (membership.role !== "admin") redirect(`/matches/${matchId}`)

  const teamId = membership.team_id

  // Load match + events + team members in parallel
  const [matchRes, eventsRes, membersRes] = await Promise.all([
    supabase
      .from("matches")
      .select(
        "id, opponent_name, match_date, venue_custom, type, status, goals_for, goals_against, is_home, competition_name, notes"
      )
      .eq("id", matchId)
      .eq("team_id", teamId)
      .is("deleted_at", null)
      .maybeSingle(),

    supabase
      .from("match_events")
      .select("id, event_type, minute, player_id, assisted_by")
      .eq("match_id", matchId)
      .order("minute", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true }),

    supabase
      .from("team_members")
      .select("user_id, jersey_number, position, profiles(display_name, username)")
      .eq("team_id", teamId)
      .eq("status", "active")
      .not("user_id", "is", null)
      .order("jersey_number", { ascending: true, nullsFirst: false }),
  ])

  if (!matchRes.data) redirect("/matches")

  const match = matchRes.data
  // Don't allow editing cancelled/postponed matches
  if (match.status === "cancelled" || match.status === "postponed") {
    redirect(`/matches/${matchId}`)
  }

  const rawEvents = eventsRes.data ?? []
  const members = membersRes.data ?? []

  // Build player list
  const players = members.map((m) => {
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

  // Build player lookup
  const playerMap = new Map(players.map((p) => [p.id, p]))

  // Convert DB events to MatchEvent format for the form
  // Pair goal + assist events together
  type LocalEvent = {
    id: string
    side: "mine" | "rival"
    kind: "goal" | "own_goal" | "yellow_card" | "red_card"
    playerId?: string
    playerName?: string
    assistPlayerId?: string
    assistPlayerName?: string
    minute?: number
  }

  const localEvents: LocalEvent[] = []
  for (const ev of rawEvents) {
    if (!["goal", "own_goal", "opponent_goal", "yellow_card", "red_card"].includes(ev.event_type)) continue

    const player = ev.player_id ? playerMap.get(ev.player_id) : null
    const assistPlayer = (ev as { assisted_by?: string | null }).assisted_by
      ? playerMap.get((ev as { assisted_by?: string | null }).assisted_by!)
      : null

    if (ev.event_type === "goal") {
      localEvents.push({
        id: ev.id,
        side: "mine",
        kind: "goal",
        playerId: ev.player_id ?? undefined,
        playerName: player?.name,
        assistPlayerId: (ev as { assisted_by?: string | null }).assisted_by ?? undefined,
        assistPlayerName: assistPlayer?.name,
        minute: ev.minute ?? undefined,
      })
    } else if (ev.event_type === "own_goal") {
      localEvents.push({
        id: ev.id,
        side: "mine",
        kind: "own_goal",
        playerId: ev.player_id ?? undefined,
        playerName: player?.name,
        minute: ev.minute ?? undefined,
      })
    } else if (ev.event_type === "opponent_goal") {
      localEvents.push({
        id: ev.id,
        side: "rival",
        kind: "goal",
        minute: ev.minute ?? undefined,
      })
    } else if (ev.event_type === "yellow_card") {
      localEvents.push({
        id: ev.id,
        side: ev.player_id ? "mine" : "rival",
        kind: "yellow_card",
        playerId: ev.player_id ?? undefined,
        playerName: player?.name,
        minute: ev.minute ?? undefined,
      })
    } else if (ev.event_type === "red_card") {
      localEvents.push({
        id: ev.id,
        side: ev.player_id ? "mine" : "rival",
        kind: "red_card",
        playerId: ev.player_id ?? undefined,
        playerName: player?.name,
        minute: ev.minute ?? undefined,
      })
    }
  }

  // Parse match date/time
  const matchDateObj = new Date(match.match_date)
  const matchDateStr = matchDateObj.toISOString().split("T")[0]
  const matchTimeStr = matchDateObj.toTimeString().slice(0, 5)

  return (
    <EditMatchForm
      matchId={matchId}
      initialData={{
        opponentName: match.opponent_name,
        isHome: match.is_home ?? true,
        matchType: (match.type as "friendly" | "league" | "cup" | "tournament"),
        competitionName: match.competition_name ?? "",
        matchDate: matchDateStr,
        matchTime: matchTimeStr,
        venueCustom: match.venue_custom ?? "",
        status: match.status as "scheduled" | "finished" | "cancelled" | "postponed",
        notes: match.notes ?? "",
      }}
      initialEvents={localEvents}
      players={players}
      teamName={membership.teams.name}
    />
  )
}
