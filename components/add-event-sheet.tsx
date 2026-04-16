"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Check, ChevronLeft, Search, Shield, ShieldAlert } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

export type EventSide = "mine" | "rival"
export type EventKind = "goal" | "own_goal" | "yellow_card" | "red_card"

export interface MatchEvent {
  id: string
  side: EventSide
  kind: EventKind
  playerId?: string
  playerName?: string
  assistPlayerId?: string
  assistPlayerName?: string
  minute?: number
}

export interface Player {
  id: string
  name: string
  number: number | null
  position: string | null
}

interface AddEventSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  players: Player[]
  onAddEvent: (event: MatchEvent) => void
}

type Step = "side" | "kind" | "detail"

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "Portero",
  defender: "Defensa",
  midfielder: "Mediocampista",
  forward: "Delantero",
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AddEventSheet({
  open,
  onOpenChange,
  players,
  onAddEvent,
}: AddEventSheetProps) {
  const [step, setStep] = useState<Step>("side")
  const [side, setSide] = useState<EventSide>("mine")
  const [kind, setKind] = useState<EventKind>("goal")
  const [minute, setMinute] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [selectedAssist, setSelectedAssist] = useState<Player | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [assistSearch, setAssistSearch] = useState("")
  const [showAssistPicker, setShowAssistPicker] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (!open) {
      const t = setTimeout(resetState, 250)
      return () => clearTimeout(t)
    }
  }, [open])

  function resetState() {
    setStep("side")
    setSide("mine")
    setKind("goal")
    setMinute("")
    setSelectedPlayer(null)
    setSelectedAssist(null)
    setSearchQuery("")
    setAssistSearch("")
    setShowAssistPicker(false)
    setShowSuccess(false)
  }

  const parsedMinute = minute ? parseInt(minute, 10) : undefined
  const validMinute =
    parsedMinute !== undefined && parsedMinute >= 0 && parsedMinute <= 120
      ? parsedMinute
      : undefined

  const needsPlayer = side === "mine"
  const isGoal = kind === "goal"
  const canSubmitDetail =
    !needsPlayer || selectedPlayer !== null

  const filteredPlayers = players.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.number != null && p.number.toString().includes(searchQuery))
  )
  const filteredAssist = players.filter(
    (p) =>
      p.id !== selectedPlayer?.id &&
      (p.name.toLowerCase().includes(assistSearch.toLowerCase()) ||
        (p.number != null && p.number.toString().includes(assistSearch)))
  )

  function flashSuccess(then: () => void) {
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      then()
    }, 700)
  }

  function handleSelectSide(s: EventSide) {
    setSide(s)
    setStep("kind")
  }

  function handleSelectKind(k: EventKind) {
    setKind(k)
    setStep("detail")
  }

  function handleConfirmDetail() {
    if (needsPlayer && !selectedPlayer) return

    const id = `${Date.now()}-${Math.random()}`

    onAddEvent({
      id,
      side,
      kind,
      playerId: selectedPlayer?.id,
      playerName: selectedPlayer?.name,
      assistPlayerId: selectedAssist?.id,
      assistPlayerName: selectedAssist?.name,
      minute: validMinute,
    })

    flashSuccess(resetState)
  }

  function handleRivalConfirm() {
    const id = `${Date.now()}-${Math.random()}`
    onAddEvent({ id, side: "rival", kind, minute: validMinute })
    flashSuccess(resetState)
  }

  // Step labels
  const kindLabel: Record<EventKind, string> = {
    goal: "Gol",
    own_goal: "Autogol",
    yellow_card: "Amarilla",
    red_card: "Roja",
  }
  const kindIcon: Record<EventKind, string> = {
    goal: "⚽",
    own_goal: "🔄",
    yellow_card: "🟨",
    red_card: "🟥",
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[88vh] rounded-t-3xl bg-card border-0 px-0 overflow-hidden"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/25" />
        </div>

        {/* ── Success overlay ──────────────────────────────────── */}
        {showSuccess && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-card rounded-t-3xl">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-accent mx-auto flex items-center justify-center mb-4">
                <Check className="h-10 w-10 text-accent-foreground" />
              </div>
              <p className="font-display text-2xl uppercase">Evento agregado</p>
              <p className="text-sm text-muted-foreground mt-1">Puedes agregar más</p>
            </div>
          </div>
        )}

        {/* ── Step: Side ─────────────────────────────────────────── */}
        {step === "side" && !showSuccess && (
          <div className="px-6 pt-4">
            <h2 className="font-display text-3xl uppercase tracking-tight mb-2 text-center">
              Agregar evento
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-8">
              ¿De qué equipo es el evento?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleSelectSide("mine")}
                className="w-full flex items-center gap-4 bg-accent text-accent-foreground rounded-2xl p-5 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-accent-foreground/10 flex items-center justify-center shrink-0">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display text-xl uppercase tracking-wide">Mi equipo</p>
                  <p className="text-xs opacity-70 mt-0.5">Seleccionar jugador</p>
                </div>
              </button>

              <button
                onClick={() => handleSelectSide("rival")}
                className="w-full flex items-center gap-4 bg-destructive/10 border border-destructive/30 text-destructive rounded-2xl p-5 active:scale-[0.98] transition-transform"
              >
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-display text-xl uppercase tracking-wide">Rival</p>
                  <p className="text-xs opacity-70 mt-0.5">Sin jugador asignado</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step: Kind ─────────────────────────────────────────── */}
        {step === "kind" && !showSuccess && (
          <div className="px-6 pt-4">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep("side")}
                className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  {side === "mine" ? "Mi equipo" : "Rival"}
                </p>
                <h2 className="font-display text-2xl uppercase tracking-tight">
                  ¿Qué pasó?
                </h2>
              </div>
            </div>

            <div className={cn(
              "grid gap-3",
              side === "mine" ? "grid-cols-2" : "grid-cols-3"
            )}>
              {/* Goal */}
              <KindButton
                icon="⚽"
                label="Gol"
                onClick={() => handleSelectKind("goal")}
                accent
              />

              {/* Own goal — only for my team */}
              {side === "mine" && (
                <KindButton
                  icon="🔄"
                  label="Autogol"
                  sublabel="Rival"
                  onClick={() => handleSelectKind("own_goal")}
                />
              )}

              {/* Yellow card */}
              <KindButton
                icon="🟨"
                label="Amarilla"
                onClick={() => handleSelectKind("yellow_card")}
              />

              {/* Red card */}
              <KindButton
                icon="🟥"
                label="Roja"
                onClick={() => handleSelectKind("red_card")}
              />
            </div>
          </div>
        )}

        {/* ── Step: Detail ───────────────────────────────────────── */}
        {step === "detail" && !showSuccess && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="px-6 pt-4 pb-4 shrink-0">
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => { setStep("kind"); setSelectedPlayer(null); setSelectedAssist(null) }}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                    {side === "mine" ? "Mi equipo" : "Rival"} · {kindLabel[kind]}
                  </p>
                  <h2 className="font-display text-2xl uppercase tracking-tight">
                    {kindIcon[kind]} {kindLabel[kind]}
                  </h2>
                </div>
              </div>

              {/* Minute input */}
              <div className="bg-background rounded-xl px-4 py-3 flex items-center gap-2 mb-4">
                <span className="text-xs text-muted-foreground uppercase tracking-widest">
                  Minuto
                </span>
                <input
                  type="number"
                  min={0}
                  max={120}
                  placeholder="—"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  className="flex-1 bg-transparent font-display text-2xl focus:outline-none placeholder:text-muted-foreground/30 text-right"
                />
                <span className="font-display text-xl text-muted-foreground/50">'</span>
              </div>

              {/* Rival: simple confirm */}
              {side === "rival" && (
                <button
                  onClick={handleRivalConfirm}
                  className="w-full bg-accent text-accent-foreground py-4 rounded-2xl font-display text-xl uppercase tracking-wide active:scale-[0.98] transition-transform"
                >
                  Confirmar {kindLabel[kind]}
                </button>
              )}

              {/* Mine: player search header */}
              {side === "mine" && !showAssistPicker && (
                <>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    {kind === "goal" ? "Goleador" : kind === "own_goal" ? "Jugador (autogol)" : "Jugador amonestado"}
                  </p>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre o número..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-background rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                </>
              )}

              {/* Mine + goal: assist picker header */}
              {side === "mine" && showAssistPicker && (
                <>
                  <div className="bg-background/60 rounded-xl px-4 py-2 mb-3 flex items-center gap-2">
                    <span className="text-accent text-sm">⚽ {selectedPlayer?.name}</span>
                    {selectedPlayer?.number != null && (
                      <span className="text-muted-foreground text-xs">#{selectedPlayer.number}</span>
                    )}
                    {validMinute != null && (
                      <span className="text-muted-foreground text-xs ml-auto">{validMinute}'</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
                    Asistencia (opcional)
                  </p>
                  <button
                    onClick={handleConfirmDetail}
                    className="w-full bg-background rounded-xl p-3 mb-3 text-center text-sm text-muted-foreground active:scale-[0.98] transition-transform"
                  >
                    Sin asistencia →
                  </button>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Buscar asistente..."
                      value={assistSearch}
                      onChange={(e) => setAssistSearch(e.target.value)}
                      className="w-full bg-background rounded-xl pl-11 pr-4 py-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Player list */}
            {side === "mine" && !showAssistPicker && (
              <div className="flex-1 overflow-y-auto px-6 pb-10">
                {filteredPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {filteredPlayers.map((player) => (
                      <PlayerRow
                        key={player.id}
                        player={player}
                        onClick={() => {
                          setSelectedPlayer(player)
                          setSearchQuery("")
                          if (kind === "goal") {
                            setShowAssistPicker(true)
                          } else {
                            // For own_goal, yellow_card, red_card → confirm immediately
                            const id = `${Date.now()}-${Math.random()}`
                            onAddEvent({
                              id,
                              side: "mine",
                              kind,
                              playerId: player.id,
                              playerName: player.name,
                              minute: validMinute,
                            })
                            flashSuccess(resetState)
                          }
                        }}
                        highlighted={selectedPlayer?.id === player.id}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10 text-sm">
                    No se encontraron jugadores
                  </p>
                )}
              </div>
            )}

            {/* Assist picker list */}
            {side === "mine" && showAssistPicker && (
              <div className="flex-1 overflow-y-auto px-6 pb-10">
                {filteredAssist.length > 0 ? (
                  <div className="space-y-2">
                    {filteredAssist.map((player) => (
                      <PlayerRow
                        key={player.id}
                        player={player}
                        onClick={() => {
                          setSelectedAssist(player)
                          const id = `${Date.now()}-${Math.random()}`
                          onAddEvent({
                            id,
                            side: "mine",
                            kind: "goal",
                            playerId: selectedPlayer?.id,
                            playerName: selectedPlayer?.name,
                            assistPlayerId: player.id,
                            assistPlayerName: player.name,
                            minute: validMinute,
                          })
                          flashSuccess(resetState)
                        }}
                        highlighted={false}
                        muted
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-10 text-sm">
                    No se encontraron jugadores
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Kind Button ──────────────────────────────────────────────────────────────

function KindButton({
  icon,
  label,
  sublabel,
  onClick,
  accent,
}: {
  icon: string
  label: string
  sublabel?: string
  onClick: () => void
  accent?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl py-6 active:scale-[0.97] transition-transform",
        accent ? "bg-accent text-accent-foreground" : "bg-background text-foreground"
      )}
    >
      <span className="text-3xl leading-none">{icon}</span>
      <span className="font-display text-base uppercase tracking-wide">{label}</span>
      {sublabel && (
        <span className="text-[10px] uppercase tracking-widest opacity-60 -mt-1">
          {sublabel}
        </span>
      )}
    </button>
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
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full bg-background rounded-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform text-left",
        highlighted && "ring-2 ring-accent"
      )}
    >
      <div
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-2",
          muted ? "border-border/40" : "border-accent"
        )}
      >
        <span className={cn("font-display text-lg", muted ? "text-muted-foreground" : "")}>
          {player.number ?? "—"}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-base truncate">{player.name}</p>
        <p className="text-sm text-muted-foreground">
          {player.position
            ? (POSITION_LABEL[player.position] ?? player.position)
            : "Sin posición"}
        </p>
      </div>
    </button>
  )
}
