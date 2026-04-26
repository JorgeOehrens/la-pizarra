'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult<T = unknown> = { ok: true; data?: T } | { error: string }

export async function inviteTeamToLeague(
  leagueId: string,
  teamId: string,
  seasonId: string | null,
  slug: string,
): Promise<ActionResult<{ league_team_id: string }>> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('invite_team_to_league', {
    p_league_id: leagueId,
    p_team_id: teamId,
    p_season_id: seasonId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}/teams`)
  return { ok: true, data: data as { league_team_id: string } }
}

export async function approveTeamRequest(
  requestId: string,
  seasonId: string | null,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('approve_team_in_league', {
    p_request_id: requestId,
    p_season_id: seasonId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}/teams`)
  return { ok: true }
}

export async function rejectTeamRequest(
  requestId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('reject_team_in_league', {
    p_request_id: requestId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}/teams`)
  return { ok: true }
}

export async function withdrawTeamFromLeague(
  leagueTeamId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('withdraw_team_from_league', {
    p_league_team_id: leagueTeamId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) return { error: (data as { error: string }).error }
  revalidatePath(`/league/${slug}/teams`)
  return { ok: true }
}
