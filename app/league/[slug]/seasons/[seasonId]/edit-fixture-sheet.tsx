'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Calendar, MapPin, Pencil, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { updateFixture, deleteFixture } from './actions'

type Team = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

export type EditableFixture = {
  id: string
  match_date: string
  venue_custom: string | null
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed'
  stage_id: string | null
  home: Team | null
  away: Team | null
}

type Stage = {
  id: string
  name: string
  kind: 'regular' | 'group' | 'knockout'
}

const STATUS_LABEL: Record<EditableFixture['status'], string> = {
  scheduled: 'Programado',
  in_progress: 'En curso',
  finished: 'Finalizado',
  cancelled: 'Cancelado',
  postponed: 'Postergado',
}

/**
 * Public wrapper. Renders the inner sheet only when there is an active
 * `fixture` AND uses `key={fixture.id}` so React mounts fresh state every
 * time we switch to a different fixture. This avoids the "setState during
 * render" pattern we used to need to sync props → state.
 */
export function EditFixtureSheet({
  open,
  onClose,
  fixture,
  participatingTeams,
  stages,
  seasonId,
  slug,
  onSaved,
  onDeleted,
}: {
  open: boolean
  onClose: () => void
  fixture: EditableFixture | null
  participatingTeams: Team[]
  stages: Stage[]
  seasonId: string
  slug: string
  onSaved: (matchId: string, patch: Partial<EditableFixture>) => void
  onDeleted: (matchId: string) => void
}) {
  if (!open || !fixture) return null
  return (
    <EditFixtureSheetInner
      key={fixture.id}
      fixture={fixture}
      onClose={onClose}
      participatingTeams={participatingTeams}
      stages={stages}
      seasonId={seasonId}
      slug={slug}
      onSaved={onSaved}
      onDeleted={onDeleted}
    />
  )
}

function EditFixtureSheetInner({
  fixture,
  onClose,
  participatingTeams,
  stages,
  seasonId,
  slug,
  onSaved,
  onDeleted,
}: {
  fixture: EditableFixture
  onClose: () => void
  participatingTeams: Team[]
  stages: Stage[]
  seasonId: string
  slug: string
  onSaved: (matchId: string, patch: Partial<EditableFixture>) => void
  onDeleted: (matchId: string) => void
}) {
  // Initial values are derived once from the fixture; lazy initializers are
  // safe to call here because the component re-mounts when fixture.id changes.
  const initialDt = new Date(fixture.match_date)
  const [home, setHome] = useState<string>(fixture.home?.id ?? '')
  const [away, setAway] = useState<string>(fixture.away?.id ?? '')
  const [date, setDate] = useState(() => initialDt.toISOString().slice(0, 10))
  const [time, setTime] = useState(() => initialDt.toTimeString().slice(0, 5))
  const [venue, setVenue] = useState(fixture.venue_custom ?? '')
  const [stageId, setStageId] = useState<string>(fixture.stage_id ?? '')
  const [status, setStatus] = useState<EditableFixture['status']>(fixture.status)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    if (!home || !away) return setError('Elegí los dos equipos')
    if (home === away) return setError('Local y visitante deben ser diferentes')
    if (!date) return setError('Cargá la fecha')

    const matchDate = new Date(`${date}T${time || '12:00'}:00`).toISOString()
    const desiredStage = stageId || null
    const clearStage = !desiredStage && fixture.stage_id !== null

    startTransition(async () => {
      const res = await updateFixture(fixture.id, seasonId, slug, {
        home_team_id: home,
        away_team_id: away,
        match_date: matchDate,
        venue_custom: venue.trim() || null,
        stage_id: desiredStage,
        clear_stage: clearStage,
        status,
      })

      if ('ok' in res) {
        const homeTeam = participatingTeams.find((t) => t.id === home) ?? null
        const awayTeam = participatingTeams.find((t) => t.id === away) ?? null
        onSaved(fixture.id, {
          match_date: matchDate,
          venue_custom: venue.trim() || null,
          stage_id: desiredStage,
          status,
          home: homeTeam,
          away: awayTeam,
        })
        onClose()
      } else if ('error' in res) {
        setError(translateError(res.error))
      }
    })
  }

  function remove() {
    if (!confirm('¿Borrar el partido? Esto no se puede deshacer.')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteFixture(fixture.id, seasonId, slug)
      if ('ok' in res) {
        onDeleted(fixture.id)
        onClose()
      } else if ('error' in res) {
        setError(translateError(res.error))
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-3">
      <div className="bg-card w-full max-w-md rounded-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-accent" />
            <h2 className="font-display text-lg">Editar partido</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 space-y-4">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-text block mb-1">Local</label>
              <select
                value={home}
                onChange={(e) => setHome(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Equipo…</option>
                {participatingTeams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === away}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text block mb-1">Visitante</label>
              <select
                value={away}
                onChange={(e) => setAway(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option value="">Equipo…</option>
                {participatingTeams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === home}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {(home || away) && (
            <div className="bg-background rounded-lg p-3 border border-border/30 flex items-center gap-2">
              <TeamMini team={participatingTeams.find((t) => t.id === home) ?? null} align="right" />
              <span className="text-xs uppercase tracking-widest text-muted-foreground">vs</span>
              <TeamMini team={participatingTeams.find((t) => t.id === away) ?? null} align="left" />
            </div>
          )}

          {/* Date + time */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label-text block mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="label-text block mb-1">Hora</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="label-text block mb-1">Cancha</label>
            <div className="relative">
              <MapPin className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ej: Cancha 1"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                maxLength={80}
                className="w-full pl-9 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="label-text block mb-1">Fase</label>
            <select
              value={stageId}
              onChange={(e) => setStageId(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Sin fase</option>
              {stages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="label-text block mb-2">Estado</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(Object.keys(STATUS_LABEL) as EditableFixture['status'][]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={cn(
                    'p-1.5 rounded-lg border text-[10px] uppercase tracking-wider',
                    status === s
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-background border-border/40 text-muted-foreground',
                  )}
                >
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>

        <div className="border-t border-border/40 p-3 flex gap-2">
          <button
            onClick={remove}
            disabled={pending}
            className="inline-flex items-center justify-center gap-1.5 bg-destructive/10 text-destructive px-3 py-2.5 rounded-lg uppercase tracking-wider text-xs disabled:opacity-50"
            title="Borrar partido"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Borrar
          </button>
          <button
            onClick={save}
            disabled={pending}
            className="flex-1 bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50"
          >
            <Calendar className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}

function TeamMini({ team, align }: { team: Team | null; align: 'left' | 'right' }) {
  if (!team) {
    return <div className={`flex-1 text-xs text-muted-foreground ${align === 'right' ? 'text-right' : ''}`}>—</div>
  }
  return (
    <div className={`flex-1 flex items-center gap-2 min-w-0 ${align === 'right' ? 'justify-end' : ''}`}>
      {align === 'right' && <span className="text-sm font-medium truncate">{team.name}</span>}
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
      {align === 'left' && <span className="text-sm font-medium truncate">{team.name}</span>}
    </div>
  )
}

function translateError(code: string): string {
  switch (code) {
    case 'forbidden': return 'No tenés permiso para editar este partido.'
    case 'home_team_not_in_league': return 'El equipo local no participa en la liga.'
    case 'away_team_not_in_league': return 'El equipo visitante no participa en la liga.'
    case 'home_and_away_must_differ': return 'Local y visitante deben ser equipos distintos.'
    case 'stage_mismatch': return 'La fase elegida no pertenece a esta temporada.'
    case 'match_not_found': return 'No se encontró el partido.'
    default: return code
  }
}
