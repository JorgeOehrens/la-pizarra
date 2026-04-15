"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { setupPlayerProfile } from "./actions"

const POSITIONS = [
  { label: "POR", value: "goalkeeper" },
  { label: "DEF", value: "defender" },
  { label: "MED", value: "midfielder" },
  { label: "DEL", value: "forward" },
]

export function SetupPlayerForm() {
  const [position, setPosition] = useState<string | null>(null)
  const [jerseyNumber, setJerseyNumber] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    setError(null)
    const formData = new FormData()
    if (position) formData.set("position", position)
    if (jerseyNumber) formData.set("jersey_number", jerseyNumber)

    startTransition(async () => {
      const result = await setupPlayerProfile(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="space-y-8">
      {/* Jersey number */}
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">
          Número de camiseta
        </label>
        <div className="flex items-center gap-5">
          <div className="w-24 h-24 rounded-full border-2 border-accent flex items-center justify-center bg-card shrink-0">
            <input
              type="number"
              min={1}
              max={99}
              value={jerseyNumber}
              onChange={(e) => setJerseyNumber(e.target.value)}
              placeholder="—"
              className="w-full text-center bg-transparent font-display text-4xl focus:outline-none placeholder:text-muted-foreground/30"
            />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tu número en la plantilla. Puedes cambiarlo después.
          </p>
        </div>
      </div>

      {/* Position */}
      <div>
        <label className="text-xs uppercase tracking-widest text-muted-foreground mb-3 block">
          Posición
        </label>
        <div className="grid grid-cols-4 gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos.value}
              type="button"
              onClick={() => setPosition(pos.value === position ? null : pos.value)}
              className={cn(
                "py-4 rounded-2xl text-sm font-display uppercase tracking-wider transition-all active:scale-[0.97] border",
                position === pos.value
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-card text-muted-foreground border-border/40"
              )}
            >
              {pos.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
          {error}
        </p>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-accent text-accent-foreground font-display uppercase tracking-wider text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Guardando..." : "Continuar"}
      </button>

      <div className="text-center">
        <Link
          href="/home"
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Saltar por ahora
        </Link>
      </div>
    </div>
  )
}
