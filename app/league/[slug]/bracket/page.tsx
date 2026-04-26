import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import Link from 'next/link'
import { Star, Swords, Trophy } from 'lucide-react'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SeasonSelect } from '@/components/season-select'
import { BracketView, type BracketStage } from './bracket-view'

type Params = Promise<{ slug: string }>
type Search = Promise<{ season?: string }>

export default async function LeagueBracketPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  if (!features.leagues) redirect('/home')
  const [{ slug }, search] = await Promise.all([params, searchParams])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, slug, logo_url, primary_color, secondary_color, visibility, join_mode')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()
  if (!league) notFound()

  const { data: membership } = await supabase
    .from('league_members')
    .select('role, status')
    .eq('league_id', league.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  const isAdmin = membership?.role === 'league_owner' || membership?.role === 'league_admin'

  // Seasons + selected season.
  const { data: rawSeasons } = await supabase
    .from('seasons')
    .select('id, name, is_current, starts_on')
    .eq('league_id', league.id)
    .order('is_current', { ascending: false })
    .order('starts_on', { ascending: false, nullsFirst: false })

  const allSeasons = (rawSeasons ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    is_current: !!s.is_current,
  }))
  const requestedSeasonId = search.season ?? null
  const currentSeason = allSeasons.find((s) => s.is_current) ?? null
  const selectedSeasonId =
    requestedSeasonId && allSeasons.some((s) => s.id === requestedSeasonId)
      ? requestedSeasonId
      : currentSeason?.id ?? null
  const selectedSeason = allSeasons.find((s) => s.id === selectedSeasonId) ?? null

  // Knockout stages of the selected season + their fixtures.
  const stagesPromise = selectedSeasonId
    ? supabase
        .from('match_stages')
        .select('id, name, kind, sort_order, bracket_size')
        .eq('season_id', selectedSeasonId)
        .eq('kind', 'knockout')
        .order('sort_order')
    : Promise.resolve({ data: [] as Array<{
        id: string
        name: string
        kind: 'knockout'
        sort_order: number
        bracket_size: number | null
      }>, error: null })

  const fixturesPromise = selectedSeasonId
    ? supabase.rpc('list_league_fixtures', {
        p_league_id: league.id,
        p_season_id: selectedSeasonId,
      })
    : Promise.resolve({ data: [] as Array<Record<string, unknown>>, error: null })

  const [{ data: rawStages }, { data: rawFixtures }] = await Promise.all([
    stagesPromise,
    fixturesPromise,
  ])

  type FixtureRow = {
    id: string
    match_date: string
    status: string
    goals_for: number | null
    goals_against: number | null
    venue_custom: string | null
    bracket_position: number | null
    stage_id: string | null
    stage_name: string | null
    stage_kind: string | null
    home_id: string | null
    home_name: string | null
    home_logo: string | null
    home_primary: string | null
    home_secondary: string | null
    away_id: string | null
    away_name: string | null
    away_logo: string | null
    away_primary: string | null
    away_secondary: string | null
  }

  const fixtures = (rawFixtures ?? []) as FixtureRow[]

  const stages: BracketStage[] = (rawStages ?? [])
    .map((s) => {
      const stageMatches = fixtures
        .filter((f) => f.stage_id === s.id)
        .sort(
          (a, b) =>
            (a.bracket_position ?? 999) - (b.bracket_position ?? 999) ||
            new Date(a.match_date).getTime() - new Date(b.match_date).getTime(),
        )
        .map((f) => ({
          id: f.id,
          match_date: f.match_date,
          status: f.status as BracketStage['matches'][number]['status'],
          goals_for: f.goals_for,
          goals_against: f.goals_against,
          bracket_position: f.bracket_position,
          home: f.home_id
            ? {
                id: f.home_id,
                name: f.home_name ?? '',
                logo_url: f.home_logo,
                primary_color: f.home_primary ?? '#D7FF00',
                secondary_color: f.home_secondary ?? '#000',
              }
            : null,
          away: f.away_id
            ? {
                id: f.away_id,
                name: f.away_name ?? '',
                logo_url: f.away_logo,
                primary_color: f.away_primary ?? '#D7FF00',
                secondary_color: f.away_secondary ?? '#000',
              }
            : null,
        }))

      return {
        id: s.id,
        name: s.name,
        bracket_size: s.bracket_size ?? null,
        sort_order: s.sort_order ?? 0,
        matches: stageMatches,
      }
    })
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pb-24 max-w-lg mx-auto">
        <LeagueHeader
          league={{
            slug: league.slug,
            name: league.name,
            logo_url: league.logo_url,
            primary_color: league.primary_color,
            secondary_color: league.secondary_color,
            visibility: league.visibility as 'public' | 'unlisted' | 'private',
            join_mode: league.join_mode as 'open' | 'request' | 'invite_only',
          }}
          backHref={`/league/${league.slug}`}
          backLabel="Liga"
          isAdmin={isAdmin}
        />

        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <h1 className="font-display text-2xl">Llave</h1>
            {selectedSeason?.is_current && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-accent/15 text-accent px-2 py-0.5 rounded">
                <Star className="h-3 w-3 fill-current" /> Actual
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Eliminatoria por fases. Cada columna es una ronda.
          </p>
        </div>

        {allSeasons.length > 0 && (
          <SeasonSelect
            seasons={allSeasons}
            selectedId={selectedSeasonId}
            className="mb-5"
          />
        )}

        {!selectedSeason ? (
          <EmptyTile
            text="Sin temporada activa."
            cta={{ href: `/league/${league.slug}/seasons`, label: 'Crear temporada →' }}
          />
        ) : stages.length === 0 ? (
          <EmptyTile
            text="No hay fases de eliminatoria en esta temporada."
            cta={
              isAdmin
                ? { href: `/league/${league.slug}/seasons/${selectedSeason.id}`, label: 'Crear fase knockout →' }
                : undefined
            }
          />
        ) : (
          <BracketView stages={stages} />
        )}
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}

function EmptyTile({
  text,
  cta,
}: {
  text: string
  cta?: { href: string; label: string }
}) {
  return (
    <div className="bg-card rounded-xl p-6 text-center border border-border/40">
      <Swords className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
      <p className="text-sm text-muted-foreground mb-2">{text}</p>
      {cta && (
        <Link href={cta.href} className="text-accent text-sm hover:underline">
          {cta.label}
        </Link>
      )}
      <span className="hidden">
        <Trophy />
      </span>
    </div>
  )
}
