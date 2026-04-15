"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { StatCard } from "@/components/stat-card"
import { AddPerformanceSheet } from "@/components/add-performance-sheet"
import { ChevronLeft, Edit, Plus } from "lucide-react"
import Link from "next/link"
import { use } from "react"

// Mock player data
const getPlayer = (id: string) => ({
  id,
  name: "Carlos M.",
  fullName: "Carlos Martínez",
  position: "Mediocampista",
  number: 10,
  matches: 42,
  goals: 15,
  assists: 28,
  attendance: 85,
  form: [8, 7, 9, 8, 7, 9, 8],
})

// Mock recent activity
const recentActivity = [
  { type: "goal", qty: 2, match: "Deportivo Sur", date: "12 Abr" },
  { type: "assist", qty: 1, match: "Real Norte", date: "5 Abr" },
  { type: "goal", qty: 1, match: "Atlético Centro", date: "29 Mar" },
]

export default function PlayerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const player = getPlayer(id)
  const [performanceOpen, setPerformanceOpen] = useState(false)

  return (
    <AppShell showNav={false}>
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/team" className="p-2 -ml-2 rounded-lg hover:bg-card">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl">Jugador</h1>
          <Link href={`/players/${id}/edit`} className="p-2 -mr-2 rounded-lg hover:bg-card">
            <Edit className="h-5 w-5" />
          </Link>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Player Header */}
        <div className="relative mb-6">
          {/* Photo placeholder */}
          <div className="aspect-[4/3] bg-gradient-to-b from-muted to-card rounded-xl flex items-center justify-center">
            <span className="font-display text-8xl text-muted-foreground/20">
              {player.number}
            </span>
          </div>
          
          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent rounded-b-xl">
            <h2 className="font-display text-4xl text-white">{player.name}</h2>
            <p className="text-accent text-sm uppercase tracking-wider">
              {player.position} | #{player.number}
            </p>
          </div>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard label="Partidos" value={player.matches} />
          <StatCard label="Goles" value={player.goals} variant="accent" />
          <StatCard label="Asistencias" value={player.assists} />
          <StatCard label="Asistencia" value={`${player.attendance}%`} />
        </div>

        {/* Recent Activity */}
        <section className="bg-card rounded-xl p-5 mb-6">
          <h3 className="font-display text-lg mb-4">Actividad reciente</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{activity.type === "goal" ? "⚽" : "🎯"}</span>
                <div className="flex-1">
                  <span className="text-accent font-semibold">+{activity.qty}</span>
                  <span className="text-muted-foreground"> {activity.type === "goal" ? "gol" : "asist"}{activity.qty > 1 ? "es" : ""}</span>
                  <span className="text-foreground"> vs {activity.match}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.date}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Performance Trend */}
        <section className="bg-card rounded-xl p-5 mb-6">
          <h3 className="font-display text-lg mb-4">Rendimiento reciente</h3>
          
          {/* Simple line chart representation */}
          <div className="flex items-end gap-2 h-24">
            {player.form.map((rating, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-accent rounded transition-all"
                  style={{ height: `${(rating / 10) * 100}%` }}
                />
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">Últimos 7 partidos</span>
            <span className="text-[10px] text-accent">Promedio: {(player.form.reduce((a, b) => a + b, 0) / player.form.length).toFixed(1)}</span>
          </div>
        </section>

        {/* Detailed Stats */}
        <section className="bg-card rounded-xl p-5">
          <h3 className="font-display text-lg mb-4">Estadísticas detalladas</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Minutos jugados</span>
              <span className="font-display text-lg">3,420</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Tarjetas amarillas</span>
              <span className="font-display text-lg">4</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Tarjetas rojas</span>
              <span className="font-display text-lg">0</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Goles por partido</span>
              <span className="font-display text-lg">0.36</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Entrenamientos</span>
              <span className="font-display text-lg text-accent">{player.attendance}%</span>
            </div>
          </div>
        </section>
      </div>

      {/* FAB - Add Performance */}
      <button
        onClick={() => setPerformanceOpen(true)}
        className="fixed bottom-6 right-4 bg-accent text-accent-foreground font-display uppercase text-sm tracking-wider px-5 py-4 rounded-2xl flex items-center gap-2 shadow-lg shadow-accent/25 active:scale-95 transition-transform"
      >
        <Plus className="h-5 w-5" />
        Añadir rendimiento
      </button>

      {/* Add Performance Sheet */}
      <AddPerformanceSheet 
        open={performanceOpen} 
        onOpenChange={setPerformanceOpen}
        playerName={player.name}
        playerId={player.id}
      />
    </AppShell>
  )
}
