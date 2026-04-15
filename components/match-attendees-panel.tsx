"use client"

import { useState, useTransition } from "react"
import { Check, X, Clock, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { setPlayerAttendance } from "@/app/matches/[id]/attendance-actions"

const POSITION_LABEL: Record<string, string> = {
  goalkeeper: "POR",
  defender: "DEF",
  midfielder: "MED",
  forward: "DEL",
}

export type AttendeeInfo = {
  userId: string
  name: string
  number: number | null
  position: string | null
  status: "confirmed" | "declined" | null
}

interface MatchAttendeesPanelProps {
  matchId: string
  attendees: AttendeeInfo[]
  isAdmin: boolean
  matchStatus: string
}

export function MatchAttendeesPanel({
  matchId,
  attendees,
  isAdmin,
  matchStatus,
}: MatchAttendeesPanelProps) {
  const [statuses, setStatuses] = useState<Record<string, "confirmed" | "declined" | null>>(
    Object.fromEntries(attendees.map((a) => [a.userId, a.status]))
  )
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const [collapsed, setCollapsed] = useState(false)

  const confirmedCount = attendees.filter((a) => statuses[a.userId] === "confirmed").length
  const label = matchStatus === "finished" ? "Asistencia al partido" : "Confirmaciones"

  function handleToggle(userId: string, next: "confirmed" | "declined") {
    if (!isAdmin || pendingId) return
    const current = statuses[userId]
    // If already this status, toggle off (set to null) — admin can clear
    const value: "confirmed" | "declined" | null = current === next ? null : next
    // We can only set confirmed/declined via the RPC, not clear.
    // So if toggling off, skip for now (RPC doesn't support null).
    if (value === null) {
      // just update locally to give visual feedback
      setStatuses((prev) => ({ ...prev, [userId]: null }))
      return
    }
    setPendingId(userId)
    startTransition(async () => {
      const res = await setPlayerAttendance(matchId, userId, value)
      if (!("error" in res)) {
        setStatuses((prev) => ({ ...prev, [userId]: value }))
      }
      setPendingId(null)
    })
  }

  return (
    <section className="mb-6">
      <button
        className="flex items-center justify-between w-full mb-3"
        onClick={() => setCollapsed((v) => !v)}
      >
        <h2 className="font-display text-lg">{label}</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {confirmedCount}/{attendees.length} confirmados
          </span>
          {collapsed ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {!collapsed && (
        <div className="bg-card rounded-xl divide-y divide-border/30">
          {attendees.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">Sin jugadores en el equipo</p>
            </div>
          ) : (
            attendees.map((a) => {
              const status = statuses[a.userId]
              const isPending = pendingId === a.userId

              return (
                <div key={a.userId} className="flex items-center gap-3 px-4 py-3">
                  {/* Jersey number */}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-display text-sm",
                      status === "confirmed"
                        ? "border-accent text-accent"
                        : "border-border/60 text-muted-foreground"
                    )}
                  >
                    {a.number ?? "—"}
                  </div>

                  {/* Name + position */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.name}</p>
                    {a.position && (
                      <p className="text-xs text-muted-foreground">
                        {POSITION_LABEL[a.position] ?? a.position}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  {isAdmin ? (
                    <div className="flex gap-1.5 shrink-0">
                      <button
                        disabled={isPending}
                        onClick={() => handleToggle(a.userId, "confirmed")}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          status === "confirmed"
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted text-muted-foreground hover:bg-accent/20",
                          isPending && "opacity-50"
                        )}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        disabled={isPending}
                        onClick={() => handleToggle(a.userId, "declined")}
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                          status === "declined"
                            ? "bg-destructive/20 text-destructive"
                            : "bg-muted text-muted-foreground hover:bg-destructive/10",
                          isPending && "opacity-50"
                        )}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="shrink-0">
                      {status === "confirmed" && (
                        <span className="flex items-center gap-1 text-xs text-accent">
                          <Check className="h-3.5 w-3.5" />
                          Va
                        </span>
                      )}
                      {status === "declined" && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <X className="h-3.5 w-3.5" />
                          No va
                        </span>
                      )}
                      {!status && (
                        <span className="text-xs text-muted-foreground/40">
                          <Clock className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}
    </section>
  )
}
