import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * The single source of truth for the permission catalogue.
 * Mirrors the strings handled by public.has_permission() in
 * supabase/migrations/20260425000005_rls_helpers_and_permissions.sql.
 *
 * Adding a new permission means: update both this list AND the
 * has_permission() function in SQL.
 */
export const PERMISSIONS = [
  // League scope
  'league.read',
  'league.edit',
  'league.delete',
  'league.invite_admin',
  'league.invite_team',
  'league.create_season',
  'league.review_team_requests',
  'league.manage_seasons',

  // Team scope
  'team.read',
  'team.edit',
  'team.delete',
  'team.invite',
  'team.review_requests',
  'team.promote_member',
  'team.change_join_mode',
  'team.assign_jersey',
  'team.join_league',

  // Match scope
  'match.create',
  'match.edit',
  'match.register_events',
  'match.delete',

  // Attendance
  'attendance.set_self',
  'attendance.set_other',

  // Finance (team-scoped)
  'finance.view_own',
  'finance.view_aggregate',
  'finance.create_charge',
  'finance.confirm_payment',

  // Stats
  'stats.read_team',
  'stats.adjust',
] as const

export type Permission = (typeof PERMISSIONS)[number]

export type PermissionContext = {
  leagueId?: string | null
  teamId?: string | null
  matchId?: string | null
}

/**
 * Resolve a single permission via the SQL function.
 * Always returns a boolean — on RPC error, returns false (safe default).
 */
export async function hasPermission(
  supabase: SupabaseClient,
  permission: Permission,
  ctx: PermissionContext = {}
): Promise<boolean> {
  const { data, error } = await supabase.rpc('has_permission', {
    p_permission: permission,
    p_league: ctx.leagueId ?? null,
    p_team: ctx.teamId ?? null,
    p_match: ctx.matchId ?? null,
  })

  if (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[permissions] has_permission RPC failed', error)
    }
    return false
  }

  return Boolean(data)
}

/**
 * Convenience guard for Server Actions / RPC entry points.
 * Throws a tagged Error so callers can route to /403.
 */
export async function requirePermission(
  supabase: SupabaseClient,
  permission: Permission,
  ctx: PermissionContext = {}
): Promise<void> {
  const ok = await hasPermission(supabase, permission, ctx)
  if (!ok) {
    const err = new Error(`forbidden:${permission}`)
    ;(err as Error & { code?: string }).code = 'forbidden'
    throw err
  }
}

/**
 * Resolve many permissions in parallel for the same context.
 * Used by <PermissionsProvider> to prefetch a UI affordance map.
 */
export async function resolvePermissions<P extends Permission>(
  supabase: SupabaseClient,
  permissions: readonly P[],
  ctx: PermissionContext = {}
): Promise<Record<P, boolean>> {
  const entries = await Promise.all(
    permissions.map(
      async (p) => [p, await hasPermission(supabase, p, ctx)] as const,
    ),
  )
  return Object.fromEntries(entries) as Record<P, boolean>
}
