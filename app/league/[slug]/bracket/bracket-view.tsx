'use client'

import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export type BracketTeam = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

export type BracketMatch = {
  id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed'
  goals_for: number | null
  goals_against: number | null
  bracket_position: number | null
  home: BracketTeam | null
  away: BracketTeam | null
}

export type BracketStage = {
  id: string
  name: string
  bracket_size: number | null
  sort_order: number
  matches: BracketMatch[]
}

/**
 * Horizontal bracket layout.
 * - Each stage is a column, ordered by sort_order.
 * - Cards inside the column are spaced so visual height grows with stage size
 *   (cuartos has more matches than semis, semis more than final).
 * - Mobile-first: horizontal scroll.
 */
export function BracketView({ stages }: { stages: BracketStage[] }) {
  if (stages.length === 0) return null

  const minColumnWidth = 200
  const cardHeight = 84

  // Determine the largest match count to size column heights consistently.
  const maxMatches = Math.max(...stages.map((s) => s.matches.length || 1), 1)

  return (
    <div
      className="relative -mx-4 px-4 overflow-x-auto pb-4"
      style={{ scrollbarWidth: 'thin' }}
    >
      <div className="flex items-stretch gap-3" style={{ minWidth: 'min-content' }}>
        {stages.map((stage, stageIdx) => {
          const matchCount = stage.matches.length || 1
          const slotMultiplier = Math.max(1, Math.round(maxMatches / matchCount))

          return (
            <div
              key={stage.id}
              className="flex flex-col"
              style={{ width: minColumnWidth }}
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 text-center">
                {stage.name}
                {stage.bracket_size ? ` · ${stage.bracket_size} equipos` : ''}
              </div>

              <div
                className="flex flex-col justify-around flex-1 gap-2"
                style={{
                  minHeight: maxMatches * (cardHeight + 16),
                }}
              >
                {stage.matches.length === 0 ? (
                  <EmptySlot />
                ) : (
                  stage.matches.map((m) => (
                    <BracketCard
                      key={m.id}
                      match={m}
                      slotMultiplier={slotMultiplier}
                      isLast={stageIdx === stages.length - 1}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function BracketCard({
  match,
  slotMultiplier,
  isLast,
}: {
  match: BracketMatch
  slotMultiplier: number
  isLast: boolean
}) {
  const dt = format(new Date(match.match_date), 'd MMM · HH:mm', { locale: es })
  const isFinished = match.status === 'finished'
  const homeWon =
    isFinished &&
    match.goals_for != null &&
    match.goals_against != null &&
    match.goals_for > match.goals_against
  const awayWon =
    isFinished &&
    match.goals_for != null &&
    match.goals_against != null &&
    match.goals_for < match.goals_against

  return (
    <div className="relative" style={{ flex: slotMultiplier }}>
      <Link
        href={`/matches/${match.id}`}
        className="block bg-card rounded-lg border border-border/40 hover:border-accent/40 transition-colors overflow-hidden"
      >
        <div className="flex items-center justify-between px-2.5 py-1 border-b border-border/30 bg-muted/30">
          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">
            {dt}
          </span>
          {match.bracket_position != null && (
            <span className="text-[9px] uppercase tracking-widest text-accent">
              #{match.bracket_position}
            </span>
          )}
        </div>

        <BracketSide team={match.home} score={match.goals_for} won={homeWon} loaded={isFinished} />
        <div className="border-t border-border/30" />
        <BracketSide team={match.away} score={match.goals_against} won={awayWon} loaded={isFinished} />
      </Link>

      {/* Connector line to next column (right side) */}
      {!isLast && (
        <span
          aria-hidden
          className="absolute top-1/2 -right-3 w-3 h-px bg-border"
        />
      )}
    </div>
  )
}

function BracketSide({
  team,
  score,
  won,
  loaded,
}: {
  team: BracketTeam | null
  score: number | null
  won: boolean
  loaded: boolean
}) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 ${
        won ? 'bg-accent/5' : ''
      }`}
    >
      {team ? (
        <>
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
              style={{
                backgroundColor: team.primary_color || '#D7FF00',
                color: team.secondary_color || '#000',
              }}
            >
              {team.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span
            className={`flex-1 truncate text-xs ${won ? 'font-medium' : ''} ${
              loaded && !won ? 'text-muted-foreground' : ''
            }`}
          >
            {team.name}
          </span>
        </>
      ) : (
        <>
          <div className="w-5 h-5 rounded bg-muted shrink-0" />
          <span className="flex-1 truncate text-xs text-muted-foreground">Por definir</span>
        </>
      )}
      <span className="font-display tabular-nums text-sm w-5 text-right">
        {loaded && score != null ? score : '–'}
      </span>
    </div>
  )
}

function EmptySlot() {
  return (
    <div className="bg-card rounded-lg border border-dashed border-border/40 px-3 py-4 text-center">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
        Sin partidos
      </p>
    </div>
  )
}
