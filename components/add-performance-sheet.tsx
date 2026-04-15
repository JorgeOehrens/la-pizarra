"use client"

import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { 
  ChevronLeft,
  Check,
  Minus,
  Plus,
  Calendar
} from "lucide-react"

type FlowStep = "type" | "match" | "quantity" | "success"
type PerformanceType = "goals" | "assists"

interface AddPerformanceSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  playerName: string
  playerId: string
}

// Mock recent matches
const recentMatches = [
  { id: "1", rival: "Deportivo Sur", result: "3-1", date: "12 Abr", isWin: true },
  { id: "2", rival: "Real Norte", result: "2-2", date: "5 Abr", isDraw: true },
  { id: "3", rival: "Atlético Centro", result: "1-0", date: "29 Mar", isWin: true },
  { id: "4", rival: "Unidos FC", result: "0-2", date: "22 Mar", isLoss: true },
  { id: "5", rival: "Tigres", result: "4-1", date: "15 Mar", isWin: true },
]

export function AddPerformanceSheet({ 
  open, 
  onOpenChange, 
  playerName 
}: AddPerformanceSheetProps) {
  const [step, setStep] = useState<FlowStep>("type")
  const [performanceType, setPerformanceType] = useState<PerformanceType>("goals")
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)
  const [isHistorico, setIsHistorico] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [savedEvents, setSavedEvents] = useState<Array<{type: PerformanceType, qty: number, match: string | null}>>([])

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when closing
      setTimeout(() => {
        setStep("type")
        setPerformanceType("goals")
        setSelectedMatch(null)
        setIsHistorico(false)
        setQuantity(1)
      }, 300)
    }
    onOpenChange(open)
  }

  const handleBack = () => {
    if (step === "match") setStep("type")
    else if (step === "quantity") setStep("match")
    else if (step === "success") {
      // Reset for another entry
      setStep("type")
      setQuantity(1)
      setSelectedMatch(null)
      setIsHistorico(false)
    }
  }

  const handleSelectType = (type: PerformanceType) => {
    setPerformanceType(type)
    setStep("match")
  }

  const handleSelectMatch = (matchId: string | null) => {
    setSelectedMatch(matchId)
    setIsHistorico(matchId === null)
    setStep("quantity")
  }

  const handleSave = () => {
    // Save the performance
    setSavedEvents(prev => [...prev, {
      type: performanceType,
      qty: quantity,
      match: selectedMatch
    }])
    setStep("success")
  }

  const handleAddAnother = () => {
    setStep("type")
    setQuantity(1)
    setSelectedMatch(null)
    setIsHistorico(false)
  }

  const selectedMatchData = recentMatches.find(m => m.id === selectedMatch)

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="bottom" 
        className="h-[85vh] rounded-t-3xl bg-card border-0 px-0 overflow-hidden flex flex-col"
      >
        <SheetHeader className="sr-only">
          <SheetTitle>Añadir rendimiento</SheetTitle>
        </SheetHeader>

        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        <div className="flex-1 overflow-y-auto pb-safe">
          {/* Step 1: Select Type */}
          {step === "type" && (
            <div className="px-6">
              <h2 className="font-display text-3xl uppercase tracking-tight mb-2">
                Añadir rendimiento
              </h2>
              <p className="text-muted-foreground mb-8">
                {playerName}
              </p>

              <div className="space-y-4">
                {/* Goals Option */}
                <button
                  onClick={() => handleSelectType("goals")}
                  className="w-full bg-background rounded-2xl p-6 text-left active:scale-[0.98] transition-all border border-transparent hover:border-accent/20"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-3xl">
                      ⚽
                    </div>
                    <div>
                      <h3 className="font-display text-2xl uppercase tracking-tight">
                        Goles
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Registrar goles anotados
                      </p>
                    </div>
                  </div>
                </button>

                {/* Assists Option */}
                <button
                  onClick={() => handleSelectType("assists")}
                  className="w-full bg-background rounded-2xl p-6 text-left active:scale-[0.98] transition-all border border-transparent hover:border-accent/20"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
                      🎯
                    </div>
                    <div>
                      <h3 className="font-display text-2xl uppercase tracking-tight">
                        Asistencias
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Registrar asistencias
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Recent Activity */}
              {savedEvents.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    Agregados esta sesión
                  </h4>
                  <div className="space-y-2">
                    {savedEvents.map((event, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{event.type === "goals" ? "⚽" : "🎯"}</span>
                        <span>+{event.qty} {event.type === "goals" ? "gol" : "asist"}{event.qty > 1 ? "es" : ""}</span>
                        {event.match && (
                          <span className="text-foreground">
                            vs {recentMatches.find(m => m.id === event.match)?.rival}
                          </span>
                        )}
                        {!event.match && (
                          <span className="text-muted-foreground/60">(histórico)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Select Match */}
          {step === "match" && (
            <div className="px-6">
              <div className="flex items-center gap-3 mb-6">
                <button 
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-tight">
                    Seleccionar partido
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {performanceType === "goals" ? "Goles" : "Asistencias"} para {playerName}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Historic Option */}
                <button
                  onClick={() => handleSelectMatch(null)}
                  className="w-full bg-muted/50 rounded-xl p-4 text-left active:scale-[0.98] transition-all border-2 border-dashed border-muted-foreground/20 hover:border-accent/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-display text-lg uppercase">Sin partido</h4>
                      <p className="text-xs text-muted-foreground">Registro histórico</p>
                    </div>
                  </div>
                </button>

                {/* Recent Matches */}
                <p className="text-xs text-muted-foreground uppercase tracking-wider pt-2">
                  Partidos recientes
                </p>
                
                {recentMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => handleSelectMatch(match.id)}
                    className="w-full bg-background rounded-xl p-4 text-left active:scale-[0.98] transition-all border border-transparent hover:border-accent/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center font-display text-sm",
                          match.isWin && "bg-accent/20 text-accent",
                          match.isDraw && "bg-muted text-muted-foreground",
                          match.isLoss && "bg-destructive/20 text-destructive"
                        )}>
                          {match.result}
                        </div>
                        <div>
                          <h4 className="font-semibold">vs {match.rival}</h4>
                          <p className="text-xs text-muted-foreground">{match.date}</p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Quantity Input */}
          {step === "quantity" && (
            <div className="px-6">
              <div className="flex items-center gap-3 mb-8">
                <button 
                  onClick={handleBack}
                  className="p-2 -ml-2 rounded-xl hover:bg-background transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <div>
                  <h2 className="font-display text-2xl uppercase tracking-tight">
                    Cantidad
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {isHistorico ? "Registro histórico" : `vs ${selectedMatchData?.rival}`}
                  </p>
                </div>
              </div>

              {/* Large Stepper */}
              <div className="flex flex-col items-center py-8">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">
                  {performanceType === "goals" ? "Goles" : "Asistencias"}
                </p>
                
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                      quantity <= 1 
                        ? "bg-muted text-muted-foreground cursor-not-allowed" 
                        : "bg-background hover:bg-accent/20"
                    )}
                  >
                    <Minus className="h-6 w-6" />
                  </button>

                  <div className="w-32 h-32 rounded-3xl bg-accent flex items-center justify-center">
                    <span className="font-display text-7xl text-accent-foreground">
                      {quantity}
                    </span>
                  </div>

                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                    className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                      quantity >= 10 
                        ? "bg-muted text-muted-foreground cursor-not-allowed" 
                        : "bg-background hover:bg-accent/20"
                    )}
                  >
                    <Plus className="h-6 w-6" />
                  </button>
                </div>

                {/* Quick Select */}
                <div className="flex gap-2 mt-8">
                  {[1, 2, 3, 5].map((num) => (
                    <button
                      key={num}
                      onClick={() => setQuantity(num)}
                      className={cn(
                        "w-12 h-12 rounded-xl font-display text-lg transition-all",
                        quantity === num 
                          ? "bg-accent text-accent-foreground" 
                          : "bg-background hover:bg-accent/20"
                      )}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSave}
                className="w-full bg-accent text-accent-foreground font-display text-xl uppercase tracking-wider py-5 rounded-2xl active:scale-[0.98] transition-transform mt-4"
              >
                Guardar +{quantity} {performanceType === "goals" ? "gol" : "asist"}{quantity > 1 ? "es" : ""}
              </button>
            </div>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <div className="px-6 flex flex-col items-center justify-center h-full py-12">
              <div className="w-20 h-20 rounded-full bg-accent flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-accent-foreground" />
              </div>
              
              <h2 className="font-display text-3xl uppercase tracking-tight text-center mb-2">
                Guardado
              </h2>
              
              <p className="text-muted-foreground text-center mb-8">
                +{quantity} {performanceType === "goals" ? "gol" : "asistencia"}{quantity > 1 ? "es" : ""} para {playerName}
                {selectedMatchData && (
                  <span className="block text-sm mt-1">vs {selectedMatchData.rival}</span>
                )}
                {isHistorico && (
                  <span className="block text-sm mt-1 text-muted-foreground/60">(histórico)</span>
                )}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={handleAddAnother}
                  className="flex-1 bg-background font-display text-lg uppercase tracking-wider py-4 rounded-xl active:scale-[0.98] transition-transform"
                >
                  Añadir otro
                </button>
                <button
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 bg-accent text-accent-foreground font-display text-lg uppercase tracking-wider py-4 rounded-xl active:scale-[0.98] transition-transform"
                >
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
