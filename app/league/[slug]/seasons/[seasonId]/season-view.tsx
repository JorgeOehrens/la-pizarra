'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ChevronDown, ChevronUp, Pencil, Plus, Sparkles, Star, Swords, Trash2, Trophy,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { createStage, deleteStage, createFixture, updateFixtureScore } from './actions'
import { RulesPanel, type SeasonRules } from './rules-form'
import { AutoGenSheet } from './auto-gen-sheet'
import { EditFixtureSheet, type EditableFixture } from './edit-fixture-sheet'
import { FullTournamentSheet } from './full-tournament-sheet'

export type Team = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

export type Fixture = {
  id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed'
  goals_for: number | null
  goals_against: number | null
  venue_custom: string | null
  bracket_position: number | null
  stage_id: string | null
  home: Team | null
  away: Team | null
}

export type Stage = {
  id: string
  name: string
  kind: 'regular' | 'group' | 'knockout'
  sort_order: number
  bracket_size: number | null
  fixtures: Fixture[]
}

const STAGE_KIND_LABEL: Record<string, string> = {
  regular: 'Fase regular',
  group: 'Fase de grupos',
  knockout: 'Eliminatoria',
}

export function SeasonView({
  leagueId,
  slug,
  seasonId,
  seasonName,
  isCurrent,
  isAdmin,
  participatingTeams,
  stages: initialStages,
  unstaged: initialUnstaged,
  rules: initialRules,
}: {
  leagueId: string
  slug: string
  seasonId: string
  seasonName: string
  isCurrent: boolean
  isAdmin: boolean
  participatingTeams: Team[]
  stages: Stage[]
  unstaged: Fixture[]
  rules: SeasonRules | null
}) {
  const router = useRouter()
  const [stages, setStages] = useState(initialStages)
  const [unstaged, setUnstaged] = useState(initialUnstaged)
  const [showStageForm, setShowStageForm] = useState(false)
  const [showFixtureForm, setShowFixtureForm] = useState<string | null>(null) // stageId or 'unstaged' or null
  const [autoGenStage, setAutoGenStage] = useState<{
    stageId: string
    mode: 'round_robin' | 'knockout'
    bracketSize: number | null
  } | null>(null)
  const [editing, setEditing] = useState<EditableFixture | null>(null)
  const [showFullTournament, setShowFullTournament] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  function pushFixture(stageId: string | null, fixture: Fixture) {
    if (stageId) {
      setStages((prev) =>
        prev.map((s) =>
          s.id === stageId ? { ...s, fixtures: [...s.fixtures, fixture] } : s,
        ),
      )
    } else {
      setUnstaged((prev) => [...prev, fixture])
    }
  }

  function updateFixtureLocal(matchId: string, patch: Partial<Fixture>) {
    setStages((prev) =>
      prev.map((s) => ({
        ...s,
        fixtures: s.fixtures.map((f) => (f.id === matchId ? { ...f, ...patch } : f)),
      })),
    )
    setUnstaged((prev) => prev.map((f) => (f.id === matchId ? { ...f, ...patch } : f)))
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-2">
        {isCurrent && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-accent/15 text-accent px-2 py-0.5 rounded">
            <Star className="h-3 w-3 fill-current" /> Temporada actual
          </span>
        )}
      </div>

      {error && <p className="text-sm text-red-500 bg-red-500/10 rounded-lg px-4 py-3">{error}</p>}

      <RulesPanel
        seasonId={seasonId}
        slug={slug}
        initial={initialRules}
        isAdmin={isAdmin}
      />

      {isAdmin && participatingTeams.length >= 2 && (
        <button
          onClick={() => setShowFullTournament(true)}
          className="w-full inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground py-3 rounded-xl uppercase tracking-wider text-sm font-medium"
        >
          <Trophy className="h-4 w-4" />
          Generar torneo completo (eliminatoria)
        </button>
      )}

      {participatingTeams.length < 2 && (
        <div className="bg-card border border-dashed border-border/60 rounded-xl p-4">
          <p className="text-sm text-muted-foreground">
            Necesitás al menos 2 equipos participando en la liga para crear partidos.
            <Link href={`/league/${slug}/teams/invite`} className="text-accent ml-1 hover:underline">
              Invitar equipos →
            </Link>
          </p>
        </div>
      )}

      {/* Stages list */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">Fases</h2>
          {isAdmin && (
            <button
              onClick={() => setShowStageForm((v) => !v)}
              className="inline-flex items-center gap-1.5 text-xs text-accent uppercase tracking-wider hover:opacity-80"
            >
              <Plus className="h-3.5 w-3.5" />
              {showStageForm ? 'Cancelar' : 'Nueva fase'}
            </button>
          )}
        </div>

        {isAdmin && showStageForm && (
          <NewStageForm
            seasonId={seasonId}
            slug={slug}
            nextOrder={stages.length}
            onCreated={(stage) => {
              setStages((prev) => [...prev, stage])
              setShowStageForm(false)
            }}
            onError={setError}
          />
        )}

        {stages.length === 0 && !showStageForm && (
          <div className="bg-card rounded-xl p-5 text-center border border-border/40">
            <Trophy className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Sin fases creadas. {isAdmin ? 'Creá una para empezar a armar el calendario.' : 'El admin todavía no creó fases.'}
            </p>
          </div>
        )}

        {stages.map((stage) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isAdmin={isAdmin}
            participatingTeams={participatingTeams}
            leagueId={leagueId}
            slug={slug}
            seasonId={seasonId}
            showFixtureFormForId={showFixtureForm}
            setShowFixtureFormForId={setShowFixtureForm}
            onFixtureCreated={(f) => pushFixture(stage.id, f)}
            onFixtureUpdated={(matchId, patch) => updateFixtureLocal(matchId, patch)}
            onFixtureEdit={(f) => setEditing(toEditable(f))}
            onError={setError}
            onAutoGen={() =>
              setAutoGenStage({
                stageId: stage.id,
                mode: stage.kind === 'knockout' ? 'knockout' : 'round_robin',
                bracketSize: stage.bracket_size,
              })
            }
            onDelete={() => {
              if (!confirm(`¿Borrar la fase "${stage.name}"? Solo si no tiene partidos.`)) return
              setError(null)
              startTransition(async () => {
                const res = await deleteStage(stage.id, seasonId, slug)
                if ('ok' in res) {
                  setStages((prev) => prev.filter((s) => s.id !== stage.id))
                } else {
                  setError(res.error === 'stage_has_matches'
                    ? 'No se puede borrar: la fase tiene partidos.'
                    : res.error)
                }
              })
            }}
          />
        ))}
      </section>

      {/* Unstaged fixtures (matches without a stage) */}
      {(unstaged.length > 0 || isAdmin) && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Partidos sin fase</h2>
            {isAdmin && participatingTeams.length >= 2 && (
              <button
                onClick={() => setShowFixtureForm(showFixtureForm === '__unstaged' ? null : '__unstaged')}
                className="inline-flex items-center gap-1.5 text-xs text-accent uppercase tracking-wider hover:opacity-80"
              >
                <Plus className="h-3.5 w-3.5" />
                {showFixtureForm === '__unstaged' ? 'Cancelar' : 'Agregar partido'}
              </button>
            )}
          </div>

          {isAdmin && showFixtureForm === '__unstaged' && (
            <NewFixtureForm
              leagueId={leagueId}
              slug={slug}
              seasonId={seasonId}
              stageId={null}
              participatingTeams={participatingTeams}
              onCreated={(f) => {
                setUnstaged((prev) => [...prev, f])
                setShowFixtureForm(null)
              }}
              onError={setError}
            />
          )}

          {unstaged.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin partidos sueltos.</p>
          ) : (
            <div className="space-y-2">
              {unstaged.map((f) => (
                <FixtureRow
                  key={f.id}
                  fixture={f}
                  isAdmin={isAdmin}
                  onScoreSaved={(homeGoals, awayGoals) =>
                    updateFixtureLocal(f.id, {
                      goals_for: homeGoals,
                      goals_against: awayGoals,
                      status: 'finished',
                    })
                  }
                  onEdit={() => setEditing(toEditable(f))}
                  seasonId={seasonId}
                  slug={slug}
                  onError={setError}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {autoGenStage && (
        <AutoGenSheet
          open={true}
          onClose={() => setAutoGenStage(null)}
          mode={autoGenStage.mode}
          stageId={autoGenStage.stageId}
          bracketSize={autoGenStage.bracketSize}
          participatingTeams={participatingTeams}
          seasonId={seasonId}
          slug={slug}
          onCreated={() => {
            // Refresh server data so the new fixtures show up.
            router.refresh()
          }}
        />
      )}

      <EditFixtureSheet
        open={editing !== null}
        onClose={() => setEditing(null)}
        fixture={editing}
        participatingTeams={participatingTeams}
        stages={stages.map((s) => ({ id: s.id, name: s.name, kind: s.kind }))}
        seasonId={seasonId}
        slug={slug}
        onSaved={() => {
          router.refresh()
        }}
        onDeleted={() => {
          router.refresh()
        }}
      />

      <FullTournamentSheet
        open={showFullTournament}
        onClose={() => setShowFullTournament(false)}
        seasonId={seasonId}
        slug={slug}
        participatingTeams={participatingTeams}
        onCreated={() => router.refresh()}
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage card with collapsible fixtures + add-fixture form
// ─────────────────────────────────────────────────────────────────────────────

function StageCard({
  stage,
  isAdmin,
  participatingTeams,
  leagueId,
  slug,
  seasonId,
  showFixtureFormForId,
  setShowFixtureFormForId,
  onFixtureCreated,
  onFixtureUpdated,
  onFixtureEdit,
  onError,
  onDelete,
  onAutoGen,
}: {
  stage: Stage
  isAdmin: boolean
  participatingTeams: Team[]
  leagueId: string
  slug: string
  seasonId: string
  showFixtureFormForId: string | null
  setShowFixtureFormForId: (id: string | null) => void
  onFixtureCreated: (fixture: Fixture) => void
  onFixtureUpdated: (matchId: string, patch: Partial<Fixture>) => void
  onFixtureEdit: (fixture: Fixture) => void
  onError: (msg: string | null) => void
  onDelete: () => void
  onAutoGen: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b border-border/40">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex-1 min-w-0 flex items-center gap-3 text-left"
        >
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            {stage.kind === 'knockout' ? (
              <Swords className="h-4 w-4 text-accent" />
            ) : (
              <Trophy className="h-4 w-4 text-accent" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{stage.name}</p>
            <p className="text-xs text-muted-foreground">
              {STAGE_KIND_LABEL[stage.kind]} · {stage.fixtures.length} partido{stage.fixtures.length === 1 ? '' : 's'}
              {stage.bracket_size ? ` · ${stage.bracket_size} equipos` : ''}
            </p>
          </div>
          {collapsed ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronUp className="h-4 w-4 text-muted-foreground" />}
        </button>
        {isAdmin && (
          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors shrink-0"
            title="Borrar fase"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          {stage.fixtures.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-2">Sin partidos en esta fase.</p>
          ) : (
            <div className="space-y-2">
              {stage.fixtures.map((f) => (
                <FixtureRow
                  key={f.id}
                  fixture={f}
                  isAdmin={isAdmin}
                  onScoreSaved={(homeGoals, awayGoals) =>
                    onFixtureUpdated(f.id, {
                      goals_for: homeGoals,
                      goals_against: awayGoals,
                      status: 'finished',
                    })
                  }
                  onEdit={() => onFixtureEdit(f)}
                  seasonId={seasonId}
                  slug={slug}
                  onError={onError}
                />
              ))}
            </div>
          )}

          {isAdmin && participatingTeams.length >= 2 && (
            <>
              {showFixtureFormForId === stage.id ? (
                <NewFixtureForm
                  leagueId={leagueId}
                  slug={slug}
                  seasonId={seasonId}
                  stageId={stage.id}
                  participatingTeams={participatingTeams}
                  onCreated={(f) => {
                    onFixtureCreated(f)
                    setShowFixtureFormForId(null)
                  }}
                  onError={onError}
                />
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setShowFixtureFormForId(stage.id)}
                    className="inline-flex items-center justify-center gap-1.5 bg-accent/10 text-accent py-2.5 rounded-lg uppercase tracking-wider text-xs hover:bg-accent/20"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Agregar
                  </button>
                  <button
                    onClick={onAutoGen}
                    className="inline-flex items-center justify-center gap-1.5 bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-xs"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Auto-generar
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// New stage form
// ─────────────────────────────────────────────────────────────────────────────

function NewStageForm({
  seasonId,
  slug,
  nextOrder,
  onCreated,
  onError,
}: {
  seasonId: string
  slug: string
  nextOrder: number
  onCreated: (stage: Stage) => void
  onError: (msg: string | null) => void
}) {
  const [name, setName] = useState('')
  const [kind, setKind] = useState<'regular' | 'group' | 'knockout'>('regular')
  const [bracketSize, setBracketSize] = useState<number | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    onError(null)
    if (!name.trim()) {
      onError('El nombre es obligatorio')
      return
    }
    startTransition(async () => {
      const res = await createStage(seasonId, slug, {
        name: name.trim(),
        kind,
        sort_order: nextOrder,
        bracket_size: bracketSize,
      })
      if ('ok' in res && res.data) {
        onCreated({
          id: res.data.stage_id,
          name: name.trim(),
          kind,
          sort_order: nextOrder,
          bracket_size: bracketSize,
          fixtures: [],
        })
      } else if ('error' in res) {
        onError(res.error)
      }
    })
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-accent/40 space-y-3">
      <div>
        <label className="label-text block mb-1">Nombre</label>
        <input
          type="text"
          placeholder="Ej: Fase regular, Cuartos, Semifinal…"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <div>
        <label className="label-text block mb-1">Tipo</label>
        <div className="grid grid-cols-3 gap-2">
          {(['regular', 'group', 'knockout'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                'p-2 rounded-lg border text-xs uppercase tracking-wider transition-all',
                kind === k ? 'bg-accent/10 border-accent/40 text-accent' : 'bg-background border-border/40 text-muted-foreground',
              )}
            >
              {STAGE_KIND_LABEL[k]}
            </button>
          ))}
        </div>
      </div>
      {kind === 'knockout' && (
        <div>
          <label className="label-text block mb-1">Equipos en la llave</label>
          <select
            value={bracketSize ?? ''}
            onChange={(e) => setBracketSize(e.target.value ? Number(e.target.value) : null)}
            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="">Sin definir</option>
            <option value="2">2 (Final)</option>
            <option value="4">4 (Semifinal)</option>
            <option value="8">8 (Cuartos)</option>
            <option value="16">16 (Octavos)</option>
          </select>
        </div>
      )}
      <button
        onClick={submit}
        disabled={pending || !name.trim()}
        className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50"
      >
        {pending ? 'Creando…' : 'Crear fase'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// New fixture form
// ─────────────────────────────────────────────────────────────────────────────

function NewFixtureForm({
  leagueId,
  slug,
  seasonId,
  stageId,
  participatingTeams,
  onCreated,
  onError,
}: {
  leagueId: string
  slug: string
  seasonId: string
  stageId: string | null
  participatingTeams: Team[]
  onCreated: (fixture: Fixture) => void
  onError: (msg: string | null) => void
}) {
  const [home, setHome] = useState('')
  const [away, setAway] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [venue, setVenue] = useState('')
  const [pending, startTransition] = useTransition()

  function submit() {
    onError(null)
    if (!home || !away) return onError('Elegí los dos equipos')
    if (home === away) return onError('Local y visitante deben ser diferentes')
    if (!date) return onError('Elegí la fecha del partido')

    const matchDate = new Date(`${date}T${time || '12:00'}:00`).toISOString()

    startTransition(async () => {
      const res = await createFixture(leagueId, seasonId, slug, {
        stage_id: stageId,
        home_team_id: home,
        away_team_id: away,
        match_date: matchDate,
        venue_custom: venue.trim() || null,
        bracket_position: null,
      })
      if ('ok' in res && res.data) {
        const homeTeam = participatingTeams.find((t) => t.id === home) ?? null
        const awayTeam = participatingTeams.find((t) => t.id === away) ?? null
        onCreated({
          id: res.data.match_id,
          match_date: matchDate,
          status: new Date(matchDate) <= new Date() ? 'finished' : 'scheduled',
          goals_for: null,
          goals_against: null,
          venue_custom: venue.trim() || null,
          bracket_position: null,
          stage_id: stageId,
          home: homeTeam,
          away: awayTeam,
        })
      } else if ('error' in res) {
        onError(res.error)
      }
    })
  }

  return (
    <div className="bg-card rounded-xl p-4 border border-accent/40 space-y-3">
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
      <div>
        <label className="label-text block mb-1">Cancha (opcional)</label>
        <input
          type="text"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="Ej: Cancha 1"
          maxLength={80}
          className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>
      <button
        onClick={submit}
        disabled={pending}
        className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg uppercase tracking-wider text-sm disabled:opacity-50"
      >
        {pending ? 'Creando…' : 'Crear partido'}
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Fixture row with inline score editor
// ─────────────────────────────────────────────────────────────────────────────

function FixtureRow({
  fixture,
  isAdmin,
  onScoreSaved,
  onEdit,
  seasonId,
  slug,
  onError,
}: {
  fixture: Fixture
  isAdmin: boolean
  onScoreSaved: (home: number, away: number) => void
  onEdit: () => void
  seasonId: string
  slug: string
  onError: (msg: string | null) => void
}) {
  const [editingScore, setEditingScore] = useState(false)
  const [homeGoals, setHomeGoals] = useState<number | ''>(fixture.goals_for ?? '')
  const [awayGoals, setAwayGoals] = useState<number | ''>(fixture.goals_against ?? '')
  const [pending, startTransition] = useTransition()

  const matchDate = format(new Date(fixture.match_date), 'd MMM · HH:mm', { locale: es })
  const isFinished = fixture.status === 'finished'

  function saveScore() {
    if (homeGoals === '' || awayGoals === '') return onError('Cargá ambos goles')
    onError(null)
    startTransition(async () => {
      const res = await updateFixtureScore(
        fixture.id,
        Number(homeGoals),
        Number(awayGoals),
        true,
        seasonId,
        slug,
      )
      if ('ok' in res) {
        onScoreSaved(Number(homeGoals), Number(awayGoals))
        setEditingScore(false)
      } else if ('error' in res) {
        onError(res.error)
      }
    })
  }

  return (
    <div className="bg-background rounded-lg p-3 border border-border/30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          {matchDate}
        </span>
        {fixture.venue_custom && (
          <span className="text-[10px] text-muted-foreground">{fixture.venue_custom}</span>
        )}
      </div>

      <Link
        href={`/matches/${fixture.id}`}
        className="flex items-center gap-2"
      >
        <TeamPill team={fixture.home} align="right" />
        <div className="flex items-center gap-1 shrink-0 px-2">
          {isFinished && fixture.goals_for != null && fixture.goals_against != null ? (
            <span className="font-display text-base tabular-nums">
              {fixture.goals_for} – {fixture.goals_against}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">vs</span>
          )}
        </div>
        <TeamPill team={fixture.away} align="left" />
      </Link>

      {isAdmin && (
        <div className="mt-2 pt-2 border-t border-border/30">
          {editingScore ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={homeGoals}
                onChange={(e) => setHomeGoals(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-14 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <span className="text-xs text-muted-foreground">–</span>
              <input
                type="number"
                min="0"
                value={awayGoals}
                onChange={(e) => setAwayGoals(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-14 bg-background border border-border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                onClick={saveScore}
                disabled={pending}
                className="ml-auto bg-accent text-accent-foreground px-3 py-1 rounded text-[10px] uppercase tracking-wider disabled:opacity-50"
              >
                {pending ? '…' : 'Guardar'}
              </button>
              <button
                onClick={() => setEditingScore(false)}
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setEditingScore(true)}
                className="text-[10px] uppercase tracking-wider text-accent hover:opacity-80"
              >
                {isFinished ? 'Editar resultado' : 'Cargar resultado'}
              </button>
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
                title="Editar partido"
              >
                <Pencil className="h-3 w-3" />
                Editar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function toEditable(f: Fixture): EditableFixture {
  return {
    id: f.id,
    match_date: f.match_date,
    venue_custom: f.venue_custom,
    status: f.status,
    stage_id: f.stage_id,
    home: f.home,
    away: f.away,
  }
}

function TeamPill({ team, align }: { team: Team | null; align: 'left' | 'right' }) {
  if (!team) {
    return (
      <div className={cn('flex-1 flex items-center gap-2 min-w-0', align === 'right' && 'justify-end')}>
        <span className="text-sm text-muted-foreground">—</span>
      </div>
    )
  }
  return (
    <div className={cn('flex-1 flex items-center gap-2 min-w-0', align === 'right' && 'justify-end')}>
      {align === 'right' && <span className="text-sm font-medium truncate">{team.name}</span>}
      {team.logo_url ? (
        <Image src={team.logo_url} alt={team.name} width={24} height={24} className="rounded shrink-0 object-cover" />
      ) : (
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-display shrink-0"
          style={{ backgroundColor: team.primary_color || '#D7FF00', color: team.secondary_color || '#000' }}
        >
          {team.name.charAt(0).toUpperCase()}
        </div>
      )}
      {align === 'left' && <span className="text-sm font-medium truncate">{team.name}</span>}
    </div>
  )
}

