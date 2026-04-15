"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { MatchCard } from "@/components/match-card"
import { Plus, Filter } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const filters = ["Todos", "Victorias", "Derrotas", "Empates"]

const matches = [
  { id: "1", homeTeam: "La Máquina FC", awayTeam: "Deportivo Sur", date: "Dom 20 Abr", competition: "Liga Amateur", result: "upcoming" as const },
  { id: "2", homeTeam: "La Máquina FC", awayTeam: "Real Norte", homeScore: 3, awayScore: 1, date: "13 Abr", competition: "Liga Amateur", result: "win" as const },
  { id: "3", homeTeam: "Atlético Centro", awayTeam: "La Máquina FC", homeScore: 2, awayScore: 2, date: "6 Abr", competition: "Liga Amateur", result: "draw" as const },
  { id: "4", homeTeam: "La Máquina FC", awayTeam: "FC Oeste", homeScore: 0, awayScore: 2, date: "30 Mar", competition: "Amistoso", result: "loss" as const },
  { id: "5", homeTeam: "La Máquina FC", awayTeam: "Unidos FC", homeScore: 4, awayScore: 0, date: "23 Mar", competition: "Liga Amateur", result: "win" as const },
  { id: "6", homeTeam: "Tigres del Norte", awayTeam: "La Máquina FC", homeScore: 1, awayScore: 2, date: "16 Mar", competition: "Liga Amateur", result: "win" as const },
  { id: "7", homeTeam: "La Máquina FC", awayTeam: "Estrella Roja", homeScore: 2, awayScore: 2, date: "9 Mar", competition: "Copa Local", result: "draw" as const },
  { id: "8", homeTeam: "Deportivo Central", awayTeam: "La Máquina FC", homeScore: 3, awayScore: 1, date: "2 Mar", competition: "Liga Amateur", result: "loss" as const },
]

export default function MatchesPage() {
  const [activeFilter, setActiveFilter] = useState("Todos")
  
  const filteredMatches = activeFilter === "Todos" 
    ? matches 
    : matches.filter(m => {
        if (activeFilter === "Victorias") return m.result === "win"
        if (activeFilter === "Derrotas") return m.result === "loss"
        if (activeFilter === "Empates") return m.result === "draw"
        return true
      })

  const stats = {
    total: matches.filter(m => m.result !== "upcoming").length,
    wins: matches.filter(m => m.result === "win").length,
    draws: matches.filter(m => m.result === "draw").length,
    losses: matches.filter(m => m.result === "loss").length,
  }

  return (
    <AppShell>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div>
            <p className="label-text mb-1">Temporada 2025/26</p>
            <h1 className="font-display text-3xl">Partidos</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-card">
              <Filter className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Stats Bar */}
        <div className="flex gap-2 mb-6">
          <div className="flex-1 bg-card rounded-lg p-3 text-center">
            <p className="font-display text-2xl">{stats.total}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Jugados</p>
          </div>
          <div className="flex-1 bg-accent/20 rounded-lg p-3 text-center">
            <p className="font-display text-2xl text-accent">{stats.wins}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Victorias</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-3 text-center">
            <p className="font-display text-2xl">{stats.draws}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Empates</p>
          </div>
          <div className="flex-1 bg-card rounded-lg p-3 text-center">
            <p className="font-display text-2xl">{stats.losses}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Derrotas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs uppercase tracking-wider whitespace-nowrap transition-colors",
                activeFilter === filter 
                  ? "bg-accent text-accent-foreground" 
                  : "bg-card text-muted-foreground"
              )}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Matches List */}
        <div className="space-y-2">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} {...match} />
          ))}
        </div>

        {filteredMatches.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No hay partidos con este filtro</p>
          </div>
        )}

        {/* Add Match Button */}
        <Link
          href="/matches/new"
          className="fixed bottom-24 right-4 w-14 h-14 bg-accent text-accent-foreground rounded-full flex items-center justify-center shadow-lg shadow-accent/25 active:scale-95 transition-transform"
        >
          <Plus className="h-6 w-6" />
        </Link>
      </div>
    </AppShell>
  )
}
