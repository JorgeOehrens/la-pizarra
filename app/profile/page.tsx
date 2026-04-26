import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { getActiveTeamMembership } from "@/lib/team"
import { ChevronRight, User, LogOut, PlusCircle, Compass, LayoutGrid, Trophy } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { logout } from "@/app/auth/actions"
import { features } from "@/lib/features"

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Portero",
  defender: "Defensa",
  midfielder: "Mediocampista",
  forward: "Delantero",
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  // Parallel: profile + active membership
  const [profileRes, membership] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),

    getActiveTeamMembership(supabase, user.id),
  ])

  const profile = profileRes.data
  const team = membership?.teams as { name: string } | null

  const displayName = profile?.display_name || profile?.username || "Jugador"
  const initials = getInitials(displayName)

  // Fetch stats + attendance in parallel only if the user is in a team
  let stats = { matches_played: 0, goals: 0, assists: 0 }
  let confirmedAttendanceCount = 0

  if (membership?.team_id) {
    const [statsRes, attendanceRes] = await Promise.all([
      supabase
        .from("player_stats")
        .select("matches_played, goals, assists")
        .eq("player_id", user.id)
        .eq("team_id", membership.team_id)
        .maybeSingle(),

      supabase
        .from("match_attendance")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "confirmed"),
    ])

    if (statsRes.data) {
      stats = {
        matches_played: Number(statsRes.data.matches_played),
        goals: Number(statsRes.data.goals),
        assists: Number(statsRes.data.assists),
      }
    }
    confirmedAttendanceCount = attendanceRes.count ?? 0
  }

  const goalsPerMatch =
    stats.matches_played > 0
      ? (stats.goals / stats.matches_played).toFixed(1)
      : "—"

  const attendanceRate =
    stats.matches_played > 0
      ? Math.round((confirmedAttendanceCount / stats.matches_played) * 100)
      : null

  const positionLabel = membership?.position ? POSITION_LABEL[membership.position] : null
  const jerseyLabel = membership?.jersey_number != null ? `#${membership.jersey_number}` : null
  const subLabel = [positionLabel, jerseyLabel].filter(Boolean).join(" · ")
  const isAdmin = membership?.role === "admin"

  return (
    <AppShell>
      <div className="px-4 pt-6 pb-8 max-w-lg mx-auto">
        <header className="mb-8">
          <h1 className="font-display text-3xl">Perfil</h1>
        </header>

        {/* ── User card ─────────────────────────────────── */}
        <div className="bg-card rounded-2xl p-5 mb-4">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center shrink-0 overflow-hidden">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-display text-2xl text-accent-foreground">
                  {initials}
                </span>
              )}
            </div>

            {/* Name + details */}
            <div className="flex-1 min-w-0">
              <h2 className="font-display text-xl truncate">{displayName}</h2>
              {profile?.username && (
                <p className="text-xs text-muted-foreground">@{profile.username}</p>
              )}
              {subLabel && (
                <p className="text-sm text-muted-foreground mt-0.5">{subLabel}</p>
              )}
              {team && (
                <p className="text-xs text-accent mt-1 truncate">{team.name}</p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-border/40">
            <div className="text-center">
              <p className="font-display text-xl tabular-nums">{stats.matches_played}</p>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5 leading-tight">Partidos</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl text-accent tabular-nums">{stats.goals}</p>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5 leading-tight">Goles</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl tabular-nums">{stats.assists}</p>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5 leading-tight">Asistencias</p>
            </div>
            <div className="text-center">
              <p className="font-display text-xl tabular-nums">{goalsPerMatch}</p>
              <p className="text-[9px] text-muted-foreground uppercase mt-0.5 leading-tight">Goles/PJ</p>
            </div>
          </div>

          {/* Attendance rate */}
          {attendanceRate !== null && (
            <div className="mt-3 pt-3 border-t border-border/30">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Asistencia</span>
                <span className="font-display text-base tabular-nums">
                  {attendanceRate}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full transition-all"
                  style={{ width: `${attendanceRate}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Role badge ────────────────────────────────── */}
        {membership && (
          <div className="bg-accent/10 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Rol en el equipo</p>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? "Administrador del equipo" : "Jugador"}
              </p>
            </div>
            <span className={cn(
              "px-3 py-1 text-xs uppercase tracking-wider rounded-full font-medium",
              isAdmin
                ? "bg-accent text-accent-foreground"
                : "bg-muted text-muted-foreground"
            )}>
              {isAdmin ? "Admin" : "Jugador"}
            </span>
          </div>
        )}

        {/* ── Menu ─────────────────────────────────────── */}
        <nav className="space-y-1 mb-6">
          <Link
            href={`/players/${user.id}/edit`}
            className="flex items-center gap-4 bg-card rounded-xl p-4 active:scale-[0.98] transition-transform"
          >
            <User className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Editar perfil</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link
            href="/onboarding/create-team"
            className="flex items-center gap-4 bg-card rounded-xl p-4 active:scale-[0.98] transition-transform"
          >
            <PlusCircle className="h-5 w-5 text-muted-foreground" />
            <span className="flex-1 text-sm">Crear nuevo equipo</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          {features.leagues && (
            <Link
              href="/onboarding/create-league"
              className="flex items-center gap-4 bg-card rounded-xl p-4 active:scale-[0.98] transition-transform"
            >
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <span className="text-sm block">Crear liga</span>
                <span className="text-xs text-muted-foreground">Organizar torneo o liga amateur</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
          <Link
            href="/directory"
            className="flex items-center gap-4 bg-card rounded-xl p-4 active:scale-[0.98] transition-transform"
          >
            <Compass className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <span className="text-sm block">Explorar equipos</span>
              <span className="text-xs text-muted-foreground">Buscar y unirse a un equipo</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          {membership && (
            <Link
              href="/team-select"
              className="flex items-center gap-4 bg-card rounded-xl p-4 active:scale-[0.98] transition-transform"
            >
              <LayoutGrid className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-sm">Cambiar de equipo</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )}
        </nav>

        {/* ── Logout ───────────────────────────────────── */}
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-4 bg-card rounded-xl p-4 text-destructive active:scale-[0.98] transition-transform"
          >
            <LogOut className="h-5 w-5" />
            <span className="flex-1 text-sm text-left">Cerrar sesión</span>
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-8">LaPizarra v1.0.0</p>
      </div>
    </AppShell>
  )
}
