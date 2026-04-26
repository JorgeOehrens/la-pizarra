'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> = { ok: true; data?: T } | { error: string }

export async function createSeason(
  leagueId: string,
  slug: string,
  payload: {
    name: string
    starts_on: string | null
    ends_on: string | null
    is_current: boolean
  },
): Promise<ActionResult<{ season_id: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('create_season', {
    p_league_id: leagueId,
    p_name: payload.name,
    p_starts_on: payload.starts_on,
    p_ends_on: payload.ends_on,
    p_is_current: payload.is_current,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}`)
  revalidatePath(`/league/${slug}/seasons`)
  return { ok: true, data: data as { season_id: string } }
}

export async function setCurrentSeason(
  seasonId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('set_current_season', {
    p_season_id: seasonId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}/seasons`)
  return { ok: true }
}

export async function deleteSeason(
  seasonId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('delete_season', {
    p_season_id: seasonId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}/seasons`)
  return { ok: true }
}
