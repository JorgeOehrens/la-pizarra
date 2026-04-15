"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { AddEventSheet, type MatchEvent, type Player } from "@/components/add-event-sheet"
import {
  ChevronLeft, Plus, Trash2, Calendar, Clock, MapPin,
  Loader2, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { saveMatch } from "./actions"

type MatchType = "friendly" | "league" | "cup" | "tournament"
type MatchStatus = "scheduled" | "finished" | "cancelled" | "postponed"

const MATCH_TYPES: { value: MatchType; label: string }[] = [
  { value: "league", label: "Liga" },
  { value: "cup", label: "Copa" },
  { value: "friendly", label: "Amistoso" },
  { value: "tournament", label: "Torneo" },
]

const STATUS_OPTIONS: { value: MatchStatus; label: string; color: string }[] = [
  { value: "scheduled", label: "Programado", color: "bg-background text-muted-foreground border-border/30" },
  { value: "finished", label: "Finalizado", color: "" },
  { value: "cancelled", label: "Cancelado", color: "bg-background text-muted-foreground border-border/30" },
  { value: "postponed", label: "Postergado", color: "bg-background text-muted-foreground border-border/30" },
]

function eventIcon(event: MatchEvent): string {
  if (event.kind === "yellow_card") return "🟨"
  if (event.kind === "red_card") return "🟥"
  if (event.kind === "own_goal") return "🔄"
  if (event.side === "rival") return "⚽"
  return "⚽"
}

function eventLabel(event: MatchEvent): string {
  if (event.kind === "own_goal") return "Autogol rival"
  if (event.side === "rival") {
    const labels: Record<string, string> = {
      goal: "Gol del rival",
      yellow_card: "Amarilla (rival)",
      red_card: "Roja (rival)",
    }
    return labels[event.kind] ?? event.kind
  }
  return event.playerName ?? "Jugador"
}

function eventSub(event: MatchEvent): string {
  const parts: string[] = []
  if (event.kind === "goal" && event.assistPlayerName) {
    parts.push(`Asistencia: ${event.assistPlayerName}`)
  } else if (event.kind === "goal" && event.side === "mine") {
    parts.push("Sin asistencia")
  }
  if (event.minute != null) parts.push(`${event.minute}'`)
  return parts.join(" · ")
}

function countGoalsFor(events: MatchEvent[]): number {
  return events.filter(
    (e) => (e.side === "mine" && e.kind === "goal") || e.kind === "own_goal"
  ).length
}

function countGoalsAgainst(events: MatchEvent[]): number {
  return events.filter((e) => e.side === "rival" && e.kind === "goal").length
}

// ─── Component ───────────────────────────────────────────────────────────────

export function EditMatchForm({
  matchId,
  initialData,
  initialEvents,
  players,
  teamName,
}: {
  matchId: string
  initialData: {
    opponentName: string
    isHome: boolean
    matchType: MatchType
    competitionName: string
    matchDate: string
    matchTime: string
    venueCustom: string
    status: MatchStatus
    notes: string
  }
  initialEvents: MatchEvent[]
  players: Player[]
  teamName: string
}) {
  const router = useRouter()

  const [opponentName, setOpponentName] = useState(initialData.opponentName)
  const [isHome, setIsHome] = useState(initialData.isHome)
  const [matchType, setMatchType] = useState<MatchType>(initialData.matchType)
  const [competitionName, setCompetitionName] = useState(initialData.competitionName)
  const [matchDate, setMatchDate] = useState(initialData.matchDate)
  const [matchTime, setMatchTime] = useState(initialData.matchTime)
  const [venueCustom, setVenueCustom] = useState(initialData.venueCustom)
  const [status, setStatus] = useState<MatchStatus>(initialData.status)
  const [notes, setNotes] = useState(initialData.notes)
  const [events, setEvents] = useState<MatchEvent[]>(initialEvents)
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  const goalsFor = countGoalsFor(events)
  const goalsAgainst = countGoalsAgainst(events)
  const leftScore = isHome ? goalsFor : goalsAgainst
  const rightScore = isHome ? goalsAgainst : goalsFor

  function handleAddEvent(event: MatchEvent) {
    setEvents((prev) => [...prev, event])
  }

  function handleDeleteEvent(id: string) {
    setEvents((prev) => prev.filter((e) => e.id !== id))
    setConfirmDeleteId(null)
  }

  function handleSave() {
    setFormError(null)
    if (!opponentName.trim()) {
      setFormError("El nombre del rival es obligatorio.")
      return
    }

    startSave(async () => {
      const eventsPayload = events.map((e) => ({
        event_type:
          e.side === "rival"
            ? e.kind === "goal" ? "opponent_goal" : e.kind
            : e.kind,
        player_id: e.playerId ?? null,
        assisted_by:
          e.side === "mine" && e.kind === "goal"
            ? (e.assistPlayerId ?? null)
            : null,
        minute: e.minute ?? null,
      }))

      const result = await saveMatch({
        matchId,
        opponentName: opponentName.trim(),
        isHome,
        matchType,
        competitionName,
        matchDate,
        matchTime,
        venueCustom,
        status,
        notes,
        events: eventsPayload,
      })

      if ("error" in result) {
        setFormError(result.error)
        return
      }

      router.push(`/matches/${matchId}`)
    })
  }

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href={`/matches/${matchId}`}
            className="p-2 -ml-2 rounded-lg hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl">Editar partido</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pb-36">
        {/* ── Score preview ─────────────────────────────── */}
        <div className="bg-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                isHome ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-2xl",
                  isHome ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {isHome ? "TU" : (opponentName.charAt(0).toUpperCase() || "?")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[80px] text-center leading-tight">
                {isHome ? teamName : (opponentName || "Rival")}
              </p>
            </div>

            <div className="flex items-center gap-3 px-2">
              <span className="font-display text-5xl tabular-nums">{leftScore}</span>
              <span className="text-2xl text-muted-foreground">–</span>
              <span className="font-display text-5xl tabular-nums">{rightScore}</span>
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                !isHome ? "bg-accent" : "bg-muted"
              )}>
                <span className={cn(
                  "font-display text-2xl",
                  !isHome ? "text-accent-foreground" : "text-muted-foreground"
                )}>
                  {!isHome ? "TU" : (opponentName.charAt(0).toUpperCase() || "?")}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[80px] text-center leading-tight">
                {!isHome ? teamName : (opponentName || "Rival")}
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4 opacity-60">
            Marcador derivado de los eventos
          </p>
        </div>

        {/* ── Match info ────────────────────────────────── */}
        <section className="mb-6">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Información del partido
          </h2>

          {/* Rival */}
          <div className="bg-card rounded-xl p-4 mb-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-2">
              Equipo rival
            </label>
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={opponentName}
              onChange={(e) => setOpponentName(e.target.value)}
              className="w-full bg-transparent text-xl font-display placeholder:text-muted-foreground/40 focus:outline-none"
            />
          </div>

          {/* Home/Away */}
          <div className="flex justify-center mb-3">
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

          {/* Match type */}
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
          <div className="bg-card rounded-xl p-4 mb-3">
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

          {/* Status */}
          <div className="bg-card rounded-xl p-4 mb-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-3">
              Estado del partido
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={cn(
                    "py-3 rounded-xl text-sm font-display uppercase tracking-wider transition-colors border",
                    status === value
                      ? value === "finished"
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-foreground text-background border-foreground"
                      : "bg-background text-muted-foreground border-border/30"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── Events ───────────────────────────────────── */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              Eventos del partido
            </h2>
            <span className="text-xs text-muted-foreground">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </span>
          </div>

          {events.length > 0 && (
            <div className="space-y-2 mb-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-card rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base",
                    event.side === "mine" ? "bg-accent/15" : "bg-muted"
                  )}>
                    {eventIcon(event)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium text-sm leading-tight truncate",
                      event.side === "rival" && "text-muted-foreground"
                    )}>
                      {eventLabel(event)}
                    </p>
                    {eventSub(event) && (
                      <p className="text-xs text-muted-foreground truncate">
                        {eventSub(event)}
                      </p>
                    )}
                  </div>

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

          <button
            onClick={() => setAddEventOpen(true)}
            className="w-full bg-card border-2 border-dashed border-border/50 rounded-xl p-4 flex items-center justify-center gap-3 hover:border-accent/40 transition-colors group active:scale-[0.99]"
          >
            <div className="w-9 h-9 rounded-full bg-muted group-hover:bg-accent/15 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <span className="font-display text-lg uppercase text-muted-foreground group-hover:text-foreground transition-colors">
              Agregar evento
            </span>
          </button>
        </section>

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
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      <AddEventSheet
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        players={players}
        onAddEvent={handleAddEvent}
      />
    </AppShell>
  )
}
