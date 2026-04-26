import type { SupabaseClient, User } from '@supabase/supabase-js'

/**
 * Multi-tenant active context resolver.
 *
 * Builds the (user, profile, activeLeague, activeTeam, roles) tuple
 * the rest of the app uses to render a screen. Backwards-compatible
 * with the team-only flow: when a user has no league memberships,
 * the result mirrors what `getActiveTeamMembership` would have
 * returned, plus an explicit `activeLeague: null`.
 *
 * Resolution order:
 *  1. Read profiles.active_league_id and profiles.active_team_id.
 *  2. Validate each pointer against an active membership; null out
 *     stale values.
 *  3. If only one team membership exists, auto-select it.
 *  4. If only one league membership exists and no team in that
 *     league, auto-select the league.
 *  5. Otherwise return null pointers and let the caller decide
 *     where to redirect (typically /context-select).
 */

export type ActiveLeague = {
  id: string
  name: string
  slug: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  role: 'league_owner' | 'league_admin' | 'league_referee' | 'league_viewer'
}

export type ActiveTeam = {
  id: string
  name: string
  logo_url: string | null
  primary_color: string
  secondary_color: string
  // canonical role from effective_team_members (admin → team_manager)
  role: 'team_manager' | 'coach' | 'captain' | 'player' | 'team_viewer'
  jersey_number: number | null
  position: string | null
}

export type ActiveContext = {
  user: User
  profile: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
    platform_role: 'platform_admin' | 'support' | null
  }
  activeLeague: ActiveLeague | null
  activeTeam: ActiveTeam | null
  /** All league memberships (used by the switcher). */
  leagueCount: number
  /** All team memberships (used by the switcher). */
  teamCount: number
}

const PROFILE_SELECT = `
  id,
  username,
  display_name,
  avatar_url,
  platform_role,
  active_league_id,
  active_team_id
` as const

const TEAM_MEMBERSHIP_SELECT = `
  team_id,
  jersey_number,
  position,
  teams (
    id,
    name,
    logo_url,
    primary_color,
    secondary_color
  )
` as const

const LEAGUE_MEMBERSHIP_SELECT = `
  league_id,
  role,
  leagues (
    id,
    name,
    slug,
    logo_url,
    primary_color,
    secondary_color
  )
` as const

type RawTeamMembership = {
  team_id: string
  jersey_number: number | null
  position: string | null
  teams: {
    id: string
    name: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
  } | null
}

type RawLeagueMembership = {
  league_id: string
  role: ActiveLeague['role']
  leagues: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    primary_color: string
    secondary_color: string
  } | null
}

export async function resolveActiveContext(
  supabase: SupabaseClient,
  user: User,
): Promise<ActiveContext | null> {
  // 1. Profile + pointers
  const { data: profile } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('id', user.id)
    .maybeSingle()

  if (!profile) return null

  // 2. All memberships (cheap; usually a handful of rows).
  const [leagueRes, teamRes] = await Promise.all([
    supabase
      .from('league_members')
      .select(LEAGUE_MEMBERSHIP_SELECT)
      .eq('user_id', user.id)
      .eq('status', 'active'),
    supabase
      .from('team_members')
      .select(TEAM_MEMBERSHIP_SELECT)
      .eq('user_id', user.id)
      .eq('status', 'active'),
  ])

  const leagues = (leagueRes.data ?? []) as unknown as RawLeagueMembership[]
  const teams = (teamRes.data ?? []) as unknown as RawTeamMembership[]

  // 3. Resolve active league
  let activeLeague: ActiveLeague | null = null
  if (profile.active_league_id) {
    const m = leagues.find((l) => l.league_id === profile.active_league_id)
    if (m?.leagues) {
      activeLeague = { ...m.leagues, role: m.role }
    }
  }
  if (!activeLeague && leagues.length === 1 && leagues[0].leagues) {
    const m = leagues[0]
    activeLeague = { ...m.leagues!, role: m.role }
  }

  // 4. Resolve active team
  // Active team role is canonical (mapped via effective_team_members).
  let activeTeam: ActiveTeam | null = null

  const resolveTeamRole = async (teamId: string) => {
    const { data } = await supabase
      .from('effective_team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle()
    return (data?.role ?? null) as ActiveTeam['role'] | null
  }

  if (profile.active_team_id) {
    const m = teams.find((t) => t.team_id === profile.active_team_id)
    if (m?.teams) {
      const role = await resolveTeamRole(m.team_id)
      if (role) {
        activeTeam = {
          id: m.teams.id,
          name: m.teams.name,
          logo_url: m.teams.logo_url,
          primary_color: m.teams.primary_color,
          secondary_color: m.teams.secondary_color,
          role,
          jersey_number: m.jersey_number,
          position: m.position,
        }
      }
    }
  }
  if (!activeTeam && teams.length === 1 && teams[0].teams) {
    const m = teams[0]
    const role = await resolveTeamRole(m.team_id)
    if (role) {
      activeTeam = {
        id: m.teams!.id,
        name: m.teams!.name,
        logo_url: m.teams!.logo_url,
        primary_color: m.teams!.primary_color,
        secondary_color: m.teams!.secondary_color,
        role,
        jersey_number: m.jersey_number,
        position: m.position,
      }
      // Persist the auto-selection (best-effort; ignore failure).
      await supabase.rpc('set_active_context', {
        p_league_id: activeLeague?.id ?? profile.active_league_id ?? null,
        p_team_id: m.team_id,
      })
    }
  }

  return {
    user,
    profile: {
      id: profile.id,
      username: profile.username,
      display_name: profile.display_name,
      avatar_url: profile.avatar_url,
      platform_role: profile.platform_role,
    },
    activeLeague,
    activeTeam,
    leagueCount: leagues.length,
    teamCount: teams.length,
  }
}

/**
 * Helper for pages that absolutely need an active context.
 * Returns the redirect target if the user must pick one.
 */
export function pickRedirectForContext(ctx: ActiveContext | null): string | null {
  if (!ctx) return '/auth/login'

  // No memberships at all → onboarding hub
  if (ctx.leagueCount === 0 && ctx.teamCount === 0) return '/onboarding'

  // Multiple options and no active selection → switcher
  if (!ctx.activeLeague && !ctx.activeTeam) {
    if (ctx.leagueCount + ctx.teamCount > 0) return '/context-select'
  }

  return null
}
