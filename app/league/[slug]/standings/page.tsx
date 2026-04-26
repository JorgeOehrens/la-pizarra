import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Star } from 'lucide-react'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SeasonSelect } from '@/components/season-select'

type Params = Promise<{ slug: string }>
type Search = Promise<{ season?: string }>

export default async function LeagueStandingsPage({
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

  const { data: rows } = selectedSeasonId
    ? await supabase
        .from('season_standings')
        .select('team_id, team_name, logo_url, primary_color, secondary_color, played, wins, draws, losses, goals_for, goals_against, goal_difference, points')
        .eq('season_id', selectedSeasonId)
    : { data: [] as Array<Record<string, never>> }

  type Row = {
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

  const ordered = ((rows ?? []) as Row[]).slice().sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goal_difference !== a.goal_difference) return b.goal_difference - a.goal_difference
    if (b.goals_for !== a.goals_for) return b.goals_for - a.goals_for
    return a.team_name.localeCompare(b.team_name)
  })

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
            <h1 className="font-display text-2xl">Tabla de posiciones</h1>
            {selectedSeason?.is_current && (
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest bg-accent/15 text-accent px-2 py-0.5 rounded">
                <Star className="h-3 w-3 fill-current" /> Actual
              </span>
            )}
          </div>
        </div>

        {allSeasons.length > 0 && (
          <SeasonSelect
            seasons={allSeasons}
            selectedId={selectedSeasonId}
            className="mb-5"
          />
        )}

        {!selectedSeason ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border/40">
            <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">Sin temporada activa.</p>
            <Link
              href={`/league/${league.slug}/seasons`}
              className="text-accent text-sm hover:underline"
            >
              Crear o activar una temporada →
            </Link>
          </div>
        ) : ordered.length === 0 ? (
          <div className="bg-card rounded-xl p-6 text-center border border-border/40">
            <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aún no hay equipos en esta temporada o ningún partido se jugó.
            </p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border/40 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border/40">
                  <th className="text-left py-2 px-3 w-10">#</th>
                  <th className="text-left py-2 px-1">Equipo</th>
                  <th className="text-center py-2 px-1.5">PJ</th>
                  <th className="text-center py-2 px-1.5">G</th>
                  <th className="text-center py-2 px-1.5">E</th>
                  <th className="text-center py-2 px-1.5">P</th>
                  <th className="text-center py-2 px-1.5">DG</th>
                  <th className="text-right py-2 px-3">Pts</th>
                </tr>
              </thead>
              <tbody>
                {ordered.map((r, i) => (
                  <tr
                    key={r.team_id}
                    className="border-b border-border/20 last:border-0"
                  >
                    <td className="py-2.5 px-3 text-xs text-muted-foreground">{i + 1}</td>
                    <td className="py-2.5 px-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {r.logo_url ? (
                          <Image
                            src={r.logo_url}
                            alt={r.team_name}
                            width={20}
                            height={20}
                            className="rounded shrink-0 object-cover"
                          />
                        ) : (
                          <div
                            className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-display shrink-0"
                            style={{ backgroundColor: r.primary_color || '#D7FF00', color: r.secondary_color || '#000' }}
                          >
                            {r.team_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate text-xs">{r.team_name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-1.5 text-center text-xs tabular-nums">{r.played}</td>
                    <td className="py-2.5 px-1.5 text-center text-xs tabular-nums">{r.wins}</td>
                    <td className="py-2.5 px-1.5 text-center text-xs tabular-nums">{r.draws}</td>
                    <td className="py-2.5 px-1.5 text-center text-xs tabular-nums">{r.losses}</td>
                    <td className="py-2.5 px-1.5 text-center text-xs tabular-nums">
                      {r.goal_difference > 0 ? `+${r.goal_difference}` : r.goal_difference}
                    </td>
                    <td className="py-2.5 px-3 text-right font-display text-base tabular-nums">{r.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-muted-foreground mt-3 text-center">
          Sólo cuentan partidos finalizados de fases regulares o de grupos.
        </p>
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}
