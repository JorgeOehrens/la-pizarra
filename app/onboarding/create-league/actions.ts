'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export async function createLeague(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'No autenticado' }
  }

  const name = String(formData.get('name') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim() || null
  const visibility = String(formData.get('visibility') ?? 'private')
  const joinMode = String(formData.get('join_mode') ?? 'invite_only')
  const primaryColor = String(formData.get('primary_color') ?? '#16a34a')
  const secondaryColor = String(formData.get('secondary_color') ?? '#ffffff')
  const logoFile = formData.get('logo') as File | null

  if (!name) return { error: 'El nombre de la liga es obligatorio' }

  const slug = generateSlug(name)

  // 1. Optional logo upload — reuses team-logos bucket scoped by user id.
  let logoUrl: string | null = null
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop() ?? 'png'
    const logoId = crypto.randomUUID()
    const path = `${user.id}/league-${logoId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(path, logoFile, { upsert: true })

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from('team-logos').getPublicUrl(path)
      logoUrl = publicUrl
    }
  }

  // 2. Atomic create via SECURITY DEFINER RPC.
  const { data, error } = await supabase.rpc('create_league_for_user', {
    p_name: name,
    p_slug: slug,
    p_visibility: visibility,
    p_join_mode: joinMode,
    p_logo_url: logoUrl,
    p_primary_color: primaryColor,
    p_secondary_color: secondaryColor,
    p_description: description,
  })

  if (error) {
    return { error: error.message }
  }

  const created = (data ?? null) as { league_id: string; slug: string } | null
  redirect(created?.slug ? `/league/${created.slug}` : '/home')
}
