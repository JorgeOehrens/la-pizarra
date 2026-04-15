"use client"

import { useState, useTransition } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { setAttendance } from "@/app/matches/[id]/attendance-actions"

interface AttendanceWidgetProps {
  matchId: string
  currentStatus: "confirmed" | "declined" | null
  /** If true, renders compact version for the home card */
  compact?: boolean
  /** "scheduled" (default) or "finished" — changes the question wording */
  matchStatus?: "scheduled" | "finished" | string
}

export function AttendanceWidget({
  matchId,
  currentStatus,
  compact = false,
  matchStatus = "scheduled",
}: AttendanceWidgetProps) {
  const isFinished = matchStatus === "finished"
  const question = isFinished ? "¿Fuiste al partido?" : "¿Vas al partido?"
  const confirmLabel = isFinished ? "Sí, fui" : "Sí, voy"
  const declineLabel = isFinished ? "No fui" : "No puedo"
  const confirmedMsg = isFinished
    ? "¡Registrado! Cuenta como partido jugado."
    : "¡Confirmado! El equipo cuenta contigo."
  const declinedMsg = isFinished
    ? "Entendido, no fuiste a este partido."
    : "Entendido, no podrás ir."

  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSelect(next: "confirmed" | "declined") {
    const value = status === next ? null : next
    if (value === null) return
    setError(null)
    startTransition(async () => {
      const result = await setAttendance(matchId, next)
      if ("error" in result) {
        setError(result.error)
      } else {
        setStatus(next)
      }
    })
  }

  if (compact) {
    return (
      <div className="mt-4 pt-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
          {question}
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => handleSelect("confirmed")}
            disabled={isPending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]",
              status === "confirmed"
                ? "bg-accent text-accent-foreground"
                : "bg-background text-muted-foreground"
            )}
          >
            {isPending && status !== "confirmed" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {confirmLabel}
          </button>
          <button
            onClick={() => handleSelect("declined")}
            disabled={isPending}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.97]",
              status === "declined"
                ? "bg-destructive/20 text-destructive"
                : "bg-background text-muted-foreground"
            )}
          >
            {isPending && status !== "declined" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <X className="h-4 w-4" />
            )}
            {declineLabel}
          </button>
        </div>
        {error && <p className="text-xs text-destructive mt-2">{error}</p>}
      </div>
    )
  }

  return (
    <div className="bg-card rounded-2xl p-5">
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
        Tu asistencia
      </p>
      <h3 className="font-display text-xl uppercase tracking-tight mb-5">
        {question}
      </h3>

      <div className="flex gap-3">
        <button
          onClick={() => handleSelect("confirmed")}
          disabled={isPending}
          className={cn(
            "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all active:scale-[0.97] border-2",
            status === "confirmed"
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-background text-muted-foreground border-transparent"
          )}
        >
          {isPending && status !== "confirmed" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Check className={cn("h-6 w-6", status === "confirmed" ? "stroke-[3]" : "")} />
          )}
          <span className="font-display text-base uppercase tracking-wide">
            {confirmLabel}
          </span>
        </button>

        <button
          onClick={() => handleSelect("declined")}
          disabled={isPending}
          className={cn(
            "flex-1 flex flex-col items-center gap-2 py-5 rounded-2xl transition-all active:scale-[0.97] border-2",
            status === "declined"
              ? "bg-destructive/15 text-destructive border-destructive/40"
              : "bg-background text-muted-foreground border-transparent"
          )}
        >
          {isPending && status !== "declined" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <X className={cn("h-6 w-6", status === "declined" ? "stroke-[3]" : "")} />
          )}
          <span className="font-display text-base uppercase tracking-wide">
            {declineLabel}
          </span>
        </button>
      </div>

      {status && !error && (
        <p className={cn(
          "text-xs text-center mt-3",
          status === "confirmed" ? "text-accent" : "text-muted-foreground"
        )}>
          {status === "confirmed" ? confirmedMsg : declinedMsg}
        </p>
      )}
      {error && <p className="text-xs text-destructive text-center mt-3">{error}</p>}
    </div>
  )
}
