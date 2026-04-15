"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { AddGoalSheet } from "@/components/add-goal-sheet"
import {
  ChevronLeft, Plus, Trash2, Calendar, Clock, MapPin,
  Loader2, Minus, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { createMatch } from "./actions"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Player {
  id: string
  name: string
  number: number | null
  position: string | null
}

type MatchType = "friendly" | "league" | "cup" | "tournament"

export interface GoalEvent {
  id: string
  type: "goal" | "own_goal"
  player?: Player
  assist?: Player
  minute?: number
}

const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: "league", label: "Liga" },
  { value: "cup", label: "Copa" },
  { value: "friendly", label: "Amistoso" },
  { value: "tournament", label: "Torneo" },
]

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Por",
  defender: "Def",
  midfielder: "Med",
  forward: "Del",
}

// ─── Component ───────────────────────────────────────────────────────────────

export function NewMatchForm({
  teamId,
  teamName,
  players,
}: {
  teamId: string
  teamName: string
  players: Player[]
}) {
  const router = useRouter()

  // Form state
  const [rivalTeam, setRivalTeam] = useState("")
  const [isHome, setIsHome] = useState(true)
  const [matchType, setMatchType] = useState<MatchType>("league")
  const [competitionName, setCompetitionName] = useState("")
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split("T")[0])
  const [matchTime, setMatchTime] = useState("10:00")
  const [venueCustom, setVenueCustom] = useState("")
  const [opponentScore, setOpponentScore] = useState(0)
  const [goalEvents, setGoalEvents] = useState<GoalEvent[]>([])
  const [addGoalOpen, setAddGoalOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  const teamScore = goalEvents.length

  // Score display values (left = local, right = visitante)
  const leftScore = isHome ? teamScore : opponentScore
  const rightScore = isHome ? opponentScore : teamScore
  const leftLabel = isHome ? teamName : (rivalTeam || "Rival")
  const rightLabel = isHome ? (rivalTeam || "Rival") : teamName

  function handleAddEvent(event: Omit<GoalEvent, "id">) {
    setGoalEvents((prev) => [...prev, { ...event, id: Date.now().toString() }])
  }

  function handleDeleteEvent(id: string) {
    setGoalEvents((prev) => prev.filter((e) => e.id !== id))
    setConfirmDeleteId(null)
  }

  function handleSave() {
    setFormError(null)

    if (!rivalTeam.trim()) {
      setFormError("El nombre del rival es obligatorio.")
      return
    }
    if (!matchDate) {
      setFormError("La fecha es obligatoria.")
      return
    }

    startSave(async () => {
      const result = await createMatch({
        teamId,
        opponentName: rivalTeam.trim(),
        isHome,
        matchType,
        competitionName,
        matchDate,
        matchTime,
        venueCustom,
        goalsAgainst: opponentScore,
        events: goalEvents.map((e) => ({
          type: e.type,
          playerId: e.player?.id ?? null,
          assistPlayerId: e.assist?.id ?? null,
          minute: e.minute ?? null,
        })),
      })

      if ("error" in result) {
        setFormError(result.error)
        return
      }

      router.push("/matches")
    })
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

      <div className="px-4 pb-36">
        {/* ── Score Card ───────────────────────────────── */}
        <div className="bg-card rounded-2xl p-6 mb-6">
          {/* Team logos + score */}
          <div className="flex items-center justify-between gap-2">
            {/* Left side */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                isHome ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-2xl",
                  isHome ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {isHome ? "TU" : (rivalTeam.charAt(0).toUpperCase() || "?")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[80px] text-center leading-tight">
                {leftLabel}
              </p>
            </div>

            {/* Score */}
            <div className="flex items-center gap-3 px-2">
              <span className="font-display text-5xl tabular-nums">{leftScore}</span>
              <span className="text-2xl text-muted-foreground">–</span>
              <span className="font-display text-5xl tabular-nums">{rightScore}</span>
            </div>

            {/* Right side */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                !isHome ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-2xl",
                  !isHome ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {!isHome ? "TU" : (rivalTeam.charAt(0).toUpperCase() || "?")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[80px] text-center leading-tight">
                {rightLabel}
              </p>
            </div>
          </div>

          {/* Local / Visitante toggle */}
          <div className="flex justify-center mt-5">
            <div className="bg-background rounded-xl p-1 flex">
              <button
                onClick={() => setIsHome(true)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isHome ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                Local
              </button>
              <button
                onClick={() => setIsHome(false)}
                className={cn(
                  "px-5 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  !isHome ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                Visitante
              </button>
            </div>
          </div>

          {/* Opponent score stepper */}
          <div className="mt-5 pt-4 border-t border-border/20 flex items-center gap-3">
            <span className="text-xs text-muted-foreground uppercase tracking-wider flex-1">
              Goles rival
            </span>
            <button
              onClick={() => setOpponentScore((s) => Math.max(0, s - 1))}
              className="w-9 h-9 rounded-full bg-background flex items-center justify-center active:scale-95 transition-transform"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-display text-2xl w-7 text-center tabular-nums">
              {opponentScore}
            </span>
            <button
              onClick={() => setOpponentScore((s) => Math.min(99, s + 1))}
              className="w-9 h-9 rounded-full bg-background flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Details ──────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Detalles</h2>

          {/* Rival name */}
          <div className="bg-card rounded-xl p-4 mb-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Equipo rival
            </label>
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={rivalTeam}
              onChange={(e) => setRivalTeam(e.target.value)}
              className="w-full bg-transparent text-xl font-display placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>

          {/* Match type + competition name */}
          <div className="bg-card rounded-xl p-4 mb-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
              Tipo de partido
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MATCH_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setMatchType(value)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-display uppercase tracking-wider transition-colors border",
                    matchType === value
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-background text-muted-foreground border-border/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
            {(matchType === "league" || matchType === "cup") && (
              <input
                type="text"
                placeholder="Nombre de la competición (opcional)"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
                className="mt-3 w-full bg-background rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-muted-foreground/40"
              />
            )}
          </div>

          {/* Date & Time */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 bg-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Calendar className="h-3 w-3" />
                Fecha
              </label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm"
              />
            </div>
            <div className="flex-1 bg-card rounded-xl p-4">
              <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Clock className="h-3 w-3" />
                Hora
              </label>
              <input
                type="time"
                value={matchTime}
                onChange={(e) => setMatchTime(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Venue */}
          <div className="bg-card rounded-xl p-4">
            <label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <MapPin className="h-3 w-3" />
              Lugar (opcional)
            </label>
            <input
              type="text"
              placeholder="Campo o cancha"
              value={venueCustom}
              onChange={(e) => setVenueCustom(e.target.value)}
              className="w-full bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>
        </section>

        {/* ── Events ───────────────────────────────────── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Eventos del partido
            </h2>
            <span className="text-xs text-muted-foreground">
              {teamScore} {teamScore === 1 ? "gol" : "goles"}
            </span>
          </div>

          {/* Event list */}
          {goalEvents.length > 0 && (
            <div className="space-y-2 mb-3">
              {goalEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                    <span className="text-base leading-none">⚽</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    {event.type === "goal" ? (
                      <>
                        <p className="font-medium text-sm leading-tight truncate">
                          {event.player?.name}
                          {event.player?.number != null && (
                            <span className="text-muted-foreground font-normal"> #{event.player.number}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {event.assist
                            ? `Asistencia: ${event.assist.name}`
                            : "Sin asistencia"}
                          {event.minute != null ? ` · ${event.minute}'` : ""}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-medium text-sm leading-tight">Autogol rival</p>
                        <p className="text-xs text-muted-foreground">
                          Gol a favor{event.minute != null ? ` · ${event.minute}'` : ""}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Delete */}
                  {confirmDeleteId === event.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground border border-border/40"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-destructive/15 text-destructive"
                      >
                        Borrar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(event.id)}
                      className="p-2 rounded-lg hover:bg-background transition-colors shrink-0"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add goal button */}
          <button
            onClick={() => setAddGoalOpen(true)}
            className="w-full bg-card border-2 border-dashed border-border/50 rounded-xl p-4 flex items-center justify-center gap-3 hover:border-accent/40 transition-colors group active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-full bg-muted group-hover:bg-accent/15 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <span className="font-display text-lg uppercase text-muted-foreground group-hover:text-foreground transition-colors">
              Agregar gol
            </span>
          </button>
        </section>

        {/* Error */}
        {formError && (
          <div className="flex items-start gap-3 bg-destructive/10 rounded-xl px-4 py-3 mb-4">
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
            <p className="text-sm text-destructive">{formError}</p>
          </div>
        )}
      </div>

      {/* ── Fixed Save Button ─────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-card">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-accent text-accent-foreground py-4 rounded-xl font-display text-xl uppercase tracking-wide flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          {isSaving && <Loader2 className="h-5 w-5 animate-spin" />}
          {isSaving ? "Guardando..." : "Guardar partido"}
        </button>
      </div>

      {/* ── Add Goal Sheet ────────────────────────────── */}
      <AddGoalSheet
        open={addGoalOpen}
        onOpenChange={setAddGoalOpen}
        players={players}
        onAddEvent={handleAddEvent}
      />
    </AppShell>
  )
}
