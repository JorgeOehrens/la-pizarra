"use client"

import { useState } from "react"
import { MatchCard } from "@/components/match-card"
import { Plus } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
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

type Filter = "Todos" | "Victorias" | "Empates" | "Derrotas" | "Próximos"
const FILTERS: Filter[] = ["Todos", "Victorias", "Empates", "Derrotas", "Próximos"]

function getResult(m: Match): "win" | "loss" | "draw" | "upcoming" {
  if (m.status === "scheduled" || m.status === "in_progress") return "upcoming"
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
}: {
  matches: Match[]
  teamName: string
  isAdmin: boolean
}) {
  const [activeFilter, setActiveFilter] = useState<Filter>("Todos")

  const finished = matches.filter((m) => m.status === "finished")
  const wins = finished.filter((m) => (m.goals_for ?? 0) > (m.goals_against ?? 0)).length
  const draws = finished.filter((m) => m.goals_for === m.goals_against && m.goals_for !== null).length
  const losses = finished.filter((m) => (m.goals_for ?? 0) < (m.goals_against ?? 0)).length

  const filtered = matches.filter((m) => {
    const r = getResult(m)
    if (activeFilter === "Todos") return true
    if (activeFilter === "Victorias") return r === "win"
    if (activeFilter === "Empates") return r === "draw"
    if (activeFilter === "Derrotas") return r === "loss"
    if (activeFilter === "Próximos") return r === "upcoming"
    return true
  })

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <p className="label-text mb-1 text-muted-foreground">Historial</p>
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
      <div className="grid grid-cols-4 gap-2 mb-5">
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

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 mb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={cn(
              "px-4 py-2 rounded-lg text-xs uppercase tracking-wider whitespace-nowrap transition-colors flex-shrink-0",
              activeFilter === f
                ? "bg-accent text-accent-foreground"
                : "bg-card text-muted-foreground"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Matches List */}
      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((m) => (
            <MatchCard
              key={m.id}
              id={m.id}
              homeTeam={teamName}
              awayTeam={m.opponent_name}
              homeScore={m.goals_for ?? undefined}
              awayScore={m.goals_against ?? undefined}
              date={formatDate(m.match_date)}
              competition={typeLabel[m.type] ?? m.type}
              result={getResult(m)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-sm mb-2">
            {activeFilter === "Todos"
              ? "No hay partidos registrados"
              : `No hay partidos con filtro "${activeFilter}"`}
          </p>
          {activeFilter === "Todos" && (
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
