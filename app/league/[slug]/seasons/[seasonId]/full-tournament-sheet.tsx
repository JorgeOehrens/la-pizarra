'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { CheckSquare, Sparkles, Square, Trophy, X } from 'lucide-react'
import { generateFullKnockoutTournament } from './actions'

type Team = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

const VALID_SIZES = [2, 4, 8, 16, 32] as const
type ValidSize = (typeof VALID_SIZES)[number]

const SIZE_LABEL: Record<ValidSize, string> = {
  2: 'Solo final',
  4: 'Semifinales (4 equipos)',
  8: 'Cuartos (8 equipos)',
  16: 'Octavos (16 equipos)',
  32: '16avos (32 equipos)',
}

export function FullTournamentSheet({
  open,
  onClose,
  seasonId,
  slug,
  participatingTeams,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  seasonId: string
  slug: string
  participatingTeams: Team[]
  onCreated: () => void
}) {
  const [size, setSize] = useState<ValidSize>(8)
  const [selected, setSelected] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [daysBetween, setDaysBetween] = useState(7)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  if (!open) return null

  const orderedSelection = selected
    .map((id) => participatingTeams.find((t) => t.id === id))
    .filter((t): t is Team => Boolean(t))

  function toggle(id: string) {
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id)
      if (prev.length >= size) return prev
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
    if (selected.length !== size) {
      setError(`Tenés que elegir exactamente ${size} equipos.`)
      return
    }
    if (!startDate) {
      setError('Elegí la fecha del primer partido.')
      return
    }
    const isoDate = new Date(`${startDate}T12:00:00`).toISOString()

    startTransition(async () => {
      const res = await generateFullKnockoutTournament(seasonId, slug, {
        team_ids: selected,
        start_date: isoDate,
        days_between: daysBetween,
        starting_sort: 0,
      })
      if ('ok' in res) {
        onCreated()
        onClose()
        // Reset for next opening.
        setSelected([])
        setError(null)
      } else if ('error' in res) {
        setError(res.error)
      }
    })
  }

  const totalMatches = size > 1 ? size - 1 : 0

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3">
      <div className="bg-card w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg">Generar torneo completo</h2>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          <p className="text-xs text-muted-foreground">
            Crea todas las fases en una sola acción y las deja conectadas: cuando cargás el resultado de una fase,
            el ganador pasa solo a la siguiente.
          </p>

          {/* Size */}
          <div>
            <label className="label-text block mb-2">Cantidad de equipos</label>
            <div className="grid grid-cols-2 gap-2">
              {VALID_SIZES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s)
                    if (selected.length > s) setSelected(selected.slice(0, s))
                  }}
                  className={`p-2 rounded-lg border text-xs uppercase tracking-wider text-left ${
                    size === s
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-background border-border/40 text-muted-foreground'
                  }`}
                  disabled={s > participatingTeams.length}
                >
                  {SIZE_LABEL[s]}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Vas a generar <span className="text-foreground font-medium">{totalMatches}</span> partido{totalMatches === 1 ? '' : 's'}.
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

          {/* Selected (ordered seeds) */}
          {selected.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-widest text-accent mb-2">
                Seeding ({selected.length} / {size})
              </p>
              <p className="text-[10px] text-muted-foreground mb-2">
                El primero juega contra el último, el segundo contra el anteúltimo, etc.
              </p>
              <div className="space-y-1.5">
                {orderedSelection.map((t, i) => (
                  <div
                    key={t.id}
                    className="flex items-center gap-2 p-2 rounded-lg bg-accent/5 border border-accent/30"
                  >
                    <CheckSquare className="h-4 w-4 text-accent" />
                    <span className="text-[10px] text-muted-foreground w-5 text-center">
                      {i + 1}°
                    </span>
                    <TeamMini team={t} />
                    <div className="ml-auto flex items-center gap-1">
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
                max="60"
                value={daysBetween}
                onChange={(e) => setDaysBetween(Number(e.target.value || 7))}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="border-t border-border/40 p-3">
          <button
            onClick={submit}
            disabled={pending || selected.length !== size}
            className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            {pending ? 'Generando…' : 'Generar todas las fases'}
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
        <Image src={team.logo_url} alt={team.name} width={20} height={20} className="rounded shrink-0 object-cover" />
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
