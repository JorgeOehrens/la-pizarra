"use client"

import { useState, useTransition } from "react"
import { PerformanceRing } from "@/components/performance-ring"
import { PlayerCard } from "@/components/player-card"
import { AddPlayerSheet } from "@/components/add-player-sheet"
import { Plus, Settings, Shield, Globe, Lock, UserCheck, CheckCircle2, XCircle, Dumbbell, Trophy } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { updateJoinMode, approveJoinRequest, rejectJoinRequest } from "./actions"
import { features } from "@/lib/features"

export type MemberWithStats = {
  id: string
  user_id: string | null
  role: string
  jersey_number: number | null
  position: string | null
  display_name: string
  avatar_url: string | null
  goals: number
  assists: number
  matches_played: number
  is_guest: boolean
}

type Team = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
}

type TeamStats = {
  matches_played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
}

const POSITIONS = [
  { label: "Todos", value: null as string | null },
  { label: "Porteros", value: "goalkeeper" },
  { label: "Defensas", value: "defender" },
  { label: "Mediocampistas", value: "midfielder" },
  { label: "Delanteros", value: "forward" },
]

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Portero",
  defender: "Defensa",
  midfielder: "Mediocampista",
  forward: "Delantero",
}

export type JoinRequest = {
  id: string
  user_id: string
  created_at: string
  display_name: string
  username: string
}

export type TrainingWeekEntry = {
  user_id: string
  sessions: number
  minutes: number
  km: number
}

