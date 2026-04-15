"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet"
import { Check, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface Player {
  id: string
  number: number
  name: string
  position: string
}

interface MatchEvent {
  id: string
  type: "goal" | "own_goal"
  player?: Player
  assist?: Player
  rivalPlayer?: string
  minute?: number
}

interface AddGoalSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  players: Player[]
  onAddEvent: (event: Omit<MatchEvent, "id">) => void
}

export function AddGoalSheet({ open, onOpenChange, players, onAddEvent }: AddGoalSheetProps) {
  const [goalType, setGoalType] = useState<"goal" | "own_goal">("goal")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedAssist, setSelectedAssist] = useState<Player | null>(null)
  const [noAssist, setNoAssist] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [step, setStep] = useState<"type" | "player" | "assist">("type")
  const [showSuccess, setShowSuccess] = useState(false)

  // Reset on close
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setGoalType("goal")
        setSelectedPlayer(null)
        setSelectedAssist(null)
        setNoAssist(false)
        setSearchQuery("")
        setStep("type")
        setShowSuccess(false)
      }, 200)
    }
  }, [open])

  const filteredPlayers = players.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.number.toString().includes(searchQuery)
  )

  const assistPlayers = players.filter(p => p.id !== selectedPlayer?.id)

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player)
    setSearchQuery("")
    // Go directly to assist step for goals
    if (goalType === "goal") {
      setStep("assist")
    }
  }

  const handleSelectAssist = (player: Player | null) => {
    setSelectedAssist(player)
    if (player === null) {
      setNoAssist(true)
    }
    handleSubmit(player)
  }

  const handleSubmit = (assist: Player | null = selectedAssist) => {
    const event: Omit<MatchEvent, "id"> = {
      type: goalType,
      player: selectedPlayer || undefined,
      assist: assist || undefined,
    }
    
    onAddEvent(event)
    
    // Show success briefly then reset for another entry
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setSelectedPlayer(null)
      setSelectedAssist(null)
      setNoAssist(false)
      setSearchQuery("")
      setStep("type")
    }, 800)
  }

  const handleOwnGoal = () => {
    setGoalType("own_goal")
    onAddEvent({ type: "own_goal" })
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setGoalType("goal")
      setStep("type")
    }, 800)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl bg-card border-0 px-0 overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Success Overlay */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-card">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent mx-auto flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-accent-foreground" />
              </div>
              <p className="font-display text-2xl uppercase">Gol agregado</p>
              <p className="text-muted-foreground mt-2">Puedes agregar otro</p>
            </div>
          </div>
        )}

        {/* Step: Goal Type */}
        {step === "type" && !showSuccess && (
          <div className="px-6 pt-4">
            <h2 className="font-display text-3xl uppercase tracking-tight mb-8 text-center">
              Agregar gol
            </h2>

            {/* Segmented Control */}
            <div className="bg-background rounded-2xl p-1.5 flex mb-8">
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
                Autogol
              </button>
            </div>

            {/* Action based on type */}
            {goalType === "goal" ? (
              <button
                onClick={() => setStep("player")}
                className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-display text-xl uppercase tracking-wide active:scale-[0.98] transition-transform"
              >
                Seleccionar goleador
              </button>
            ) : (
              <button
                onClick={handleOwnGoal}
                className="w-full bg-accent text-accent-foreground py-5 rounded-2xl font-display text-xl uppercase tracking-wide active:scale-[0.98] transition-transform"
              >
                Agregar autogol rival
              </button>
            )}

            {/* Quick tip */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {goalType === "goal" 
                ? "Selecciona el jugador que anotó" 
                : "Gol a favor por error del rival"}
            </p>
          </div>
        )}

        {/* Step: Player Selection */}
        {step === "player" && !showSuccess && (
          <div className="flex flex-col h-full">
            <div className="px-6 pt-4 pb-4">
              <div className="flex items-center gap-3 mb-6">
                <button 
                  onClick={() => setStep("type")}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="font-display text-2xl uppercase tracking-tight">
                  Goleador
                </h2>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar jugador..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-background rounded-xl pl-12 pr-4 py-4 text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
              </div>
            </div>

            {/* Player List */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              <div className="space-y-2">
                {filteredPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectPlayer(player)}
                    className="w-full bg-background rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="w-12 h-12 rounded-full border-2 border-accent flex items-center justify-center shrink-0">
                      <span className="font-display text-lg">{player.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg truncate">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.position}</p>
                    </div>
                  </button>
                ))}
              </div>

              {filteredPlayers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No se encontraron jugadores</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step: Assist Selection */}
        {step === "assist" && !showSuccess && (
          <div className="flex flex-col h-full">
            <div className="px-6 pt-4 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <button 
                  onClick={() => setStep("player")}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="font-display text-2xl uppercase tracking-tight">
                  Asistencia
                </h2>
              </div>

              {/* Selected scorer */}
              <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                <span className="text-accent">Gol:</span>
                <span>{selectedPlayer?.name}</span>
              </div>

              {/* No assist option */}
              <button
                onClick={() => handleSelectAssist(null)}
                className={cn(
                  "w-full bg-background rounded-xl p-4 mb-4 flex items-center justify-center gap-2 transition-colors",
                  noAssist && "ring-2 ring-accent"
                )}
              >
                <span className="font-medium text-muted-foreground">Sin asistencia</span>
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-card px-4 text-xs text-muted-foreground uppercase">
                    o selecciona jugador
                  </span>
                </div>
              </div>
            </div>

            {/* Player List for Assist */}
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              <div className="space-y-2">
                {assistPlayers.map((player) => (
                  <button
                    key={player.id}
                    onClick={() => handleSelectAssist(player)}
                    className="w-full bg-background rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left"
                  >
                    <div className="w-12 h-12 rounded-full border border-muted-foreground/30 flex items-center justify-center shrink-0">
                      <span className="font-display text-lg text-muted-foreground">{player.number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-lg truncate">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.position}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
