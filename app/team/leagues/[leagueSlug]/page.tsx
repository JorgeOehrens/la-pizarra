import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import { getActiveTeamMembership } from '@/lib/team'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, Calendar, ListOrdered, Trophy, Star } from 'lucide-react'

type Params = Promise<{ leagueSlug: string }>

export default async function TeamLeagueDetailPage({ params }: { params: Params }) {
  if (!features.leagues) redirect('/team')
  const { leagueSlug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect('/team-select')
  const team = membership.teams

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, slug, logo_url, primary_color, secondary_color, description')
    .eq('slug', leagueSlug)
    .is('deleted_at', null)
    .maybeSingle()
  if (!league) notFound()

  // Verify the team participates.
  const { data: participation } = await supabase
    .from('league_teams')
    .select('id, status, season_id')
    .eq('league_id', league.id)
    .eq('team_id', team.id)
    .in('status', ['pending', 'active'])
    .maybeSingle()
  if (!participation) {
    // The team isn't in this league — fall back to public league page.
    redirect(`/league/${league.slug}`)
  }

  // Current season + rules.
  const { data: currentSeason } = await supabase
    .from('seasons')
    .select('id, name')
    .eq('league_id', league.id)
    .eq('is_current', true)
    .maybeSingle()

  const [fixturesRes, standingsRes] = await Promise.all([
    supabase.rpc('list_league_fixtures', {
      p_league_id: league.id,
      p_season_id: currentSeason?.id ?? null,
    }),

    currentSeason
      ? supabase
          .from('season_standings')
          .select('team_id, team_name, played, wins, draws, losses, goal_difference, points')
          .eq('season_id', currentSeason.id)
      : Promise.resolve({ data: [] as Array<{
          team_id: string
          team_name: string
          played: number
          wins: number
          draws: number
          losses: number
          goal_difference: number
          points: number
        }> }),
  ])

  type FixtureRow = {
    id: string
    match_date: string
    status: string
    goals_for: number | null
    goals_against: number | null
    venue_custom: string | null
    stage_name: string | null
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

  const allFixtures = (fixturesRes.data ?? []) as FixtureRow[]
  const myFixtures = allFixtures.filter(
    (f) => f.home_id === team.id || f.away_id === team.id,
  )
  const upcoming = myFixtures.filter((f) => f.status === 'scheduled')
  const played = myFixtures.filter((f) => f.status === 'finished')
  const nextMatch = upcoming[0] ?? null
  const lastMatches = played.slice(-3).reverse()

  // Find own row in standings.
  const standings = (standingsRes.data ?? []).slice().sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    return 0
  })
  const ownIdx = standings.findIndex((s) => s.team_id === team.id)
  const ownStanding = ownIdx >= 0 ? standings[ownIdx] : null
  const totalTeams = standings.length

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/team/leagues"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Mis ligas</span>
          </Link>
          <Link
            href={`/league/${league.slug}`}
            className="text-xs text-accent uppercase tracking-wider"
          >
            Vista completa →
          </Link>
        </header>

        <div className="flex items-center gap-3 mb-6">
          {league.logo_url ? (
            <Image src={league.logo_url} alt={league.name} width={48} height={48} className="rounded-xl object-cover shrink-0" />
          ) : (
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-xl shrink-0"
              style={{ backgroundColor: league.primary_color || '#D7FF00', color: league.secondary_color || '#000' }}
            >
              <Trophy className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{team.name} en</p>
            <h1 className="font-display text-2xl leading-tight truncate">{league.name}</h1>
          </div>
        </div>

        {participation.status === 'pending' && (
          <div className="bg-accent/10 border border-accent/40 rounded-xl p-4 mb-5">
            <p className="text-sm text-accent font-medium">Invitación pendiente</p>
            <p className="text-xs text-muted-foreground mt-1">
              Tu equipo todavía no aceptó la invitación. Andá a "Mis ligas" para aceptar.
            </p>
          </div>
        )}

        {/* Standing snapshot */}
        {currentSeason && ownStanding && (
          <section className="bg-card rounded-xl p-4 border border-border/40 mb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Star className="h-3.5 w-3.5 text-accent fill-current" />
                <span className="text-xs text-muted-foreground">{currentSeason.name}</span>
              </div>
              <Link href={`/league/${league.slug}/standings`} className="text-[10px] uppercase tracking-widest text-accent">
                Tabla completa →
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="font-display text-3xl">
                  {ownIdx + 1}
                  <span className="text-sm text-muted-foreground">° de {totalTeams}</span>
                </p>
                <p className="text-xs text-muted-foreground">Posición</p>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                <Stat label="Pts" value={ownStanding.points} highlight />
                <Stat label="PJ" value={ownStanding.played} />
                <Stat label="DG" value={(ownStanding.goal_difference > 0 ? '+' : '') + ownStanding.goal_difference} />
              </div>
            </div>
          </section>
        )}

        {/* Next match */}
        <section className="mb-5">
          <h2 className="font-display text-lg mb-3">Próximo partido</h2>
          {nextMatch ? (
            <NextFixtureCard fixture={nextMatch} ownTeamId={team.id} />
          ) : (
            <div className="bg-card rounded-xl p-4 flex items-center gap-3 border border-dashed border-border">
              <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
              <p className="text-sm text-muted-foreground">No tenés partidos programados.</p>
            </div>
          )}
        </section>

        {/* Recent results */}
        {lastMatches.length > 0 && (
          <section className="mb-5">
            <h2 className="font-display text-lg mb-3">Últimos resultados</h2>
            <div className="space-y-2">
              {lastMatches.map((f) => (
                <ResultCard key={f.id} fixture={f} ownTeamId={team.id} />
              ))}
            </div>
          </section>
        )}

        {/* Quick links */}
        <section className="grid grid-cols-2 gap-3">
          <Link
            href={`/league/${league.slug}/fixtures`}
            className="bg-card rounded-xl p-4 flex flex-col gap-2 border border-border/40 hover:border-border"
          >
            <Calendar className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Calendario completo</span>
            <span className="text-xs text-muted-foreground">{allFixtures.length} partidos</span>
          </Link>
          <Link
            href={`/league/${league.slug}/standings`}
            className="bg-card rounded-xl p-4 flex flex-col gap-2 border border-border/40 hover:border-border"
          >
            <ListOrdered className="h-5 w-5 text-accent" />
            <span className="text-sm font-medium">Tabla</span>
            <span className="text-xs text-muted-foreground">{totalTeams} equipos</span>
          </Link>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div>
      <p className={`font-display text-xl tabular-nums ${highlight ? 'text-accent' : ''}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
    </div>
  )
}

type FixtureBase = {
  id: string
  match_date: string
  status: string
  goals_for: number | null
  goals_against: number | null
  venue_custom: string | null
  stage_name: string | null
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

function NextFixtureCard({ fixture: f, ownTeamId }: { fixture: FixtureBase; ownTeamId: string }) {
  const dt = format(new Date(f.match_date), 'EEEE d MMM · HH:mm', { locale: es })
  const isHome = f.home_id === ownTeamId
  const opponent = isHome
    ? { name: f.away_name, logo: f.away_logo, primary: f.away_primary, secondary: f.away_secondary }
    : { name: f.home_name, logo: f.home_logo, primary: f.home_primary, secondary: f.home_secondary }

  return (
    <Link
      href={`/matches/${f.id}`}
      className="block bg-card rounded-xl p-4 border border-border/40 hover:border-border"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{dt}</span>
        {f.stage_name && (
          <span className="text-[10px] uppercase tracking-widest text-accent">{f.stage_name}</span>
        )}
      </div>
      <div className="flex items-center gap-3 py-2">
        <span className="font-display text-lg flex-1">{isHome ? 'Local' : 'Visitante'}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-widest">vs</span>
        <div className="flex-1 flex items-center gap-2 justify-end min-w-0">
          {opponent.logo ? (
            <Image src={opponent.logo} alt={opponent.name ?? ''} width={28} height={28} className="rounded shrink-0 object-cover" />
          ) : (
            <div
              className="w-7 h-7 rounded flex items-center justify-center text-xs font-display shrink-0"
              style={{ backgroundColor: opponent.primary || '#D7FF00', color: opponent.secondary || '#000' }}
            >
              {(opponent.name ?? '?').charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium truncate">{opponent.name}</span>
        </div>
      </div>
      {f.venue_custom && (
        <p className="text-xs text-muted-foreground border-t border-border/40 pt-2">📍 {f.venue_custom}</p>
      )}
    </Link>
  )
}

function ResultCard({ fixture: f, ownTeamId }: { fixture: FixtureBase; ownTeamId: string }) {
  const dt = format(new Date(f.match_date), 'd MMM', { locale: es })
  const isHome = f.home_id === ownTeamId
  const ownGoals = isHome ? f.goals_for : f.goals_against
  const oppGoals = isHome ? f.goals_against : f.goals_for
  const opponent = isHome ? f.away_name : f.home_name

  let result: 'W' | 'D' | 'L' | '?' = '?'
  if (ownGoals != null && oppGoals != null) {
    result = ownGoals > oppGoals ? 'W' : ownGoals < oppGoals ? 'L' : 'D'
  }

  const resultColor =
    result === 'W' ? 'bg-accent/15 text-accent'
    : result === 'L' ? 'bg-destructive/10 text-destructive'
    : 'bg-muted text-muted-foreground'

  return (
    <Link
      href={`/matches/${f.id}`}
      className="block bg-card rounded-lg p-3 border border-border/30 hover:border-border"
    >
      <div className="flex items-center gap-3">
        <span className={`w-7 h-7 rounded flex items-center justify-center text-xs font-display ${resultColor}`}>
          {result}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{dt} {isHome ? '· local' : '· visitante'}</p>
          <p className="text-sm truncate">vs {opponent}</p>
        </div>
        <span className="font-display text-base tabular-nums">
          {ownGoals ?? '-'} – {oppGoals ?? '-'}
        </span>
      </div>
    </Link>
  )
}
