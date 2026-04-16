import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { DirectoryView, type PublicTeam } from "./directory-view"

type DirectoryRow = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  join_mode: string
  member_count: number
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

export default async function DirectoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const [directoryResult, membershipsResult, requestsResult] = await Promise.all([
    supabase.rpc("get_public_directory"),
    supabase
      .from("team_members")
      .select("team_id, role")
      .eq("user_id", user.id)
      .eq("status", "active"),
    supabase
      .from("join_requests")
      .select("team_id")
      .eq("user_id", user.id)
      .eq("status", "pending"),
  ])

  const rows: DirectoryRow[] = (directoryResult.data ?? []) as DirectoryRow[]

  const memberMap: Record<string, "admin" | "player"> = {}
  for (const m of membershipsResult.data ?? []) {
    memberMap[m.team_id] = m.role as "admin" | "player"
  }

  const pendingTeamIds = new Set((requestsResult.data ?? []).map((r) => r.team_id))

  const teams: PublicTeam[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    logo_url: r.logo_url,
    primary_color: r.primary_color || "#D7FF00",
    secondary_color: r.secondary_color || "#000000",
    join_mode: (r.join_mode as "open" | "request" | "invite_only") || "invite_only",
    member_count: Number(r.member_count),
    matches_played: Number(r.matches_played),
    wins: Number(r.wins),
    draws: Number(r.draws),
    losses: Number(r.losses),
    goals_for: Number(r.goals_for),
    goals_against: Number(r.goals_against),
    is_member: r.id in memberMap,
    role: memberMap[r.id],
    has_pending_request: pendingTeamIds.has(r.id),
  }))

  return (
    <AppShell>
      <div className="min-h-full bg-black relative">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div className="fixed bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-emerald-950/20 to-transparent pointer-events-none" />
        <DirectoryView teams={teams} />
      </div>
    </AppShell>
  )
}
