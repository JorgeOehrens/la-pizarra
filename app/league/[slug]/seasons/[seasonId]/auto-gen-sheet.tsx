'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Sparkles, Square, CheckSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  generateRoundRobin,
  generateKnockoutBracket,
} from './actions'

type Team = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

type Mode = 'round_robin' | 'knockout'

export function AutoGenSheet({
  open,
  onClose,
  mode,
  stageId,
  bracketSize,
  participatingTeams,
  seasonId,
  slug,
  defaultStartDate,
  defaultDaysBetween,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  mode: Mode
  stageId: string
  bracketSize: number | null
  participatingTeams: Team[]
  seasonId: string
  slug: string
  defaultStartDate?: string
  defaultDaysBetween?: number
  onCreated: () => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [doubleRound, setDoubleRound] = useState(false)
  const [startDate, setStartDate] = useState(defaultStartDate ?? '')
  const [daysBetween, setDaysBetween] = useState(defaultDaysBetween ?? 7)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) return null

  const requiredCount = mode === 'knockout' ? bracketSize : null
  const orderedSelection = selected
    .map((id) => participatingTeams.find((t) => t.id === id))
    .filter((t): t is Team => Boolean(t))

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (mode === 'knockout' && requiredCount && prev.length >= requiredCount) return prev
      return [...prev, id]
    })
  }

  function move(idx: number, dir: -1 | 1) {
    setSelected((prev) => {
      const next = [...prev]
      const target = idx + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  function submit() {
    setError(null)

    if (selected.length < 2) {
      setError('Necesitás al menos 2 equipos.')
      return
    }
    if (mode === 'knockout') {
      if (requiredCount && selected.length !== requiredCount) {
        setError(`Tenés que elegir exactamente ${requiredCount} equipos.`)
        return
      }
      // Need power of 2.
      const n = selected.length
      if ((n & (n - 1)) !== 0) {
        setError('La cantidad de equipos debe ser potencia de 2 (2, 4, 8, 16…).')
        return
      }
    }
    if (!startDate) {
      setError('Elegí la fecha del primer partido.')
      return
    }

    const isoDate = new Date(`${startDate}T12:00:00`).toISOString()

    startTransition(async () => {
      const res =
        mode === 'round_robin'
          ? await generateRoundRobin(
              stageId,
              selected,
              doubleRound,
              isoDate,
              daysBetween,
              seasonId,
              slug,
            )
          : await generateKnockoutBracket(
              stageId,
              selected,
              isoDate,
              daysBetween,
              seasonId,
              slug,
            )

      if ('ok' in res) {
        onCreated()
        onClose()
      } else if ('error' in res) {
        setError(res.error)
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3">
      <div className="bg-card w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg">
              {mode === 'round_robin' ? 'Generar todos contra todos' : 'Generar llave'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              {mode === 'round_robin'
                ? 'Cada equipo va a jugar contra todos los demás. ' +
                  (doubleRound ? 'Se duplica con partidos de revancha.' : 'Un partido por par.')
                : `Pares por seeding: 1°↔último, 2°↔anteúltimo… Reordená la lista para definir el seeding.${
                    requiredCount ? ` Necesitás ${requiredCount} equipos.` : ''
                  }`}
            </p>
            <p className="text-xs text-muted-foreground">
              {mode === 'round_robin' && selected.length >= 2 && (
                <>
                  Se crearán{' '}
                  <span className="font-medium text-foreground">
                    {(selected.length * (selected.length - 1)) / 2 * (doubleRound ? 2 : 1)}
                  </span>{' '}
                  partidos.
                </>
              )}
              {mode === 'knockout' && selected.length >= 2 && (
                <>
                  Se crearán{' '}
                  <span className="font-medium text-foreground">
                    {Math.floor(selected.length / 2)}
                  </span>{' '}
                  partidos.
                </>
              )}
            </p>
          </div>

          {/* Available teams */}
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Disponibles
            </p>
            <div className="space-y-1.5">
              {participatingTeams
                .filter((t) => !selected.includes(t.id))
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggle(t.id)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-background border border-border/40 text-left"
                  >
                    <Square className="h-4 w-4 text-muted-foreground" />
                    <TeamMini team={t} />
                    <span className="ml-auto text-xs text-muted-foreground">Agregar</span>
                  </button>
                ))}
            </div>
          </div>

          {/* Selected (ordered for knockout) */}
          {selected.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-2">
                Seleccionados ({selected.length}
                {requiredCount ? ` / ${requiredCount}` : ''})
              </p>
              <div className="space-y-1.5">
                {orderedSelection.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-accent/5 border border-accent/30"
                  >
                    <CheckSquare className="h-4 w-4 text-accent" />
                    {mode === 'knockout' && (
                      <span className="text-[10px] text-muted-foreground w-5 text-center">
                        {i + 1}°
                      </span>
                    )}
                    <TeamMini team={t} />
                    <div className="ml-auto flex items-center gap-1">
                      {mode === 'knockout' && (
                        <>
                          <button
                            onClick={() => move(i, -1)}
                            disabled={i === 0}
                            className="text-xs text-muted-foreground disabled:opacity-30 px-1"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => move(i, 1)}
                            disabled={i === orderedSelection.length - 1}
                            className="text-xs text-muted-foreground disabled:opacity-30 px-1"
                          >
                            ↓
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggle(t.id)}
                        className="text-xs text-destructive px-1"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-text block mb-1">Primer partido</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="label-text block mb-1">Días entre partidos</label>
              <input
                type="number"
                min="1"
                max="30"
                value={daysBetween}
                onChange={(e) => setDaysBetween(Number(e.target.value || 7))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {mode === 'round_robin' && (
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={doubleRound}
                onChange={(e) => setDoubleRound(e.target.checked)}
                className="h-4 w-4"
              />
              Ida y vuelta (doble fecha)
            </label>
          )}

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="border-t border-border/40 p-3">
          <button
            onClick={submit}
            disabled={pending || selected.length < 2}
            className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {pending ? 'Generando…' : 'Generar partidos'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TeamMini({ team }: { team: Team }) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      {team.logo_url ? (
        <Image
          src={team.logo_url}
          alt={team.name}
          width={20}
          height={20}
          className="rounded shrink-0 object-cover"
        />
      ) : (
        <div
          className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-display shrink-0"
          style={{ backgroundColor: team.primary_color || '#D7FF00', color: team.secondary_color || '#000' }}
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-sm truncate">{team.name}</span>
    </div>
  )
}
