"use client"

import { MatchCard } from "@/components/match-card"
import { AttendanceWidget } from "@/components/attendance-widget"
import { Plus } from "lucide-react"
import Link from "next/link"
import { getMatchDerivedStatus } from "@/lib/match-utils"
import { format } from "date-fns"
import { es } from "date-fns/locale"

type Match = {
  id: string
  opponent_name: string
  match_date: string
  type: string
  status: string
  goals_for: number | null
  goals_against: number | null
}

function getResult(m: Match): "win" | "loss" | "draw" | "upcoming" | "pending" {
  const derived = getMatchDerivedStatus(m.status, m.match_date)
  if (derived === "upcoming") return "upcoming"
  if (derived === "pending_result") return "pending"
  if (derived === "cancelled") return "draw"
  if (m.goals_for === null || m.goals_against === null) return "draw"
  if (m.goals_for > m.goals_against) return "win"
  if (m.goals_for < m.goals_against) return "loss"
  return "draw"
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "d MMM · HH:mm", { locale: es })
  } catch {
    return dateStr
  }
}

const typeLabel: Record<string, string> = {
  friendly: "Amistoso",
  league: "Liga",
  cup: "Copa",
  tournament: "Torneo",
}

export function MatchesView({
  matches,
  teamName,
  isAdmin,
  attendanceMap = {},
}: {
  matches: Match[]
  teamName: string
  isAdmin: boolean
  attendanceMap?: Record<string, "confirmed" | "declined" | null>
}) {
  const now = new Date()

  const upcoming = matches.filter(
    (m) => m.status === "scheduled" && new Date(m.match_date) > now
  ).sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  const pending = matches.filter(
    (m) => m.status === "scheduled" && new Date(m.match_date) <= now
  ).sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())

  const history = matches.filter((m) => m.status === "finished")
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())

  const finished = history
  const wins = finished.filter((m) => (m.goals_for ?? 0) > (m.goals_against ?? 0)).length
  const draws = finished.filter((m) => m.goals_for === m.goals_against && m.goals_for !== null).length
  const losses = finished.filter((m) => (m.goals_for ?? 0) < (m.goals_against ?? 0)).length

  const totalMatches = matches.filter(
    (m) => m.status !== "cancelled" && m.status !== "postponed"
  ).length

  return (
    <div className="px-4 pt-6 pb-4 max-w-lg mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            Historial
          </p>
          <h1 className="font-display text-3xl">Partidos</h1>
        </div>
        {isAdmin && (
          <Link
            href="/matches/new"
            className="p-2 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
          </Link>
        )}
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="font-display text-2xl">{finished.length}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Jugados</p>
        </div>
        <div className="bg-accent/15 rounded-xl p-3 text-center">
          <p className="font-display text-2xl text-accent">{wins}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Victorias</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="font-display text-2xl">{draws}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Empates</p>
        </div>
        <div className="bg-card rounded-xl p-3 text-center">
          <p className="font-display text-2xl text-destructive">{losses}</p>
          <p className="text-[10px] text-muted-foreground uppercase mt-0.5">Derrotas</p>
        </div>
      </div>

      {/* ── Próximos ── */}
      {upcoming.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            Próximos
          </h2>
          <div className="space-y-2">
            {upcoming.map((m) => (
              <MatchCard
                key={m.id}
                id={m.id}
                homeTeam={teamName}
                awayTeam={m.opponent_name}
                date={formatDate(m.match_date)}
                competition={typeLabel[m.type] ?? m.type}
                result="upcoming"
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Pendientes de resultado ── */}
      {pending.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            Pendientes de resultado
          </h2>
          <div className="space-y-2">
            {pending.map((m) => (
              <MatchCard
                key={m.id}
                id={m.id}
                homeTeam={teamName}
                awayTeam={m.opponent_name}
                date={formatDate(m.match_date)}
                competition={typeLabel[m.type] ?? m.type}
                result="pending"
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Historial ── */}
      {history.length > 0 && (
        <section className="mb-6">
          <h2 className="text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            Historial
          </h2>
          <div className="space-y-2">
            {history.map((m) => {
              const att = attendanceMap[m.id] ?? null
              return (
                <div key={m.id}>
                  <MatchCard
                    id={m.id}
                    homeTeam={teamName}
                    awayTeam={m.opponent_name}
                    homeScore={m.goals_for ?? undefined}
                    awayScore={m.goals_against ?? undefined}
                    date={formatDate(m.match_date)}
                    competition={typeLabel[m.type] ?? m.type}
                    result={getResult(m)}
                    className={att === null ? "rounded-b-none" : ""}
                  />
                  {att === null && (
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
              )
            })}
          </div>
        </section>
      )}

      {/* Empty state */}
      {totalMatches === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-2">No hay partidos registrados</p>
          {isAdmin && (
            <Link href="/matches/new" className="text-accent text-sm hover:underline">
              Registrar primer partido →
            </Link>
          )}
        </div>
      )}

      {/* FAB — admin only */}
      {isAdmin && (
        <Link
          href="/matches/new"
          className="fixed bottom-24 right-4 w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg shadow-accent/25 active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Link>
      )}
    </div>
  )
}
