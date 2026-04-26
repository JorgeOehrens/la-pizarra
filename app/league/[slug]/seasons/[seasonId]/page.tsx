import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SeasonView, type Stage, type Fixture, type Team } from './season-view'

type Params = Promise<{ slug: string; seasonId: string }>

export default async function SeasonDetailPage({ params }: { params: Params }) {
  if (!features.leagues) redirect('/home')
  const { slug, seasonId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, slug, logo_url, primary_color, secondary_color, visibility, join_mode')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()
  if (!league) notFound()

  const { data: season } = await supabase
    .from('seasons')
    .select('id, name, is_current, league_id')
    .eq('id', seasonId)
    .eq('league_id', league.id)
    .maybeSingle()
  if (!season) notFound()

  const { data: membership } = await supabase
    .from('league_members')
    .select('role, status')
    .eq('league_id', league.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  const isAdmin = membership?.role === 'league_owner' || membership?.role === 'league_admin'

  // Stages, participating teams, fixtures, and rules in parallel.
  const [stagesRes, teamsRes, fixturesRes, rulesRes] = await Promise.all([
    supabase
      .from('match_stages')
      .select('id, name, kind, sort_order, bracket_size')
      .eq('season_id', seasonId)
      .order('sort_order'),

    supabase
      .from('league_teams')
      .select('teams:team_id(id, name, logo_url, primary_color, secondary_color)')
      .eq('league_id', league.id)
      .eq('status', 'active'),

    supabase.rpc('list_league_fixtures', {
      p_league_id: league.id,
      p_season_id: seasonId,
    }),

    supabase
      .from('season_rules')
      .select('format, points_win, points_draw, points_loss, leg_count, default_kickoff, notes')
      .eq('season_id', seasonId)
      .maybeSingle(),
  ])

  const rules = rulesRes.data
    ? {
        format: rulesRes.data.format as 'round_robin' | 'knockout' | 'groups_then_knockout' | 'custom',
        points_win: rulesRes.data.points_win,
        points_draw: rulesRes.data.points_draw,
        points_loss: rulesRes.data.points_loss,
        leg_count: rulesRes.data.leg_count,
        default_kickoff: rulesRes.data.default_kickoff,
        notes: rulesRes.data.notes,
      }
    : null

  const participatingTeams: Team[] = ((teamsRes.data ?? []) as Array<{
    teams: Team | Team[] | null
  }>)
    .map((row) => (Array.isArray(row.teams) ? row.teams[0] : row.teams))
    .filter((t): t is Team => Boolean(t))

  type FixtureRow = {
    id: string
    match_date: string
    status: string
    goals_for: number | null
    goals_against: number | null
    venue_custom: string | null
    bracket_position: number | null
    stage_id: string | null
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

  const fixtureRows = (fixturesRes.data ?? []) as FixtureRow[]

  const allFixtures: Fixture[] = fixtureRows.map((r) => ({
    id: r.id,
    match_date: r.match_date,
    status: r.status as Fixture['status'],
    goals_for: r.goals_for,
    goals_against: r.goals_against,
    venue_custom: r.venue_custom,
    bracket_position: r.bracket_position,
    stage_id: r.stage_id,
    home: r.home_id
      ? {
          id: r.home_id,
          name: r.home_name ?? '',
          logo_url: r.home_logo,
          primary_color: r.home_primary ?? '#D7FF00',
          secondary_color: r.home_secondary ?? '#000000',
        }
      : null,
    away: r.away_id
      ? {
          id: r.away_id,
          name: r.away_name ?? '',
          logo_url: r.away_logo,
          primary_color: r.away_primary ?? '#D7FF00',
          secondary_color: r.away_secondary ?? '#000000',
        }
      : null,
  }))

  const stages: Stage[] = (stagesRes.data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    kind: s.kind as Stage['kind'],
    sort_order: s.sort_order ?? 0,
    bracket_size: s.bracket_size ?? null,
    fixtures: allFixtures.filter((f) => f.stage_id === s.id),
  }))

  const unstaged = allFixtures.filter((f) => f.stage_id === null)

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
          backHref={`/league/${league.slug}/seasons`}
          backLabel="Temporadas"
          isAdmin={isAdmin}
        />

        <div className="mb-5">
          <h1 className="font-display text-2xl">{season.name}</h1>
        </div>

        <SeasonView
          leagueId={league.id}
          slug={league.slug}
          seasonId={season.id}
          seasonName={season.name}
          isCurrent={!!season.is_current}
          isAdmin={isAdmin}
          participatingTeams={participatingTeams}
          stages={stages}
          unstaged={unstaged}
          rules={rules}
        />
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}
