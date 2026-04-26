import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Goal,
  ListOrdered,
  MapPin,
  Plus,
  Settings,
  Sparkles,
  Star,
  Swords,
  Trophy,
  UserPlus,
} from 'lucide-react'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SharePublicLeagueButton } from '@/components/share-public-league-button'

type Params = Promise<{ slug: string }>

type Visibility = 'public' | 'unlisted' | 'private'
type JoinMode = 'open' | 'request' | 'invite_only'

export default async function LeaguePage({ params }: { params: Params }) {
  if (!features.leagues) redirect('/home')

  const { slug } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: league } = await supabase
    .from('leagues')
    .select(
      'id, name, slug, logo_url, primary_color, secondary_color, description, visibility, join_mode',
    )
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
  const isMember = !!membership

  // Pull dashboard data in parallel.
  const [
    { count: teamCount },
    { count: seasonCount },
    { data: currentSeason },
    { data: recentMatchesRaw },
  ] = await Promise.all([
    supabase
      .from('league_teams')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', league.id)
      .eq('status', 'active'),

    supabase
      .from('seasons')
      .select('id', { count: 'exact', head: true })
      .eq('league_id', league.id),

    supabase
      .from('seasons')
      .select('id, name')
      .eq('league_id', league.id)
      .eq('is_current', true)
      .maybeSingle(),

    supabase
      .from('matches')
      .select('id, status', { count: 'exact', head: false })
      .eq('league_id', league.id)
      .eq('status', 'finished')
      .is('deleted_at', null)
      .order('match_date', { ascending: false })
      .limit(5),
  ])

  const finishedMatchesCount = recentMatchesRaw?.length ?? 0

  // Fixtures + standings + top scorers of the current season.
  const seasonId = currentSeason?.id ?? null
  const [fixturesRes, standingsRes, scorersRes] = await Promise.all([
    seasonId
      ? supabase.rpc('list_league_fixtures', {
          p_league_id: league.id,
          p_season_id: seasonId,
        })
      : Promise.resolve({ data: [] as Array<Record<string, unknown>> }),

    seasonId
      ? supabase
          .from('season_standings')
          .select(
            'team_id, team_name, logo_url, primary_color, secondary_color, played, wins, draws, losses, goal_difference, points',
          )
          .eq('season_id', seasonId)
      : Promise.resolve({ data: [] as Array<Record<string, never>> }),

    seasonId
      ? supabase
          .from('season_top_scorers')
          .select('player_id, display_name, username, avatar_url, team_name, team_logo_url, team_primary_color, team_secondary_color, goals, assists')
          .eq('season_id', seasonId)
      : Promise.resolve({ data: [] as Array<Record<string, never>> }),
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

  const fixtures = (fixturesRes.data ?? []) as FixtureRow[]
  const upcoming = fixtures
    .filter((f) => f.status === 'scheduled')
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    .slice(0, 3)
  const recent = fixtures
    .filter((f) => f.status === 'finished')
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    .slice(0, 3)

  type StandingRow = {
    team_id: string
    team_name: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    played: number
    wins: number
    draws: number
    losses: number
    goal_difference: number
    points: number
  }

  const standings = ((standingsRes.data ?? []) as StandingRow[])
    .slice()
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
      return a.team_name.localeCompare(b.team_name)
    })

  const top5 = standings.slice(0, 5)

  type ScorerRow = {
    player_id: string
    display_name: string | null
    username: string
    avatar_url: string | null
    team_name: string
    team_logo_url: string | null
    team_primary_color: string
    team_secondary_color: string
    goals: number
    assists: number
  }

  const allScorers = (scorersRes.data ?? []) as ScorerRow[]

  const topScorers = allScorers
    .filter((s) => s.goals > 0)
    .sort((a, b) => b.goals - a.goals || b.assists - a.assists)
    .slice(0, 5)

  const topAssists = allScorers
    .filter((s) => s.assists > 0)
    .sort((a, b) => b.assists - a.assists || b.goals - a.goals)
    .slice(0, 5)

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
            visibility: league.visibility as Visibility,
            join_mode: league.join_mode as JoinMode,
            description: league.description,
          }}
          backHref="/home"
          backLabel="Inicio"
          isAdmin={isAdmin}
          hero
        />

        {/* Beta-free banner — Pro Liga is in validation. */}
        {isAdmin && (
          <div className="mb-4 bg-accent/10 border border-accent/30 rounded-xl px-4 py-3">
            <p className="text-xs text-accent font-medium uppercase tracking-[0.18em] mb-1">
              Pro Liga · Beta gratis
            </p>
            <p className="text-xs text-white/70 leading-relaxed">
              Estás usando la liga sin costo durante la beta. Cuando lancemos
              cobramos <span className="font-medium text-white">$10.000 CLP/año por liga</span>;
              te avisamos por email antes.
            </p>
          </div>
        )}

        {/* Stats strip */}
        <section className="grid grid-cols-3 gap-2 mb-4">
          <StatTile label="Equipos" value={teamCount ?? 0} />
          <StatTile label="Temporadas" value={seasonCount ?? 0} />
          <StatTile label="Partidos" value={finishedMatchesCount} />
        </section>

        {(league.visibility === 'public' || league.visibility === 'unlisted') && (
          <div className="mb-5 flex justify-end">
            <SharePublicLeagueButton slug={league.slug} />
          </div>
        )}

        {/* Non-member banner */}
        {!isMember && (
          <div className="bg-card border border-dashed border-border/60 rounded-xl p-4 mb-5">
            <p className="text-sm text-muted-foreground">
              {league.visibility === 'public'
                ? 'Estás viendo una liga pública. Pídele al admin que te invite para gestionarla.'
                : 'Liga no listada — solo accesible con link directo.'}
            </p>
          </div>
        )}

        {/* Top 5 standings (current season) */}
        {currentSeason && (
          <section className="mb-6">
            <SectionHeader
              title="Top 5"
              subtitle={currentSeason.name}
              right={
                <Link
                  href={`/league/${league.slug}/standings`}
                  className="text-[10px] uppercase tracking-widest text-accent"
                >
                  Tabla completa →
                </Link>
              }
            />

            {top5.length === 0 ? (
              <EmptyTile
                icon={ListOrdered}
                text="Sin partidos jugados en la temporada actual."
              />
            ) : (
              <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
                {top5.map((s, i) => (
                  <div
                    key={s.team_id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${
                      i < top5.length - 1 ? 'border-b border-border/30' : ''
                    }`}
                  >
                    <span className="w-5 text-xs text-muted-foreground tabular-nums text-center">
                      {i + 1}
                    </span>
                    {s.logo_url ? (
                      <Image
                        src={s.logo_url}
                        alt={s.team_name}
                        width={20}
                        height={20}
                        className="rounded shrink-0 object-cover"
                      />
                    ) : (
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-display shrink-0"
                        style={{
                          backgroundColor: s.primary_color || '#D7FF00',
                          color: s.secondary_color || '#000',
                        }}
                      >
                        {s.team_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-xs truncate">{s.team_name}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {s.played} PJ
                    </span>
                    <span className="font-display text-base tabular-nums w-8 text-right">
                      {s.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Top scorers + top assists */}
        {(topScorers.length > 0 || topAssists.length > 0) && (
          <section className="mb-6 grid grid-cols-1 gap-4">
            {topScorers.length > 0 && (
              <ScorersList
                title="Goleadores"
                subtitle={currentSeason?.name}
                rows={topScorers}
                metricLabel="goles"
                metricKey="goals"
              />
            )}
            {topAssists.length > 0 && (
              <ScorersList
                title="Asistencias"
                subtitle={currentSeason?.name}
                rows={topAssists}
                metricLabel="asistencias"
                metricKey="assists"
              />
            )}
          </section>
        )}

        {/* Upcoming fixtures */}
        <section className="mb-6">
          <SectionHeader
            title="Próximos partidos"
            right={
              <Link
                href={`/league/${league.slug}/fixtures`}
                className="text-[10px] uppercase tracking-widest text-accent"
              >
                Ver todos →
              </Link>
            }
          />

          {upcoming.length === 0 ? (
            <EmptyTile
              icon={Calendar}
              text={
                currentSeason
                  ? 'No hay partidos programados.'
                  : 'Activá una temporada para ver partidos.'
              }
            />
          ) : (
            <div className="space-y-2">
              {upcoming.map((f) => (
                <FixtureCard key={f.id} fixture={f} compact={false} />
              ))}
            </div>
          )}
        </section>

        {/* Recent results */}
        {recent.length > 0 && (
          <section className="mb-6">
            <SectionHeader title="Últimos resultados" />
            <div className="space-y-2">
              {recent.map((f) => (
                <FixtureCard key={f.id} fixture={f} compact />
              ))}
            </div>
          </section>
        )}

        {/* Admin quick actions */}
        {isAdmin && (
          <section className="mb-4">
            <SectionHeader title="Acciones rápidas" />
            <div className="grid grid-cols-2 gap-2">
              <QuickAction
                href={
                  currentSeason
                    ? `/league/${league.slug}/seasons/${currentSeason.id}`
                    : `/league/${league.slug}/seasons`
                }
                icon={Sparkles}
                label="Auto-generar fixtures"
                hint={currentSeason ? currentSeason.name : 'Crear temporada primero'}
              />
              <QuickAction
                href={`/league/${league.slug}/teams/invite`}
                icon={UserPlus}
                label="Invitar equipos"
                hint={`${teamCount ?? 0} participando`}
              />
              <QuickAction
                href={`/league/${league.slug}/seasons`}
                icon={Trophy}
                label="Temporadas"
                hint={`${seasonCount ?? 0} creadas`}
              />
              <QuickAction
                href={`/league/${league.slug}/settings`}
                icon={Settings}
                label="Configuración"
                hint="Edición de liga"
              />
            </div>
          </section>
        )}

        {/* Empty seasons CTA when no current season exists */}
        {isAdmin && !currentSeason && (
          <Link
            href={`/league/${league.slug}/seasons`}
            className="flex items-center gap-3 bg-accent text-accent-foreground rounded-xl p-4 mb-4"
          >
            <div className="w-10 h-10 rounded-lg bg-accent-foreground/15 flex items-center justify-center">
              <Plus className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium uppercase tracking-wider">Crear primera temporada</p>
              <p className="text-xs opacity-75">Necesitás una temporada para programar partidos</p>
            </div>
          </Link>
        )}
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ScorersList({
  title,
  subtitle,
  rows,
  metricLabel,
  metricKey,
}: {
  title: string
  subtitle?: string
  rows: Array<{
    player_id: string
    display_name: string | null
    username: string
    avatar_url: string | null
    team_name: string
    goals: number
    assists: number
  }>
  metricLabel: string
  metricKey: 'goals' | 'assists'
}) {
  return (
    <div>
      <SectionHeader title={title} subtitle={subtitle} />
      <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
        {rows.map((s, i) => (
          <div
            key={s.player_id}
            className={`flex items-center gap-3 px-3 py-2.5 ${
              i < rows.length - 1 ? 'border-b border-border/30' : ''
            }`}
          >
            <span className="w-5 text-xs text-muted-foreground tabular-nums text-center">
              {i + 1}
            </span>
            {s.avatar_url ? (
              <Image
                src={s.avatar_url}
                alt={s.display_name ?? s.username}
                width={24}
                height={24}
                className="rounded-full shrink-0 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-display shrink-0">
                {(s.display_name ?? s.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{s.display_name ?? s.username}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.team_name}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0" title={metricLabel}>
              <Goal className="h-3 w-3 text-accent" />
              <span className="font-display tabular-nums text-sm">{s[metricKey]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl p-3 text-center border border-border/40">
      <p className="font-display text-2xl tabular-nums leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function SectionHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div className="flex items-end justify-between mb-3">
      <div className="min-w-0">
        <h2 className="font-display text-lg leading-tight">{title}</h2>
        {subtitle && (
          <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-accent">
            <Star className="h-3 w-3 fill-current" /> {subtitle}
          </p>
        )}
      </div>
      {right}
    </div>
  )
}

function EmptyTile({ icon: Icon, text }: { icon: typeof Calendar; text: string }) {
  return (
    <div className="bg-card rounded-xl p-5 text-center border border-dashed border-border/40">
      <Icon className="h-7 w-7 text-muted-foreground/40 mx-auto mb-2" />
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  )
}

function QuickAction({
  href,
  icon: Icon,
  label,
  hint,
}: {
  href: string
  icon: typeof Calendar
  label: string
  hint: string
}) {
  return (
    <Link
      href={href}
      className="bg-card rounded-xl p-3 flex flex-col gap-1.5 border border-border/40 hover:border-border transition-colors"
    >
      <Icon className="h-5 w-5 text-accent" />
      <span className="text-xs font-medium leading-tight">{label}</span>
      <span className="text-[10px] text-muted-foreground leading-tight">{hint}</span>
    </Link>
  )
}

function FixtureCard({
  fixture: f,
  compact,
}: {
  fixture: {
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
  compact: boolean
}) {
  const dt = format(new Date(f.match_date), compact ? 'd MMM' : 'EEE d MMM · HH:mm', { locale: es })
  const isFinished = f.status === 'finished'

  return (
    <Link
      href={`/matches/${f.id}`}
      className="block bg-card rounded-xl p-3 border border-border/30 hover:border-border"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{dt}</span>
        <div className="flex items-center gap-1.5">
          {f.stage_name && (
            <span className="text-[10px] uppercase tracking-widest text-accent">
              {f.stage_name}
            </span>
          )}
          {f.venue_custom && !compact && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> {f.venue_custom}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TeamPill
          name={f.home_name}
          logo={f.home_logo}
          primary={f.home_primary}
          secondary={f.home_secondary}
          align="right"
        />
        <div className="px-2 shrink-0">
          {isFinished && f.goals_for != null && f.goals_against != null ? (
            <span className="font-display text-base tabular-nums">
              {f.goals_for} – {f.goals_against}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">vs</span>
          )}
        </div>
        <TeamPill
          name={f.away_name}
          logo={f.away_logo}
          primary={f.away_primary}
          secondary={f.away_secondary}
          align="left"
        />
      </div>
    </Link>
  )
}

function TeamPill({
  name,
  logo,
  primary,
  secondary,
  align,
}: {
  name: string | null
  logo: string | null
  primary: string | null
  secondary: string | null
  align: 'left' | 'right'
}) {
  if (!name) return <div className="flex-1 text-sm text-muted-foreground">—</div>
  return (
    <div className={`flex-1 flex items-center gap-2 min-w-0 ${align === 'right' ? 'justify-end' : ''}`}>
      {align === 'right' && <span className="text-sm font-medium truncate">{name}</span>}
      {logo ? (
        <Image src={logo} alt={name} width={24} height={24} className="rounded shrink-0 object-cover" />
      ) : (
        <div
          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-display shrink-0"
          style={{ backgroundColor: primary || '#D7FF00', color: secondary || '#000' }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      {align === 'left' && <span className="text-sm font-medium truncate">{name}</span>}
    </div>
  )
}

