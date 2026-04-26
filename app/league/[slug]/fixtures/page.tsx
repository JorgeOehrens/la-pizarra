import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Download, Star } from 'lucide-react'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SeasonSelect } from '@/components/season-select'

type Params = Promise<{ slug: string }>
type Search = Promise<{ season?: string }>

export default async function LeagueFixturesPage({
  params,
  searchParams,
}: {
  params: Params
  searchParams: Search
}) {
  if (!features.leagues) redirect('/home')
  const [{ slug }, search] = await Promise.all([params, searchParams])

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

  const { data: membership } = await supabase
    .from('league_members')
    .select('role, status')
    .eq('league_id', league.id)
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle()
  const isAdmin = membership?.role === 'league_owner' || membership?.role === 'league_admin'

  // All seasons for the dropdown; pick selected one (URL > current > none).
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

  const { data: rows } = await supabase.rpc('list_league_fixtures', {
    p_league_id: league.id,
    p_season_id: selectedSeasonId,
  })

  type FixtureRow = {
    id: string
    match_date: string
    status: string
    goals_for: number | null
    goals_against: number | null
    venue_custom: string | null
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

  const fixtures = (rows ?? []) as FixtureRow[]

  // Group by stage (or "Sin fase").
  const grouped = new Map<
    string,
    { name: string; sort: number; rows: FixtureRow[] }
  >()
  for (const r of fixtures) {
    const key = r.stage_id ?? '__none'
    const name = r.stage_name ?? 'Sin fase'
    const sort = r.stage_sort ?? 9999
    if (!grouped.has(key)) {
      grouped.set(key, { name, sort, rows: [] })
    }
    grouped.get(key)!.rows.push(r)
  }
  const groups = Array.from(grouped.values()).sort((a, b) => a.sort - b.sort)

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

        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="font-display text-2xl">Fixtures</h1>
              {selectedSeason?.is_current && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-accent/15 text-accent px-2 py-0.5 rounded">
                  <Star className="h-3 w-3 fill-current" /> Actual
                </span>
              )}
            </div>
          </div>
          {fixtures.length > 0 && (
            <Link
              href={`/league/${league.slug}/fixtures/print${
                selectedSeasonId ? `?season=${selectedSeasonId}` : ''
              }`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-card border border-border/40 hover:border-border px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shrink-0"
            >
              <Download className="h-3.5 w-3.5" />
              PDF
            </Link>
          )}
        </div>

        {allSeasons.length > 0 && (
          <SeasonSelect
            seasons={allSeasons}
            selectedId={selectedSeasonId}
            className="mb-5"
          />
        )}

        {fixtures.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border/40">
            <Calendar className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              {selectedSeason
                ? `No hay partidos en ${selectedSeason.name}.`
                : allSeasons.length === 0
                  ? 'Sin temporada creada.'
                  : 'Sin partidos para mostrar.'}
            </p>
            <Link
              href={
                selectedSeasonId
                  ? `/league/${league.slug}/seasons/${selectedSeasonId}`
                  : `/league/${league.slug}/seasons`
              }
              className="text-accent text-sm hover:underline"
            >
              Ir al detalle de temporada →
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((g, i) => (
              <section key={i}>
                <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  {g.name}
                </h2>
                <div className="space-y-2">
                  {g.rows.map((f) => (
                    <FixtureRowCompact key={f.id} fixture={f} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}

function FixtureRowCompact({
  fixture: f,
}: {
  fixture: {
    id: string
    match_date: string
    status: string
    goals_for: number | null
    goals_against: number | null
    venue_custom: string | null
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
}) {
  const dt = format(new Date(f.match_date), 'd MMM · HH:mm', { locale: es })
  const isFinished = f.status === 'finished'

  return (
    <Link
      href={`/matches/${f.id}`}
      className="block bg-card rounded-lg p-3 border border-border/30 hover:border-border"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{dt}</span>
        {f.venue_custom && <span className="text-[10px] text-muted-foreground">{f.venue_custom}</span>}
      </div>
      <div className="flex items-center gap-2">
        <TeamPill name={f.home_name} logo={f.home_logo} primary={f.home_primary} secondary={f.home_secondary} align="right" />
        <div className="px-2">
          {isFinished && f.goals_for != null && f.goals_against != null ? (
            <span className="font-display text-base tabular-nums">
              {f.goals_for} – {f.goals_against}
            </span>
          ) : (
            <span className="text-xs uppercase tracking-widest text-muted-foreground">vs</span>
          )}
        </div>
        <TeamPill name={f.away_name} logo={f.away_logo} primary={f.away_primary} secondary={f.away_secondary} align="left" />
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
  if (!name) {
    return <div className="flex-1 text-sm text-muted-foreground">—</div>
  }
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
