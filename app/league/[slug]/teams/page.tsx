import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import Link from 'next/link'
import { Plus, Trophy } from 'lucide-react'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { TeamsListClient } from './teams-list-client'

type Params = Promise<{ slug: string }>

export default async function LeagueTeamsPage({ params }: { params: Params }) {
  if (!features.leagues) redirect('/home')
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: league } = await supabase
    .from('leagues')
    .select('id, name, slug, logo_url, primary_color, secondary_color, join_mode, visibility')
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

  // Active and pending participating teams.
  const { data: rawParticipations } = await supabase
    .from('league_teams')
    .select(`
      id,
      status,
      season_id,
      joined_at,
      teams:team_id (
        id, name, slug, logo_url, primary_color, secondary_color
      )
    `)
    .eq('league_id', league.id)
    .in('status', ['pending', 'active'])
    .order('joined_at', { ascending: false })

  const participations = (rawParticipations ?? []).map((p) => ({
    id: p.id,
    status: p.status as 'pending' | 'active',
    season_id: p.season_id,
    joined_at: p.joined_at,
    team: (Array.isArray(p.teams) ? p.teams[0] : p.teams) as {
      id: string
      name: string
      slug: string | null
      logo_url: string | null
      primary_color: string
      secondary_color: string
    } | null,
  }))

  // Pending join requests (only for admins).
  const requestsPromise = isAdmin
    ? supabase
        .from('league_join_requests')
        .select(`
          id,
          created_at,
          team_id,
          requested_by,
          teams:team_id (id, name, logo_url, primary_color, secondary_color),
          profiles:requested_by (display_name, username)
        `)
        .eq('league_id', league.id)
        .eq('status', 'pending')
        .order('created_at')
    : Promise.resolve({ data: [], error: null })

  const { data: rawRequests } = await requestsPromise

  const requests = (rawRequests ?? []).map((r) => ({
    id: r.id,
    created_at: r.created_at,
    team: (Array.isArray(r.teams) ? r.teams[0] : r.teams) as {
      id: string
      name: string
      logo_url: string | null
      primary_color: string
      secondary_color: string
    } | null,
    requester: (Array.isArray(r.profiles) ? r.profiles[0] : r.profiles) as {
      display_name: string | null
      username: string
    } | null,
  }))

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

        <div className="mb-5 flex items-end justify-between gap-3">
          <h1 className="font-display text-2xl">Equipos participantes</h1>
          {isAdmin && (
            <Link
              href={`/league/${league.slug}/teams/invite`}
              className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground px-3 py-1.5 rounded-lg text-xs uppercase tracking-wider shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              Invitar
            </Link>
          )}
        </div>

        {/* Pending requests */}
        {isAdmin && requests.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Solicitudes pendientes ({requests.length})
            </h2>
            <TeamsListClient
              kind="requests"
              slug={league.slug}
              items={requests.map((r) => ({
                id: r.id,
                team: r.team,
                requester: r.requester,
                created_at: r.created_at,
              }))}
            />
          </section>
        )}

        {/* Participating teams */}
        <section>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Participantes ({participations.length})
          </h2>

          {participations.length === 0 ? (
            <div className="bg-card rounded-xl p-6 text-center border border-border/40">
              <Trophy className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Sin equipos en la liga aún</p>
              {isAdmin && (
                <Link
                  href={`/league/${league.slug}/teams/invite`}
                  className="inline-flex items-center gap-1.5 text-accent text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Invitar el primer equipo
                </Link>
              )}
            </div>
          ) : (
            <TeamsListClient
              kind="participations"
              slug={league.slug}
              isAdmin={isAdmin}
              items={participations.map((p) => ({
                id: p.id,
                team: p.team,
                status: p.status,
                joined_at: p.joined_at,
              }))}
            />
          )}
        </section>
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}

