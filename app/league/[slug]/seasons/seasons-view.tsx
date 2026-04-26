'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calendar, CheckCircle2, ChevronRight, Plus, Star, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createSeason, setCurrentSeason, deleteSeason } from './actions'

type Season = {
  id: string
  name: string
  starts_on: string | null
  ends_on: string | null
  is_current: boolean
  created_at: string
}

function formatDate(d: string | null): string | null {
  if (!d) return null
  try {
    return format(new Date(d), "d MMM yyyy", { locale: es })
  } catch {
    return d
  }
}

export function SeasonsView({
  leagueId,
  slug,
  seasons: initialSeasons,
  isAdmin,
}: {
  leagueId: string
  slug: string
  seasons: Season[]
  isAdmin: boolean
}) {
  const [seasons, setSeasons] = useState(initialSeasons)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()
  const pathname = usePathname()
  const basePath = pathname.replace(/\/$/, '')

  const sorted = [...seasons].sort((a, b) => {
    if (a.is_current !== b.is_current) return a.is_current ? -1 : 1
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>
      )}

      {isAdmin && (
        <button
          onClick={() => setShowForm((v) => !v)}
          className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-lg uppercase tracking-wider text-sm"
        >
          <Plus className="h-4 w-4" />
          {showForm ? 'Cancelar' : 'Nueva temporada'}
        </button>
      )}

      {isAdmin && showForm && (
        <NewSeasonForm
          leagueId={leagueId}
          slug={slug}
          onCreated={(s) => {
            setSeasons((prev) => {
              const next = s.is_current ? prev.map((p) => ({ ...p, is_current: false })) : prev
              return [...next, s]
            })
            setShowForm(false)
          }}
          onError={setError}
        />
      )}

      {sorted.length === 0 ? (
        <div className="bg-card rounded-xl p-6 text-center border border-border/40">
          <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Aún no hay temporadas en esta liga.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((s) => {
            const start = formatDate(s.starts_on)
            const end = formatDate(s.ends_on)
            const range = [start, end].filter(Boolean).join(' → ') || 'Sin fechas'

            return (
              <div
                key={s.id}
                className={`bg-card rounded-xl border flex items-stretch ${
                  s.is_current ? 'border-accent/40' : 'border-border/40'
                }`}
              >
                <Link
                  href={`${basePath}/${s.id}`}
                  className="flex-1 min-w-0 flex items-center gap-3 p-4 hover:opacity-90"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      s.is_current ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s.is_current ? <Star className="h-5 w-5 fill-current" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{range}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
                {isAdmin && (
                  <div className="flex flex-col justify-center gap-1.5 pr-3 py-3 shrink-0">
                    {!s.is_current && (
                      <button
                        onClick={() => {
                          setError(null)
                          startTransition(async () => {
                            const res = await setCurrentSeason(s.id, slug)
                            if ('ok' in res) {
                              setSeasons((prev) =>
                                prev.map((p) => ({ ...p, is_current: p.id === s.id })),
                              )
                            } else {
                              setError(res.error)
                            }
                          })
                        }}
                        className="p-2 rounded-lg bg-accent/15 hover:bg-accent/25 text-accent transition-colors"
                        title="Marcar como actual"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (!confirm(`¿Borrar la temporada "${s.name}"? Solo se puede si no tiene partidos.`)) return
                        setError(null)
                        startTransition(async () => {
                          const res = await deleteSeason(s.id, slug)
                          if ('ok' in res) {
                            setSeasons((prev) => prev.filter((p) => p.id !== s.id))
                          } else {
                            setError(res.error === 'season_has_matches'
                              ? 'No se puede borrar: la temporada tiene partidos asociados.'
                              : res.error)
                          }
                        })
                      }}
                      className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors"
                      title="Borrar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function NewSeasonForm({
  leagueId,
  slug,
  onCreated,
  onError,
}: {
  leagueId: string
  slug: string
  onCreated: (season: Season) => void
  onError: (msg: string | null) => void
}) {
  const [name, setName] = useState('')
  const [startsOn, setStartsOn] = useState('')
  const [endsOn, setEndsOn] = useState('')
  const [isCurrent, setIsCurrent] = useState(true)
  const [pending, startTransition] = useTransition()

  function submit() {
    onError(null)
    if (!name.trim()) {
      onError('El nombre es obligatorio')
      return
    }
    startTransition(async () => {
      const res = await createSeason(leagueId, slug, {
        name: name.trim(),
        starts_on: startsOn || null,
        ends_on: endsOn || null,
        is_current: isCurrent,
      })
      if ('ok' in res && res.data) {
        onCreated({
          id: res.data.season_id,
          name: name.trim(),
          starts_on: startsOn || null,
          ends_on: endsOn || null,
          is_current: isCurrent,
          created_at: new Date().toISOString(),
        })
      } else if ('error' in res) {
        onError(res.error === 'invalid_date_range'
          ? 'La fecha de inicio no puede ser posterior a la fecha de fin.'
          : res.error)
      }
    })
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-accent/40 space-y-3">
      <div>
        <label className="label-text block mb-1">Nombre</label>
        <input
          type="text"
          placeholder="Ej: Apertura 2026"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label-text block mb-1">Inicio</label>
          <input
            type="date"
            value={startsOn}
            onChange={(e) => setStartsOn(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div>
          <label className="label-text block mb-1">Fin</label>
          <input
            type="date"
            value={endsOn}
            onChange={(e) => setEndsOn(e.target.value)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isCurrent}
          onChange={(e) => setIsCurrent(e.target.checked)}
          className="h-4 w-4"
        />
        Marcar como temporada actual
      </label>
      <button
        onClick={submit}
        disabled={pending || !name.trim()}
        className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50"
      >
        {pending ? 'Creando…' : 'Crear temporada'}
      </button>
    </div>
  )
}
