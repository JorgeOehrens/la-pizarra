"use client"

import { useState, useTransition } from "react"
import { AppShell } from "@/components/app-shell"
import { ChevronLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { updatePlayer, removePlayer } from "../actions"

const POSITIONS = [
  { label: "POR", value: "goalkeeper" },
  { label: "DEF", value: "defender" },
  { label: "MED", value: "midfielder" },
  { label: "DEL", value: "forward" },
]

type InitialData = {
  display_name: string
  position: string | null
  jersey_number: number | null
  role: string
}

export function PlayerEditForm({
  playerId,
  teamId,
  isAdmin,
  isOwnProfile,
  initialData,
}: {
  playerId: string
  teamId: string
  isAdmin: boolean
  isOwnProfile: boolean
  initialData: InitialData
}) {
  const [displayName, setDisplayName] = useState(initialData.display_name)
  const [position, setPosition] = useState<string | null>(initialData.position)
  const [jerseyNumber, setJerseyNumber] = useState<string>(
    initialData.jersey_number != null ? String(initialData.jersey_number) : ""
  )
  const [role, setRole] = useState(initialData.role)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmRemove, setShowConfirmRemove] = useState(false)

  const [isSaving, startSave] = useTransition()
  const [isRemoving, startRemove] = useTransition()

  async function handleSave() {
    if (!displayName.trim()) {
      setError("El nombre no puede estar vacío.")
      return
    }
    setError(null)

    const formData = new FormData()
    formData.set("player_id", playerId)
    formData.set("team_id", teamId)
    formData.set("display_name", displayName.trim())
    if (position) formData.set("position", position)
    if (jerseyNumber) formData.set("jersey_number", jerseyNumber)
    if (isAdmin) formData.set("role", role)

    startSave(async () => {
      const result = await updatePlayer(formData)
      if (result?.error) setError(result.error)
    })
  }

  async function handleRemove() {
    startRemove(async () => {
      const result = await removePlayer(playerId, teamId)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <AppShell showNav={false}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <Link
            href={`/players/${playerId}`}
            className="p-2 -ml-2 rounded-lg hover:bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-display text-xl">Editar jugador</h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="px-4 pb-12 space-y-6">
        {/* Name */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Nombre
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Nombre del jugador"
            className="w-full bg-card border border-border/40 rounded-xl px-4 py-3 font-display text-2xl focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-muted-foreground/40"
          />
        </div>

        {/* Jersey Number */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Número de camiseta
          </label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-accent flex items-center justify-center bg-card">
              <input
                type="number"
                min={1}
                max={99}
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="—"
                className="w-full text-center bg-transparent font-display text-3xl focus:outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <p className="text-sm text-muted-foreground flex-1">
              Número visible en el perfil y la plantilla
            </p>
          </div>
        </div>

        {/* Position */}
        <div>
          <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
            Posición
          </label>
          <div className="grid grid-cols-4 gap-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos.value}
                type="button"
                onClick={() => setPosition(pos.value === position ? null : pos.value)}
                className={cn(
                  "py-3 rounded-xl text-sm font-medium uppercase tracking-wider transition-colors border",
                  position === pos.value
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-muted-foreground border-border/40 hover:border-accent/40"
                )}
              >
                {pos.label}
              </button>
            ))}
          </div>
        </div>

        {/* Role (admin only) */}
        {isAdmin && (
          <div>
            <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
              Rol en el equipo
            </label>
            <div className="flex bg-card rounded-xl p-1 border border-border/40">
              {(["player", "admin"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "flex-1 py-2.5 text-xs uppercase tracking-wider rounded-lg transition-colors",
                    role === r
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground"
                  )}
                >
                  {r === "player" ? "Jugador" : "Admin"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-destructive bg-destructive/10 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-accent text-accent-foreground font-display uppercase tracking-wider text-sm py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50"
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>

        {/* Remove player (admin only, not own profile) */}
        {isAdmin && !isOwnProfile && (
          <div className="pt-4 border-t border-border/40">
            {!showConfirmRemove ? (
              <button
                type="button"
                onClick={() => setShowConfirmRemove(true)}
                className="w-full py-4 rounded-2xl text-sm text-destructive border border-destructive/30 uppercase tracking-wider font-medium hover:bg-destructive/5 transition-colors"
              >
                Eliminar jugador
              </button>
            ) : (
              <div className="bg-destructive/10 rounded-2xl p-5 space-y-3">
                <p className="text-sm text-destructive font-medium text-center">
                  ¿Eliminar del equipo? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowConfirmRemove(false)}
                    className="flex-1 py-3 rounded-xl text-sm border border-border/40 text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isRemoving}
                    className="flex-1 py-3 rounded-xl text-sm bg-destructive text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isRemoving && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isRemoving ? "Eliminando..." : "Confirmar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  )
}
