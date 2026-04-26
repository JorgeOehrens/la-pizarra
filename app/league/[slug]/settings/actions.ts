'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { error: string }

export async function updateLeagueSettings(
  leagueId: string,
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient()

  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const visibility = String(formData.get('visibility') ?? '')
  const joinMode = String(formData.get('join_mode') ?? '')
  const primaryColor = String(formData.get('primary_color') ?? '')
  const secondaryColor = String(formData.get('secondary_color') ?? '')
  const logoFile = formData.get('logo') as File | null

  // Optional logo replacement.
  let logoUrl: string | null = null
  let logoChanged = false
  if (logoFile && logoFile.size > 0) {
    logoChanged = true
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { error: 'No autenticado' }

    const ext = logoFile.name.split('.').pop() ?? 'png'
    const path = `${user.id}/league-${leagueId}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(path, logoFile, { upsert: true })

    if (uploadError) return { error: uploadError.message }
    logoUrl = supabase.storage.from('team-logos').getPublicUrl(path).data.publicUrl
  }

  const { data, error } = await supabase.rpc('update_league', {
    p_league_id: leagueId,
    p_name: name || null,
    p_description: description,
    p_logo_url: logoChanged ? logoUrl : null,
    p_primary_color: primaryColor || null,
    p_secondary_color: secondaryColor || null,
    p_visibility: visibility || null,
    p_join_mode: joinMode || null,
  })

  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }

  revalidatePath(`/league/${slug}`)
  revalidatePath(`/league/${slug}/settings`)
  return { ok: true }
}

export async function deleteLeague(
  leagueId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('delete_league', {
    p_league_id: leagueId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  redirect('/home')
}
