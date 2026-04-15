"use client"

import { useState } from "react"
import { PerformanceRing } from "@/components/performance-ring"
import { PlayerCard } from "@/components/player-card"
import { AddPlayerSheet } from "@/components/add-player-sheet"
import { Plus, Settings, Shield } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

export function TeamView({
  team,
  members,
  stats,
  isAdmin,
}: {
  team: Team
  members: MemberWithStats[]
  stats: TeamStats
  isAdmin: boolean
}) {
  const [activeTab, setActiveTab] = useState<"stats" | "lineup">("stats")
  const [activePosition, setActivePosition] = useState<string | null>(null)
  const [addPlayerOpen, setAddPlayerOpen] = useState(false)

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
      <div className="px-4 pt-6 pb-4">
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
          {(["stats", "lineup"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "flex-1 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-colors",
                activeTab === tab
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground"
              )}
            >
              {tab === "stats" ? "Stats" : "Plantilla"}
            </button>
          ))}
        </div>

        {activeTab === "stats" ? (
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
            <section>
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
