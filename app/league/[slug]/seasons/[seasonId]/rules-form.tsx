'use client'

import { useState, useTransition } from 'react'
import { Settings, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { upsertSeasonRules } from './actions'

export type SeasonRules = {
  format: 'round_robin' | 'knockout' | 'groups_then_knockout' | 'custom'
  points_win: number
  points_draw: number
  points_loss: number
  leg_count: number
  default_kickoff: string | null
  notes: string | null
}

const FORMAT_LABEL: Record<SeasonRules['format'], string> = {
  round_robin: 'Todos contra todos',
  knockout: 'Eliminación directa',
  groups_then_knockout: 'Grupos + eliminatoria',
  custom: 'Personalizado',
}

const DEFAULT_RULES: SeasonRules = {
  format: 'round_robin',
  points_win: 3,
  points_draw: 1,
  points_loss: 0,
  leg_count: 1,
  default_kickoff: null,
  notes: null,
}

export function RulesPanel({
  seasonId,
  slug,
  initial,
  isAdmin,
}: {
  seasonId: string
  slug: string
  initial: SeasonRules | null
  isAdmin: boolean
}) {
  const [open, setOpen] = useState(false)
  const [rules, setRules] = useState<SeasonRules>(initial ?? DEFAULT_RULES)
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)
  const [pending, startTransition] = useTransition()

  function save() {
    setError(null)
    setSavedFlash(false)
    startTransition(async () => {
      const res = await upsertSeasonRules(seasonId, slug, rules)
      if ('ok' in res) {
        setSavedFlash(true)
        setTimeout(() => setSavedFlash(false), 1500)
      } else if ('error' in res) {
        setError(res.error)
      }
    })
  }

  return (
    <section className="bg-card rounded-xl border border-border/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
          <Settings className="h-4 w-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Reglas del torneo</p>
          <p className="text-xs text-muted-foreground">
            {FORMAT_LABEL[rules.format]} · {rules.points_win}/{rules.points_draw}/{rules.points_loss} pts · {rules.leg_count === 2 ? 'Ida y vuelta' : 'Único'}
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-accent">
          {open ? 'Cerrar' : 'Editar'}
        </span>
      </button>

      {open && (
        <div className="border-t border-border/40 p-4 space-y-4">
          <div>
            <label className="label-text block mb-2">Formato</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(FORMAT_LABEL) as SeasonRules['format'][]).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => isAdmin && setRules({ ...rules, format: f })}
                  disabled={!isAdmin}
                  className={cn(
                    'p-2 rounded-lg border text-xs uppercase tracking-wider text-left',
                    rules.format === f
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-background border-border/40 text-muted-foreground',
                    !isAdmin && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {FORMAT_LABEL[f]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text block mb-2">Puntos</label>
            <div className="grid grid-cols-3 gap-2">
              <PointsField
                label="Victoria"
                value={rules.points_win}
                onChange={(v) => isAdmin && setRules({ ...rules, points_win: v })}
                disabled={!isAdmin}
              />
              <PointsField
                label="Empate"
                value={rules.points_draw}
                onChange={(v) => isAdmin && setRules({ ...rules, points_draw: v })}
                disabled={!isAdmin}
              />
              <PointsField
                label="Derrota"
                value={rules.points_loss}
                onChange={(v) => isAdmin && setRules({ ...rules, points_loss: v })}
                disabled={!isAdmin}
              />
            </div>
          </div>

          <div>
            <label className="label-text block mb-2">Modalidad</label>
            <div className="grid grid-cols-2 gap-2">
              {[1, 2].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => isAdmin && setRules({ ...rules, leg_count: n })}
                  disabled={!isAdmin}
                  className={cn(
                    'p-2 rounded-lg border text-xs uppercase tracking-wider',
                    rules.leg_count === n
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : 'bg-background border-border/40 text-muted-foreground',
                    !isAdmin && 'opacity-60 cursor-not-allowed',
                  )}
                >
                  {n === 1 ? 'Partido único' : 'Ida y vuelta'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label-text block mb-1">Hora habitual de partido</label>
            <input
              type="time"
              value={rules.default_kickoff ?? ''}
              onChange={(e) =>
                isAdmin && setRules({ ...rules, default_kickoff: e.target.value || null })
              }
              disabled={!isAdmin}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
            />
          </div>

          <div>
            <label className="label-text block mb-1">Notas</label>
            <textarea
              value={rules.notes ?? ''}
              onChange={(e) =>
                isAdmin && setRules({ ...rules, notes: e.target.value || null })
              }
              disabled={!isAdmin}
              rows={2}
              maxLength={240}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent resize-none disabled:opacity-60"
              placeholder="Reglas extra: tarjetas, suspensiones, cancha…"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}
          {savedFlash && (
            <p className="text-xs text-accent bg-accent/10 rounded-lg px-3 py-2">Guardado.</p>
          )}

          {isAdmin && (
            <button
              onClick={save}
              disabled={pending}
              className="w-full bg-accent text-accent-foreground py-2 rounded-lg uppercase tracking-wider text-xs disabled:opacity-50 inline-flex items-center justify-center gap-1.5"
            >
              <Trophy className="h-3.5 w-3.5" />
              {pending ? 'Guardando…' : 'Guardar reglas'}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

function PointsField({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  disabled?: boolean
}) {
  return (
    <div>
      <label className="text-[10px] text-muted-foreground uppercase block mb-1">{label}</label>
      <input
        type="number"
        min="0"
        max="10"
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        disabled={disabled}
        className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
      />
    </div>
  )
}
