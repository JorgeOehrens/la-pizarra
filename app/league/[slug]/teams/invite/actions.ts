'use server'

import { createClient } from '@/lib/supabase/server'

export type SearchTeam = {
  id: string
  name: string
  slug: string | null
  logo_url: string | null
  primary_color: string
  secondary_color: string
  member_count: number
}

export async function searchTeams(
  leagueId: string,
  query: string,
): Promise<{ data: SearchTeam[] } | { error: string }> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('search_teams_for_league_invite', {
    p_league_id: leagueId,
    p_query: query,
    p_limit: 20,
  })
  if (error) return { error: error.message }
  return {
    data: (data ?? []).map((t: SearchTeam) => ({
      ...t,
      member_count: Number(t.member_count ?? 0),
    })),
  }
}
