import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SeasonsView } from './seasons-view'

type Params = Promise<{ slug: string }>

export default async function LeagueSeasonsPage({ params }: { params: Params }) {
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
    .select('id, name, starts_on, ends_on, is_current, created_at')
    .eq('league_id', league.id)
    .order('is_current', { ascending: false })
    .order('starts_on', { ascending: false, nullsFirst: false })

  const seasons = (rawSeasons ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    starts_on: s.starts_on,
    ends_on: s.ends_on,
    is_current: !!s.is_current,
    created_at: s.created_at,
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

        <div className="mb-5">
          <h1 className="font-display text-2xl">Temporadas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Organizá la liga en bloques temporales (Apertura, Clausura, Anual…). Solo puede haber una temporada actual.
          </p>
        </div>

        <SeasonsView leagueId={league.id} slug={league.slug} seasons={seasons} isAdmin={isAdmin} />
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}
