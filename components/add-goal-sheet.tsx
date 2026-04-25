"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Check, ChevronLeft, Minus, Plus, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Player } from "@/components/add-event-sheet"

interface GoalEvent {
  id: string
  type: "goal" | "own_goal"
  player?: Player
  assist?: Player
  minute?: number
}

interface AddGoalSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  players: Player[]
  onAddEvent: (event: Omit<GoalEvent, "id">) => void
}

type Step = "type" | "player" | "assist"

export function AddGoalSheet({ open, onOpenChange, players, onAddEvent }: AddGoalSheetProps) {
  const [goalType, setGoalType] = useState<"goal" | "own_goal">("goal")
  const [goalCount, setGoalCount] = useState(1)
  const [minute, setMinute] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedAssist, setSelectedAssist] = useState<Player | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [step, setStep] = useState<Step>("type")
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(resetState, 250)
      return () => clearTimeout(t)
    }
  }, [open])

  function resetState() {
    setGoalType("goal")
    setGoalCount(1)
    setMinute("")
    setSelectedPlayer(null)
    setSelectedAssist(null)
    setSearchQuery("")
    setStep("type")
    setShowSuccess(false)
  }

  const parsedMinute = minute ? parseInt(minute, 10) : undefined
  const validMinute = parsedMinute !== undefined && parsedMinute >= 0 && parsedMinute <= 120
    ? parsedMinute
    : undefined

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.number != null && p.number.toString().includes(searchQuery))
  )
  const assistPlayers = players.filter((p) => p.id !== selectedPlayer?.id)

  function flashSuccess(then: () => void) {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      then()
    }, 700)
  }

  function handleSelectPlayer(player: Player) {
    setSelectedPlayer(player)
    setSearchQuery("")
    setStep("assist")
  }

  function submitGoal(assist: Player | null) {
    for (let i = 0; i < goalCount; i++) {
      onAddEvent({
        type: "goal",
        player: selectedPlayer ?? undefined,
        assist: assist ?? undefined,
        minute: validMinute,
      })
    }
    flashSuccess(resetState)
  }

  function submitOwnGoal() {
    for (let i = 0; i < goalCount; i++) {
      onAddEvent({ type: "own_goal", minute: validMinute })
    }
    flashSuccess(resetState)
  }

  function handleGoNext() {
    if (goalType === "goal") {
      setStep("player")
    } else {
      submitOwnGoal()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[88vh] rounded-t-3xl bg-card border-0 px-0 overflow-hidden"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Agregar gol</SheetTitle>
        </SheetHeader>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* Success overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-card rounded-t-3xl">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent mx-auto flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-accent-foreground" />
              </div>
              <p className="font-display text-2xl uppercase">
                {goalCount > 1 ? `${goalCount} goles agregados` : "Gol agregado"}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Puedes agregar más</p>
            </div>
          </div>
        )}

        {/* ── Step: Type + Minute ──────────────────────── */}
        {step === "type" && !showSuccess && (
          <div className="px-6 pt-4">
            <h2 className="font-display text-3xl uppercase tracking-tight mb-7 text-center">
              Agregar gol
            </h2>

            {/* Goal type toggle */}
            <div className="bg-background rounded-2xl p-1.5 flex mb-7">
              <button
                onClick={() => setGoalType("goal")}
                className={cn(
                  "flex-1 py-4 rounded-xl font-display text-lg uppercase tracking-wide transition-all",
                  goalType === "goal"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                Gol
              </button>
              <button
                onClick={() => setGoalType("own_goal")}
                className={cn(
                  "flex-1 py-4 rounded-xl font-display text-lg uppercase tracking-wide transition-all",
                  goalType === "own_goal"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                Autogol rival
              </button>
            </div>

            {/* Minute + Count row */}
            <div className="flex gap-3 mb-7">
              {/* Minute */}
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                  Minuto
                </label>
                <div className="flex items-center gap-2 bg-background rounded-xl px-4 py-3">
                  <input
                    type="number"
                    min={0}
                    max={120}
                    placeholder="—"
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="flex-1 bg-transparent font-display text-2xl focus:outline-none placeholder:text-muted-foreground/30 w-12"
                  />
                  <span className="font-display text-xl text-muted-foreground/50">'</span>
                </div>
              </div>

              {/* Goal count */}
              <div className="flex-1">
                <label className="text-xs uppercase tracking-widest text-muted-foreground block mb-2">
                  Cantidad
                </label>
                <div className="flex items-center justify-between bg-background rounded-xl px-3 py-3">
                  <button
                    onClick={() => setGoalCount((c) => Math.max(1, c - 1))}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="font-display text-2xl w-6 text-center tabular-nums">
                    {goalCount}
                  </span>
                  <button
                    onClick={() => setGoalCount((c) => Math.min(9, c + 1))}
                    className="w-8 h-8 rounded-full bg-card flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={handleGoNext}
              className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-display text-xl uppercase tracking-wide active:scale-[0.98] transition-transform"
            >
              {goalType === "goal"
                ? "Seleccionar goleador"
                : goalCount === 1
                  ? "Agregar autogol rival"
                  : `Agregar ${goalCount} autogoles`}
            </button>

            <p className="text-center text-xs text-muted-foreground mt-4">
              {goalType === "goal"
                ? "Selecciona el jugador que anotó"
                : "Gol a favor por error del rival"}
            </p>
          </div>
        )}

        {/* ── Step: Scorer ─────────────────────────────── */}
        {step === "player" && !showSuccess && (
          <div className="flex flex-col h-full">
            <div className="px-6 pt-4 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-5">
                <button
                  onClick={() => setStep("type")}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="font-display text-2xl uppercase tracking-tight">Goleador</h2>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar por nombre o número..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background rounded-xl pl-11 pr-4 py-3.5 text-base placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              {filteredPlayers.length > 0 ? (
                <div className="space-y-2">
                  {filteredPlayers.map((player) => (
                    <PlayerRow
                      key={player.id}
                      player={player}
                      onClick={() => handleSelectPlayer(player)}
                      highlighted={false}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-10 text-sm">
                  No se encontraron jugadores
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Step: Assist ─────────────────────────────── */}
        {step === "assist" && !showSuccess && (
          <div className="flex flex-col h-full">
            <div className="px-6 pt-4 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-1">
                <button
                  onClick={() => setStep("player")}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <h2 className="font-display text-2xl uppercase tracking-tight">Asistencia</h2>
              </div>

              <p className="text-sm text-muted-foreground mb-5 pl-1">
                <span className="text-accent">
                  {goalCount > 1 ? `${goalCount} goles:` : "Gol:"}
                </span>{" "}
                {selectedPlayer?.name}
                {selectedPlayer?.number != null && ` #${selectedPlayer.number}`}
                {validMinute != null && ` · ${validMinute}'`}
              </p>

              {/* No assist option */}
              <button
                onClick={() => submitGoal(null)}
                className="w-full bg-background rounded-xl p-4 mb-4 flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
              >
                <span className="font-medium text-muted-foreground">Sin asistencia</span>
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/30" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-xs text-muted-foreground uppercase tracking-widest">
                    o selecciona
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-10">
              <div className="space-y-2">
                {assistPlayers.map((player) => (
                  <PlayerRow
                    key={player.id}
                    player={player}
                    onClick={() => submitGoal(player)}
                    highlighted={selectedAssist?.id === player.id}
                    muted
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Player Row ───────────────────────────────────────────────────────────────

function PlayerRow({
  player,
  onClick,
  highlighted,
  muted,
}: {
  player: Player
  onClick: () => void
  highlighted: boolean
  muted?: boolean
}) {
  const POSITION_LABEL: Record<string, string> = {
    goalkeeper: "Portero",
    defender: "Defensa",
    midfielder: "Mediocampista",
    forward: "Delantero",
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-background rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left",
        highlighted && "ring-2 ring-accent"
      )}
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2",
        muted ? "border-border/40" : "border-accent"
      )}>
        <span className={cn(
          "font-display text-lg",
          muted ? "text-muted-foreground" : ""
        )}>
          {player.number ?? "—"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base truncate">{player.name}</p>
        <p className="text-sm text-muted-foreground">
          {player.position ? (POSITION_LABEL[player.position] ?? player.position) : "Sin posición"}
        </p>
      </div>
    </button>
  )
}
