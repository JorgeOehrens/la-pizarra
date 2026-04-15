import type { SupabaseClient } from '@supabase/supabase-js'

export type TeamMembership = {
  team_id: string
  role: 'admin' | 'player'
  jersey_number: number | null
  position: string | null
  teams: {
    id: string
    name: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
    created_at: string
  }
}

const TEAM_MEMBERSHIP_SELECT = `
  team_id,
  role,
  jersey_number,
  position,
  teams (
    id,
    name,
    logo_url,
    primary_color,
    secondary_color,
    created_at
  )
` as const

/**
 * Returns the active team membership for the given user.
 *
 * Strategy:
 * 1. Read profiles.active_team_id
 * 2. If set, fetch that specific team_members row
 * 3. If not set, find the first active membership and auto-set active_team_id
 *    (handles existing users who pre-date the active_team_id column)
 * 4. If no memberships at all → return null → caller redirects to /team-select
 */
export async function getActiveTeamMembership(
  supabase: SupabaseClient,
  userId: string
): Promise<TeamMembership | null> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('active_team_id')
    .eq('id', userId)
    .single()

  // If active_team_id is already set, fetch it directly
  if (profile?.active_team_id) {
    const { data: membership } = await supabase
      .from('team_members')
      .select(TEAM_MEMBERSHIP_SELECT)
      .eq('user_id', userId)
      .eq('team_id', profile.active_team_id)
      .eq('status', 'active')
      .maybeSingle()

    if (membership?.teams) return membership as unknown as TeamMembership
    // active_team_id points to a team the user is no longer in — fall through
  }

  // Fallback: find all active memberships and auto-select
  const { data: memberships } = await supabase
    .from('team_members')
    .select(TEAM_MEMBERSHIP_SELECT)
    .eq('user_id', userId)
    .eq('status', 'active')

  if (!memberships?.length) return null

  // Multiple teams → don't auto-select, force the team-select screen
  if (memberships.length > 1) return null

  // Single team → auto-set active_team_id and return
  const first = memberships[0]
  if (!first.teams) return null

  await supabase
    .from('profiles')
    .update({ active_team_id: first.team_id })
    .eq('id', userId)

  return first as unknown as TeamMembership
}
