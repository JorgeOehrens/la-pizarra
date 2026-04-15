'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { error: 'No autenticado' }
  }

  const name = (formData.get('name') as string).trim()
  const primaryColor = formData.get('primary_color') as string
  const secondaryColor = formData.get('secondary_color') as string
  const logoFile = formData.get('logo') as File | null

  if (!name) return { error: 'El nombre del equipo es obligatorio' }

  const slug = generateSlug(name)

  // 1. Subir logo primero si hay uno (antes de crear el equipo)
  let logoUrl: string | null = null
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop() ?? 'png'
    // Usamos un path temporal con UUID para evitar colisiones
    const logoId = crypto.randomUUID()
    const path = `${user.id}/${logoId}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('team-logos')
      .upload(path, logoFile, { upsert: true })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('team-logos')
        .getPublicUrl(path)
      logoUrl = publicUrl
    }
  }

  // 2. Crear equipo via RPC con security definer (bypasea RLS, usa auth.uid() internamente)
  const { data: teamData, error: teamError } = await supabase
    .rpc('create_team_for_user', {
      p_name: name,
      p_slug: slug,
      p_primary_color: primaryColor || '#16a34a',
      p_secondary_color: secondaryColor || '#ffffff',
      p_logo_url: logoUrl,
    })

  if (teamError) {
    return { error: teamError.message }
  }

  redirect('/home')
}
