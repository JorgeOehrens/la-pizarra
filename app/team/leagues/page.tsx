import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { features } from '@/lib/features'
import { getActiveTeamMembership } from '@/lib/team'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { LeaguesView } from './leagues-view'

export default async function TeamLeaguesPage() {
  if (!features.leagues) redirect('/team')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const membership = await getActiveTeamMembership(supabase, user.id)
  if (!membership) redirect('/team-select')

  const team = membership.teams
  const isAdmin = membership.role === 'admin'

  // Current participations for the active team.
  const { data: rawParticipations } = await supabase
    .from('league_teams')
    .select(`
      id,
      status,
      leagues:league_id (
        id, name, slug, logo_url, primary_color, secondary_color
      )
    `)
    .eq('team_id', team.id)
    .in('status', ['pending', 'active'])
    .order('joined_at', { ascending: false })

  const participations = (rawParticipations ?? []).map((p) => ({
    id: p.id,
    status: p.status as 'pending' | 'active',
    league: (Array.isArray(p.leagues) ? p.leagues[0] : p.leagues) as {
      id: string
      name: string
      slug: string
      logo_url: string | null
      primary_color: string
      secondary_color: string
    } | null,
  }))

  // Discoverable leagues: visible per RLS, exclude ones we already participate in.
  const participatingIds = new Set(
    participations.map((p) => p.league?.id).filter(Boolean) as string[],
  )

  const { data: rawLeagues } = await supabase
    .from('leagues')
    .select('id, name, slug, logo_url, primary_color, secondary_color, visibility, join_mode')
    .is('deleted_at', null)
    .in('visibility', ['public', 'unlisted'])
    .in('join_mode', ['open', 'request'])
    .order('name')
    .limit(50)

  const discoverable = (rawLeagues ?? [])
    .filter((l) => !participatingIds.has(l.id))
    .map((l) => ({
      ...l,
      visibility: l.visibility as 'public' | 'unlisted' | 'private',
      join_mode: l.join_mode as 'open' | 'request' | 'invite_only',
    }))

  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 pt-4 pb-24 max-w-lg mx-auto">
        <header className="flex items-center justify-between mb-6">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm">Equipo</span>
          </Link>
        </header>

        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
            {team.name}
          </p>
          <h1 className="font-display text-2xl">Ligas</h1>
        </div>

        <LeaguesView
          teamId={team.id}
          participations={participations}
          discoverable={discoverable}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  )
}
