import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { features } from '@/lib/features'
import { LeagueHeader } from '@/components/league-header'
import { LeagueTabs } from '@/components/league-tabs'
import { SettingsForm } from './settings-form'

type Params = Promise<{ slug: string }>

export default async function LeagueSettingsPage({ params }: { params: Params }) {
  if (!features.leagues) redirect('/home')
  const { slug } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: league } = await supabase
    .from('leagues')
    .select('id, slug, name, description, logo_url, primary_color, secondary_color, visibility, join_mode, owner_id')
    .eq('slug', slug)
    .is('deleted_at', null)
    .maybeSingle()
  if (!league) notFound()

  const { data: canEdit } = await supabase.rpc('has_permission', {
    p_permission: 'league.edit',
    p_league: league.id,
    p_team: null,
    p_match: null,
  })
  if (!canEdit) redirect(`/league/${league.slug}`)

  const isOwner = league.owner_id === user.id

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
          isAdmin
        />

        <div className="mb-5">
          <h1 className="font-display text-2xl">Configuración</h1>
        </div>

        <SettingsForm
          league={{
            id: league.id,
            slug: league.slug,
            name: league.name,
            description: league.description,
            logo_url: league.logo_url,
            primary_color: league.primary_color,
            secondary_color: league.secondary_color,
            visibility: league.visibility as 'public' | 'unlisted' | 'private',
            join_mode: league.join_mode as 'open' | 'request' | 'invite_only',
          }}
          isOwner={isOwner}
        />
      </div>

      <LeagueTabs slug={league.slug} />
    </div>
  )
}
