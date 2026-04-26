'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function setActiveContext(
  leagueId: string | null,
  teamId: string | null,
): Promise<void> {
  const supabase = await createClient()
  await supabase.rpc('set_active_context', {
    p_league_id: leagueId,
    p_team_id: teamId,
  })
  // If a team was picked, send the user to the home dashboard;
  // a league-only context lands on the league dashboard placeholder.
  redirect(teamId ? '/home' : leagueId ? `/league/${leagueId}` : '/home')
}

/** Bound forms: pick a team (clears the league pointer). */
export async function pickTeam(teamId: string): Promise<void> {
  await setActiveContext(null, teamId)
}

/** Bound forms: pick a league (clears the team pointer). */
export async function pickLeague(leagueId: string): Promise<void> {
  await setActiveContext(leagueId, null)
}
