import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Goal,
  ListOrdered,
  LogIn,
  MapPin,
  Star,
  Swords,
  Trophy,
} from 'lucide-react'

type Params = Promise<{ slug: string }>

type ApiTeam = {
  id: string
  name: string
  slug: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
}

type ApiFixture = {
  id: string
  match_date: string
  status: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed'
  goals_for: number | null
  goals_against: number | null
  venue_custom: string | null
  bracket_position: number | null
  stage_id: string | null
  stage_name: string | null
  stage_kind: string | null
  stage_sort: number | null
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

type ApiStanding = {
  team_id: string
  team_name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  played: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

type ApiScorer = {
  player_id: string
  display_name: string | null
  username: string
  avatar_url: string | null
  team_name: string
  team_logo_url: string | null
  goals: number
  assists: number
}

type ApiPayload = {
  league: {
    id: string
    name: string
    slug: string
    description: string | null
    logo_url: string | null
    primary_color: string
    secondary_color: string
    visibility: 'public' | 'unlisted' | 'private'
    join_mode: 'open' | 'request' | 'invite_only'
  }
  season: { id: string; name: string; is_current: boolean } | null
  teams: ApiTeam[]
  fixtures: ApiFixture[]
  standings: ApiStanding[]
  top_scorers: ApiScorer[]
  top_assists: ApiScorer[]
}

export default async function PublicLeaguePage({ params }: { params: Params }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.rpc('get_public_league_view', {
    p_slug: slug,
    p_season_id: null,
  })

  if (error || !data) notFound()

  const payload = data as ApiPayload
  const { league, season, teams, fixtures, standings, top_scorers, top_assists } = payload

  const upcoming = fixtures
    .filter((f) => f.status === 'scheduled')
    .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    .slice(0, 5)
  const recent = fixtures
    .filter((f) => f.status === 'finished')
    .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
    .slice(0, 5)
  const top5Standings = standings.slice(0, 5)
  const finishedCount = fixtures.filter((f) => f.status === 'finished').length

  const primary = league.primary_color || '#16a34a'
  const secondary = league.secondary_color || '#ffffff'

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto pb-20">
        {/* Hero */}
        <div
          className="relative px-4 pt-6 pb-7 overflow-hidden"
          style={{ backgroundColor: primary, color: secondary }}
        >
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle, ${secondary}55 1px, transparent 1px)`,
              backgroundSize: '14px 14px',
            }}
          />
          <div className="relative flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-[10px] uppercase tracking-widest opacity-80 hover:opacity-100"
              style={{ color: secondary }}
            >
              ← LaPizarra
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-widest"
              style={{
                background: secondary + '22',
                color: secondary,
              }}
            >
              <LogIn className="h-3 w-3" />
              Iniciar sesión
            </Link>
          </div>

          <div className="relative flex items-end gap-4">
            {league.logo_url ? (
              <Image
                src={league.logo_url}
                alt={league.name}
                width={72}
                height={72}
                className="rounded-2xl object-cover shrink-0"
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: secondary, color: primary }}
              >
                <Trophy className="h-9 w-9" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] mb-0.5 opacity-70" style={{ color: secondary }}>
                Liga
              </p>
              <h1 className="font-display text-3xl leading-[1.05] truncate" style={{ color: secondary }}>
                {league.name}
              </h1>
            </div>
          </div>
          {league.description && (
            <p
              className="relative mt-3 text-sm leading-snug max-w-[340px] opacity-85"
              style={{ color: secondary }}
            >
              {league.description}
            </p>
          )}
          {season && (
            <span
              className="relative inline-flex items-center gap-1 mt-4 px-2 py-0.5 rounded text-[10px] uppercase tracking-widest"
              style={{ backgroundColor: secondary + '22', color: secondary }}
            >
              <Star className="h-3 w-3 fill-current" />
              {season.name}{season.is_current ? ' · actual' : ''}
            </span>
          )}
        </div>

        <div className="px-4 pt-5">
          {/* Stats strip */}
          <section className="grid grid-cols-3 gap-2 mb-6">
            <StatTile label="Equipos" value={teams.length} />
            <StatTile label="Partidos" value={fixtures.length} />
            <StatTile label="Jugados" value={finishedCount} />
          </section>

          {/* Top 5 standings */}
          {top5Standings.length > 0 && (
            <Section
              title="Top 5"
              subtitle={season?.name}
              icon={ListOrdered}
            >
              <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
                {top5Standings.map((s, i) => (
                  <div
                    key={s.team_id}
                    className={`flex items-center gap-3 px-3 py-2.5 ${
                      i < top5Standings.length - 1 ? 'border-b border-border/30' : ''
                    }`}
                  >
                    <span className="w-5 text-xs text-muted-foreground tabular-nums text-center">
                      {i + 1}
                    </span>
                    {s.logo_url ? (
                      <Image src={s.logo_url} alt={s.team_name} width={20} height={20} className="rounded shrink-0 object-cover" />
                    ) : (
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-display shrink-0"
                        style={{ backgroundColor: s.primary_color || '#D7FF00', color: s.secondary_color || '#000' }}
                      >
                        {s.team_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="flex-1 text-xs truncate">{s.team_name}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">{s.played} PJ</span>
                    <span className="font-display text-base tabular-nums w-8 text-right">{s.points}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Top scorers + assists */}
          {(top_scorers.length > 0 || top_assists.length > 0) && (
            <div className="grid grid-cols-1 gap-4 mb-6">
              {top_scorers.length > 0 && (
                <ScorerList title="Goleadores" rows={top_scorers} metricKey="goals" />
              )}
              {top_assists.length > 0 && (
                <ScorerList title="Asistencias" rows={top_assists} metricKey="assists" />
              )}
            </div>
          )}

          {/* Upcoming fixtures */}
          {upcoming.length > 0 && (
            <Section title="Próximos partidos" icon={Calendar}>
              <div className="space-y-2">
                {upcoming.map((f) => <FixtureCard key={f.id} fixture={f} />)}
              </div>
            </Section>
          )}

          {/* Recent results */}
          {recent.length > 0 && (
            <Section title="Últimos resultados" icon={Trophy}>
              <div className="space-y-2">
                {recent.map((f) => <FixtureCard key={f.id} fixture={f} compact />)}
              </div>
            </Section>
          )}

          {/* Knockout hint */}
          {fixtures.some((f) => f.stage_kind === 'knockout') && (
            <div className="bg-card border border-dashed border-border/60 rounded-xl p-4 mb-6 flex items-center gap-3">
              <Swords className="h-5 w-5 text-accent shrink-0" />
              <p className="text-xs text-muted-foreground flex-1">
                Esta liga tiene una llave de eliminatorias. Iniciá sesión para ver el bracket completo.
              </p>
            </div>
          )}

          {/* CTA */}
          <div
            className="rounded-2xl p-5 mb-3 text-center"
            style={{ backgroundColor: primary, color: secondary }}
          >
            <p className="text-sm opacity-90 mb-3">
              ¿Querés gestionar tu equipo o liga?
            </p>
            <Link
              href="/auth/signup"
              className="inline-block px-4 py-2 rounded-lg font-medium uppercase tracking-wider text-xs"
              style={{ background: secondary, color: primary }}
            >
              Crear cuenta gratis
            </Link>
          </div>

          <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mt-6">
            Vista pública · LaPizarra
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-card rounded-xl p-3 text-center border border-border/40">
      <p className="font-display text-2xl tabular-nums leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{label}</p>
    </div>
  )
}

function Section({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string
  subtitle?: string
  icon?: typeof Calendar
  children: React.ReactNode
}) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon className="h-4 w-4 text-accent" />}
        <h2 className="font-display text-lg">{title}</h2>
        {subtitle && (
          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
            <Star className="h-3 w-3 fill-current text-accent" /> {subtitle}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

function ScorerList({
  title,
  rows,
  metricKey,
}: {
  title: string
  rows: ApiScorer[]
  metricKey: 'goals' | 'assists'
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Goal className="h-4 w-4 text-accent" />
        <h2 className="font-display text-lg">{title}</h2>
      </div>
      <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
        {rows.map((s, i) => (
          <div
            key={s.player_id}
            className={`flex items-center gap-3 px-3 py-2.5 ${
              i < rows.length - 1 ? 'border-b border-border/30' : ''
            }`}
          >
            <span className="w-5 text-xs text-muted-foreground tabular-nums text-center">{i + 1}</span>
            {s.avatar_url ? (
              <Image src={s.avatar_url} alt={s.display_name ?? s.username} width={24} height={24} className="rounded-full shrink-0 object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-display shrink-0">
                {(s.display_name ?? s.username).charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs truncate">{s.display_name ?? s.username}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.team_name}</p>
            </div>
            <span className="font-display tabular-nums text-sm">{s[metricKey]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FixtureCard({ fixture: f, compact }: { fixture: ApiFixture; compact?: boolean }) {
  const dt = format(new Date(f.match_date), compact ? 'd MMM' : 'EEE d MMM · HH:mm', { locale: es })
  const isFinished = f.status === 'finished'
  return (
    <div className="block bg-card rounded-xl p-3 border border-border/30">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{dt}</span>
        <div className="flex items-center gap-1.5">
          {f.stage_name && (
            <span className="text-[10px] uppercase tracking-widest text-accent">{f.stage_name}</span>
          )}
          {f.venue_custom && !compact && (
            <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <MapPin className="h-3 w-3" /> {f.venue_custom}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <TeamPill name={f.home_name} logo={f.home_logo} primary={f.home_primary} secondary={f.home_secondary} align="right" />
        <div className="px-2 shrink-0">
          {isFinished && f.goals_for != null && f.goals_against != null ? (
            <span className="font-display text-base tabular-nums">{f.goals_for} – {f.goals_against}</span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">vs</span>
          )}
        </div>
        <TeamPill name={f.away_name} logo={f.away_logo} primary={f.away_primary} secondary={f.away_secondary} align="left" />
      </div>
    </div>
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
