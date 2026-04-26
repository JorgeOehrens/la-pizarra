import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { InviteTeamForm } from './invite-form'

type Params = Promise<{ slug: string }>

export default async function InviteTeamsPage({ params }: { params: Params }) {
  if (!features.leagues) redirect('/home')
  const { slug } = await params

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

  // Authorization check via has_permission RPC.
  const { data: canInvite } = await supabase.rpc('has_permission', {
    p_permission: 'league.invite_team',
    p_league: league.id,
    p_team: null,
    p_match: null,
  })

  if (!canInvite) redirect(`/league/${league.slug}/teams`)

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
          backHref={`/league/${league.slug}/teams`}
          backLabel="Equipos"
          isAdmin
        />

        <div className="mb-5">
          <h1 className="font-display text-2xl">Invitar equipos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Buscá equipos por nombre y mandales una invitación. El manager del equipo confirma.
          </p>
        </div>

        <InviteTeamForm leagueId={league.id} slug={league.slug} />
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}