export function TeamView({
  team,
  members,
  stats,
  isAdmin,
  joinMode,
  joinRequests,
  trainingWeek = [],
  pendingLeagueInvitesCount = 0,
}: {
  team: Team
  members: MemberWithStats[]
  stats: TeamStats
  isAdmin: boolean
  joinMode: "open" | "request" | "invite_only"
  joinRequests: JoinRequest[]
  trainingWeek?: TrainingWeekEntry[]
  pendingLeagueInvitesCount?: number
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "lineup" | "admin">("stats")
  const [activePosition, setActivePosition] = useState<string | null>(null)
  const [addPlayerOpen, setAddPlayerOpen] = useState(false)
  const [currentJoinMode, setCurrentJoinMode] = useState(joinMode)
  const [pendingRequests, setPendingRequests] = useState(joinRequests)
  const [, startTransition] = useTransition()

  const filtered =
    activePosition === null
      ? members
      : members.filter((m) => m.position === activePosition)

  const winRate =
    stats.matches_played > 0
      ? Math.round((stats.wins / stats.matches_played) * 100)
      : 0

  const goalsPerMatch =
    stats.matches_played > 0
      ? (stats.goals_for / stats.matches_played).toFixed(1)
      : "0.0"

  const goalsAgainstPerMatch =
    stats.matches_played > 0
      ? (stats.goals_against / stats.matches_played).toFixed(1)
      : "0.0"

  const goalDiff = stats.goals_for - stats.goals_against

  // Top 4 players by goals
  const topPlayers = [...members]
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 4)

  return (
    <>
      <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {team.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={team.logo_url}
                alt={team.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl shrink-0"
                style={{ backgroundColor: team.primary_color || "#D7FF00", color: "#000" }}
              >
                {team.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">Equipo</p>
              <h1 className="font-display text-3xl leading-tight">{team.name}</h1>
            </div>
          </div>
          <Link href="/profile" className="p-2 rounded-lg bg-card border border-border shrink-0">
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Link>
        </header>

        {/* Tabs */}
        <div className="flex bg-card rounded-xl p-1 mb-6 border border-border/40">
          {(["stats", "lineup", ...(isAdmin ? (["admin"] as const) : [])] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as "stats" | "lineup" | "admin")}
              className={cn(
                "flex-1 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-colors relative",
                activeTab === tab
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {tab === "stats" ? "Stats" : tab === "lineup" ? "Plantilla" : "Admin"}
              {tab === "admin" && pendingRequests.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "admin" && isAdmin ? (
          <AdminTab
            teamId={team.id}
            joinMode={currentJoinMode}
            requests={pendingRequests}
            pendingLeagueInvites={pendingLeagueInvitesCount}
            onModeChange={(mode) => {
              setCurrentJoinMode(mode)
              startTransition(async () => { await updateJoinMode(team.id, mode) })
            }}
            onApprove={(req) => {
              startTransition(async () => {
                const res = await approveJoinRequest(req.id, team.id, req.user_id)
                if ("ok" in res) setPendingRequests((p) => p.filter((r) => r.id !== req.id))
              })
            }}
            onReject={(req) => {
              startTransition(async () => {
                const res = await rejectJoinRequest(req.id)
                if ("ok" in res) setPendingRequests((p) => p.filter((r) => r.id !== req.id))
              })
            }}
          />
        ) : activeTab === "stats" ? (
          <>
            {/* Performance */}
            <section className="bg-card rounded-xl p-5 mb-5 border border-border/40">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg">Rendimiento</h2>
                <span className="text-xs text-muted-foreground">
                  {stats.matches_played > 0 ? `${stats.matches_played} partidos` : "Sin datos"}
                </span>
              </div>

              {stats.matches_played === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Registra partidos para ver estadísticas
                </p>
              ) : (
                <>
                  {/* Top row: ring + goals metrics */}
                  <div className="flex items-center gap-6 mb-5">
                    <PerformanceRing value={winRate} label="Victoria" size="lg" />

                    <div className="flex-1 space-y-3">
                      {/* Goals per match */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Goles / partido</span>
                          <span className="font-display text-lg">{goalsPerMatch}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent rounded-full"
                            style={{ width: `${Math.min(parseFloat(goalsPerMatch) / 5, 1) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Goals against per match */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-muted-foreground uppercase tracking-wider">Recibidos / partido</span>
                          <span className="font-display text-lg">{goalsAgainstPerMatch}</span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive/50 rounded-full"
                            style={{ width: `${Math.min(parseFloat(goalsAgainstPerMatch) / 5, 1) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Goal difference */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground uppercase tracking-wider">Diferencia de goles</span>
                        <span className={cn(
                          "font-display text-lg",
                          goalDiff > 0 ? "text-accent" : goalDiff < 0 ? "text-destructive" : ""
                        )}>
                          {goalDiff > 0 ? "+" : ""}{goalDiff}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* W / D / L breakdown */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/30">
                    <div className="bg-accent/10 rounded-lg py-3 text-center">
                      <p className="font-display text-2xl text-accent">{stats.wins}</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Victorias</p>
                    </div>
                    <div className="bg-muted/40 rounded-lg py-3 text-center">
                      <p className="font-display text-2xl">{stats.draws}</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Empates</p>
                    </div>
                    <div className="bg-destructive/10 rounded-lg py-3 text-center">
                      <p className="font-display text-2xl text-destructive">{stats.losses}</p>
                      <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Derrotas</p>
                    </div>
                  </div>
                </>
              )}
            </section>

            {/* Top Players */}
            <section className={features.training ? "mb-5" : ""}>
              <h2 className="font-display text-lg mb-4">Jugadores destacados</h2>
              {topPlayers.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {topPlayers.map((p) => (
                    <PlayerCard
                      key={p.id}
                      id={p.user_id ?? p.id}
                      name={p.display_name}
                      position={POSITION_LABEL[p.position ?? ""] ?? "—"}
                      number={p.jersey_number ?? 0}
                      imageUrl={p.avatar_url ?? undefined}
                      matches={p.matches_played}
                      goals={p.goals}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-card rounded-xl p-6 text-center border border-border/40">
                  <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Sin jugadores en el equipo aún
                  </p>
                </div>
              )}
            </section>

            {/* Training this week */}
            {features.training && (
              <TrainingWeekSection members={members} trainingWeek={trainingWeek} />
            )}
          </>
        ) : (
          <>
            {/* Position Filter */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.label}
                  onClick={() => setActivePosition(pos.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs uppercase tracking-wider whitespace-nowrap transition-colors flex-shrink-0",
                    activePosition === pos.value
                      ? "bg-accent text-accent-foreground"
                      : "bg-card text-muted-foreground"
                  )}
                >
                  {pos.label}
                </button>
              ))}
            </div>

            {/* Players List */}
            {filtered.length > 0 ? (
              <div className="space-y-2">
                {filtered.map((p) => {
                  const inner = (
                    <>
                      {/* Jersey */}
                      <div className={cn(
                        "w-12 h-12 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                        p.is_guest ? "border-border/40" : "border-accent"
                      )}>
                        <span className="font-display text-xl">
                          {p.jersey_number ?? "—"}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{p.display_name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground uppercase">
                            {POSITION_LABEL[p.position ?? ""] ?? "Sin posición"}
                          </p>
                          {p.role === "admin" && (
                            <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Admin
                            </span>
                          )}
                          {p.is_guest && (
                            <span className="text-[10px] bg-muted text-muted-foreground/70 px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      {p.is_guest ? (
                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] text-muted-foreground/50 uppercase leading-none">
                            Sin cuenta
                          </p>
                        </div>
                      ) : (
                        <div className="flex gap-4 text-right flex-shrink-0">
                          <div>
                            <p className="font-display text-lg leading-none">{p.goals}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Goles</p>
                          </div>
                          <div>
                            <p className="font-display text-lg leading-none">{p.assists}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">Asist.</p>
                          </div>
                        </div>
                      )}
                    </>
                  )

                  return p.is_guest ? (
                    <div
                      key={p.id}
                      className="flex items-center gap-4 bg-card rounded-xl p-4 border border-border/30 opacity-75"
                    >
                      {inner}
                    </div>
                  ) : (
                    <Link
                      key={p.id}
                      href={`/players/${p.user_id}`}
                      className="flex items-center gap-4 bg-card rounded-xl p-4 active:scale-[0.98] transition-transform border border-border/30"
                    >
                      {inner}
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">
                  Sin jugadores en esta posición
                </p>
              </div>
            )}

            {/* FAB */}
            <button
              onClick={() => setAddPlayerOpen(true)}
              className="fixed bottom-24 right-4 w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg shadow-accent/25 active:scale-95 transition-transform"
            >
              <Plus className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      <AddPlayerSheet
        open={addPlayerOpen}
        onOpenChange={setAddPlayerOpen}
        teamId={team.id}
        isAdmin={isAdmin}
      />
    </>
  )
}

// ─── Training Week Section ────────────────────────────────────────────────────

function TrainingWeekSection({
  members,
  trainingWeek,
}: {
  members: MemberWithStats[]
  trainingWeek: TrainingWeekEntry[]
}) {
  const activeMembersCount = members.filter((m) => !m.is_guest && m.user_id).length
  const trainedCount = trainingWeek.length
  const participationPct = activeMembersCount > 0
    ? Math.round((trainedCount / activeMembersCount) * 100)
    : 0

  const leaderboard = trainingWeek
    .map((t) => {
      const member = members.find((m) => m.user_id === t.user_id)
      return { ...t, display_name: member?.display_name ?? "Jugador" }
    })
    .sort((a, b) => b.sessions - a.sessions || b.minutes - a.minutes)
    .slice(0, 5)

  return (
    <section className="bg-card rounded-xl p-5 border border-border/40 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <Dumbbell className="h-4 w-4 text-accent" />
        <h2 className="font-display text-lg">Entrenamiento esta semana</h2>
      </div>

      {/* Participation */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm text-muted-foreground">
            {trainedCount} de {activeMembersCount} jugadores
          </span>
          <span className="text-sm font-medium text-accent">{participationPct}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all duration-500"
            style={{ width: `${participationPct}%` }}
          />
        </div>
      </div>

      {leaderboard.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-3">
          Ningún jugador ha entrenado esta semana
        </p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, i) => (
            <div key={entry.user_id} className="flex items-center gap-3">
              <span className={cn(
                "font-display text-base w-5 text-center flex-shrink-0",
                i === 0 ? "text-accent" : "text-muted-foreground"
              )}>
                {i + 1}
              </span>
              <div
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-display text-sm flex-shrink-0"
              >
                {entry.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{entry.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {entry.sessions} sesión{entry.sessions !== 1 ? "es" : ""}
                  {entry.km > 0 ? ` · ${entry.km.toFixed(1)} km` : ""}
                </p>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {entry.minutes >= 60
                  ? `${Math.floor(entry.minutes / 60)}h${entry.minutes % 60 > 0 ? `${entry.minutes % 60}m` : ""}`
                  : `${entry.minutes}m`}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Admin Tab ────────────────────────────────────────────────────────────────

const JOIN_MODE_OPTIONS = [
  {
    value: "open" as const,
    label: "Abierto",
    desc: "Cualquiera puede unirse directamente",
    icon: Globe,
    color: "text-emerald-400",
  },
  {
    value: "request" as const,
    label: "Solicitud",
    desc: "El admin aprueba cada solicitud",
    icon: UserCheck,
    color: "text-accent",
  },
  {
    value: "invite_only" as const,
    label: "Solo invitación",
    desc: "Solo con link o código de invitación",
    icon: Lock,
    color: "text-muted-foreground",
  },
]

function AdminTab({
  teamId: _teamId,
  joinMode,
  requests,
  pendingLeagueInvites = 0,
  onModeChange,
  onApprove,
  onReject,
}: {
  teamId: string
  joinMode: "open" | "request" | "invite_only"
  requests: JoinRequest[]
  pendingLeagueInvites?: number
  onModeChange: (mode: "open" | "request" | "invite_only") => void
  onApprove: (req: JoinRequest) => void
  onReject: (req: JoinRequest) => void
}) {
  return (
    <div className="space-y-5 pb-6">
      {/* Leagues entry (feature flagged) */}
      {features.leagues && (
        <Link
          href="/team/leagues"
          className="flex items-center gap-3 bg-card rounded-xl p-4 border border-border/40 hover:border-border relative"
        >
          <div className="w-10 h-10 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Ligas</p>
            <p className="text-xs text-muted-foreground">
              {pendingLeagueInvites > 0
                ? `${pendingLeagueInvites} invitación${pendingLeagueInvites === 1 ? '' : 'es'} pendiente${pendingLeagueInvites === 1 ? '' : 's'}`
                : 'Gestionar participaciones e invitaciones'}
            </p>
          </div>
          {pendingLeagueInvites > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
              {pendingLeagueInvites}
            </span>
          )}
        </Link>
      )}

      {/* Join mode */}
      <section>
        <h2 className="font-display text-lg mb-1">Modo de acceso</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Controla cómo los jugadores pueden unirse a este equipo en el directorio.
        </p>
        <div className="space-y-2">
          {JOIN_MODE_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const isActive = joinMode === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => !isActive && onModeChange(opt.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                  isActive
                    ? "bg-accent/10 border-accent/40"
                    : "bg-card border-border/40 hover:border-border"
                )}
              >
                <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? opt.color : "text-muted-foreground")} />
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium", isActive && "text-accent")}>{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.desc}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Pending requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg">Solicitudes pendientes</h2>
          {requests.length > 0 && (
            <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full">
              {requests.length}
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border/40">
            <UserCheck className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Sin solicitudes pendientes</p>
          </div>
        ) : (
          <div className="space-y-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-card rounded-xl p-4 border border-border/40 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-accent/15 flex items-center justify-center flex-shrink-0">
                  <span className="font-display text-lg text-accent">
                    {req.display_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{req.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{req.username}</p>
                </div>
                <div className="flex gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => onApprove(req)}
                    className="p-2 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent transition-colors"
                    title="Aprobar"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onReject(req)}
                    className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                    title="Rechazar"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
