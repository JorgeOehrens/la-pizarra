'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { error: string }

export async function acceptLeagueInvitation(
  leagueTeamId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('accept_league_invitation', {
    p_league_team_id: leagueTeamId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) {
    return { error: (data as { error: string }).error }
  }
  revalidatePath('/team/leagues')
  return { ok: true }
}

export async function withdrawFromLeague(
  leagueTeamId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('withdraw_team_from_league', {
    p_league_team_id: leagueTeamId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) {
    return { error: (data as { error: string }).error }
  }
  revalidatePath('/team/leagues')
  return { ok: true }
}

export async function requestToJoinLeague(
  leagueId: string,
  teamId: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('request_team_in_league', {
    p_league_id: leagueId,
    p_team_id: teamId,
  })
  if (error) return { error: error.message }
  if ((data as { error?: string })?.error) {
    return { error: (data as { error: string }).error }
  }
  revalidatePath('/team/leagues')
  return { ok: true }
}
