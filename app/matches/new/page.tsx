"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { AddGoalSheet } from "@/components/add-goal-sheet"
import { ChevronLeft, Plus, Pencil, Trash2, Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Mock team players
const teamPlayers = [
  { id: "1", number: 1, name: "Pedro Sánchez", position: "Portero" },
  { id: "2", number: 4, name: "Miguel Rodríguez", position: "Defensa" },
  { id: "3", number: 5, name: "Andrés Torres", position: "Defensa" },
  { id: "4", number: 3, name: "David García", position: "Defensa" },
  { id: "5", number: 6, name: "Fernando López", position: "Defensa" },
  { id: "6", number: 8, name: "Luis González", position: "Mediocampista" },
  { id: "7", number: 10, name: "Carlos Martínez", position: "Mediocampista" },
  { id: "8", number: 7, name: "Roberto Silva", position: "Mediocampista" },
  { id: "9", number: 17, name: "Diego Herrera", position: "Mediocampista" },
  { id: "10", number: 9, name: "Juan Pérez", position: "Delantero" },
  { id: "11", number: 11, name: "Pablo Ruiz", position: "Delantero" },
]

interface MatchEvent {
  id: string
  type: "goal" | "own_goal"
  player?: { id: string; number: number; name: string; position: string }
  assist?: { id: string; number: number; name: string; position: string }
}

export default function NewMatchPage() {
  const [rivalTeam, setRivalTeam] = useState("")
  const [competition, setCompetition] = useState("Liga Amateur")
  const [isHome, setIsHome] = useState(true)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [addGoalOpen, setAddGoalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<string | null>(null)

  // Calculate score from events
  const teamScore = events.filter(e => e.type === "goal" || e.type === "own_goal").length
  const rivalScore = 0 // Manual input or from rival goals

  const handleAddEvent = (event: Omit<MatchEvent, "id">) => {
    const newEvent: MatchEvent = {
      ...event,
      id: Date.now().toString(),
    }
    setEvents(prev => [...prev, newEvent])
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    setEditingEvent(null)
  }

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/matches" className="p-2 -ml-2 rounded-lg hover:bg-card">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl">Nuevo partido</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pb-32">
        {/* Score Display */}
        <div className="bg-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* Home Team */}
            <div className="flex-1 text-center">
              <div className={cn(
                "w-16 h-16 rounded-xl mx-auto flex items-center justify-center mb-3",
                isHome ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-2xl",
                  isHome ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {isHome ? "TU" : rivalTeam.charAt(0) || "?"}
                </span>
              </div>
              <p className="text-sm font-medium truncate px-2">
                {isHome ? "Tu equipo" : (rivalTeam || "Rival")}
              </p>
            </div>

            {/* Score */}
            <div className="px-4">
              <div className="flex items-center gap-4">
                <span className="font-display text-6xl">{isHome ? teamScore : rivalScore}</span>
                <span className="text-3xl text-muted-foreground">-</span>
                <span className="font-display text-6xl">{isHome ? rivalScore : teamScore}</span>
              </div>
            </div>

            {/* Away Team */}
            <div className="flex-1 text-center">
              <div className={cn(
                "w-16 h-16 rounded-xl mx-auto flex items-center justify-center mb-3",
                !isHome ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-2xl",
                  !isHome ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {!isHome ? "TU" : rivalTeam.charAt(0) || "?"}
                </span>
              </div>
              <p className="text-sm font-medium truncate px-2">
                {!isHome ? "Tu equipo" : (rivalTeam || "Rival")}
              </p>
            </div>
          </div>

          {/* Home/Away Toggle */}
          <div className="flex justify-center mt-4">
            <div className="bg-background rounded-xl p-1 flex">
              <button
                onClick={() => setIsHome(true)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isHome ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                Local
              </button>
              <button
                onClick={() => setIsHome(false)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  !isHome ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                Visitante
              </button>
            </div>
          </div>
        </div>

        {/* Match Details */}
        <section className="mb-6">
          <h2 className="label-text mb-3">Detalles</h2>
          
          {/* Rival Team */}
          <div className="bg-card rounded-xl p-4 mb-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Equipo rival
            </label>
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={rivalTeam}
              onChange={(e) => setRivalTeam(e.target.value)}
              className="w-full bg-transparent text-xl font-display placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>

          {/* Competition */}
          <div className="bg-card rounded-xl p-4 mb-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Competición
            </label>
            <select
              value={competition}
              onChange={(e) => setCompetition(e.target.value)}
              className="w-full bg-transparent text-lg focus:outline-none appearance-none cursor-pointer"
            >
              <option value="Liga Amateur">Liga Amateur</option>
              <option value="Copa Local">Copa Local</option>
              <option value="Amistoso">Amistoso</option>
              <option value="Torneo">Torneo</option>
            </select>
          </div>

          {/* Date & Time */}
          <div className="flex gap-3">
            <div className="flex-1 bg-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                <Calendar className="h-3 w-3" />
                Fecha
              </label>
              <input
                type="date"
                className="w-full bg-transparent focus:outline-none"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex-1 bg-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
                <Clock className="h-3 w-3" />
                Hora
              </label>
              <input
                type="time"
                className="w-full bg-transparent focus:outline-none"
                defaultValue="10:00"
              />
            </div>
          </div>
        </section>

        {/* Match Events */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="label-text">Eventos del partido</h2>
            <span className="text-xs text-muted-foreground">{events.length} goles</span>
          </div>

          {/* Events List */}
          {events.length > 0 && (
            <div className="space-y-2 mb-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shrink-0">
                    <span className="text-lg">⚽</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {event.type === "goal" ? (
                      <>
                        <p className="font-medium truncate">{event.player?.name}</p>
                        {event.assist ? (
                          <p className="text-sm text-muted-foreground truncate">
                            Asistencia: {event.assist.name}
                          </p>
                        ) : (
                          <p className="text-sm text-muted-foreground">Sin asistencia</p>
                        )}
                      </>
                    ) : (
                      <>
                        <p className="font-medium">Autogol</p>
                        <p className="text-sm text-muted-foreground">Gol a favor (rival)</p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingEvent(editingEvent === event.id ? null : event.id)}
                      className="p-2 rounded-lg hover:bg-background transition-colors"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    {editingEvent === event.id && (
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Goal Button */}
          <button
            onClick={() => setAddGoalOpen(true)}
            className="w-full bg-card border-2 border-dashed border-muted rounded-xl p-4 flex items-center justify-center gap-3 hover:border-accent/50 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-accent/20 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent" />
            </div>
            <span className="font-display text-lg uppercase text-muted-foreground group-hover:text-foreground transition-colors">
              Agregar gol
            </span>
          </button>
        </section>

        {/* Venue (Optional) */}
        <section className="mb-6">
          <div className="bg-card rounded-xl p-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-2">
              <MapPin className="h-3 w-3" />
              Lugar (opcional)
            </label>
            <input
              type="text"
              placeholder="Campo o cancha"
              className="w-full bg-transparent text-lg placeholder:text-muted-foreground/50 focus:outline-none"
            />
          </div>
        </section>
      </div>

      {/* Fixed Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-card">
        <button className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-display text-xl uppercase tracking-wide active:scale-[0.98] transition-transform">
          Guardar partido
        </button>
      </div>

      {/* Add Goal Sheet */}
      <AddGoalSheet
        open={addGoalOpen}
        onOpenChange={setAddGoalOpen}
        players={teamPlayers}
        onAddEvent={handleAddEvent}
      />
    </AppShell>
  )
}
