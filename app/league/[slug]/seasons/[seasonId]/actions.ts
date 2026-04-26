'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { unwrapRpc, type ActionResult } from '@/lib/rpc'

function bumpSeasonPaths(slug: string, seasonId: string) {
  revalidatePath(`/league/${slug}`)
  revalidatePath(`/league/${slug}/seasons/${seasonId}`)
  revalidatePath(`/league/${slug}/fixtures`)
  revalidatePath(`/league/${slug}/standings`)
  revalidatePath(`/league/${slug}/bracket`)
}

export async function createStage(
  seasonId: string,
  slug: string,
  payload: {
    name: string
    kind: 'regular' | 'group' | 'knockout'
    sort_order: number
    bracket_size: number | null
  },
): Promise<ActionResult<{ stage_id: string }>> {
  const supabase = await createClient()
  const res = unwrapRpc<{ stage_id: string }>(
    await supabase.rpc('create_match_stage', {
      p_season_id: seasonId,
      p_name: payload.name,
      p_kind: payload.kind,
      p_sort_order: payload.sort_order,
      p_bracket_size: payload.bracket_size,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function deleteStage(
  stageId: string,
  seasonId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const res = unwrapRpc(
    await supabase.rpc('delete_match_stage', { p_stage_id: stageId }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function createFixture(
  leagueId: string,
  seasonId: string,
  slug: string,
  payload: {
    stage_id: string | null
    home_team_id: string
    away_team_id: string
    match_date: string
    venue_custom: string | null
    bracket_position: number | null
  },
): Promise<ActionResult<{ match_id: string }>> {
  const supabase = await createClient()
  const res = unwrapRpc<{ match_id: string }>(
    await supabase.rpc('create_fixture', {
      p_league_id: leagueId,
      p_season_id: seasonId,
      p_stage_id: payload.stage_id,
      p_home_team_id: payload.home_team_id,
      p_away_team_id: payload.away_team_id,
      p_match_date: payload.match_date,
      p_match_type: 'league',
      p_venue_custom: payload.venue_custom,
      p_bracket_position: payload.bracket_position,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function updateFixtureScore(
  matchId: string,
  homeGoals: number,
  awayGoals: number,
  finalize: boolean,
  seasonId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const res = unwrapRpc(
    await supabase.rpc('update_fixture_score', {
      p_match_id: matchId,
      p_home_goals: homeGoals,
      p_away_goals: awayGoals,
      p_finalize: finalize,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function generateRoundRobin(
  stageId: string,
  teamIds: string[],
  doubleRound: boolean,
  startDate: string,
  daysBetween: number,
  seasonId: string,
  slug: string,
): Promise<ActionResult<{ matches_created: number }>> {
  const supabase = await createClient()
  const res = unwrapRpc<{ matches_created: number }>(
    await supabase.rpc('generate_round_robin', {
      p_stage_id: stageId,
      p_team_ids: teamIds,
      p_double_round: doubleRound,
      p_start_date: startDate,
      p_days_between: daysBetween,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function generateKnockoutBracket(
  stageId: string,
  teamIds: string[],
  startDate: string,
  daysBetween: number,
  seasonId: string,
  slug: string,
): Promise<ActionResult<{ matches_created: number }>> {
  const supabase = await createClient()
  const res = unwrapRpc<{ matches_created: number }>(
    await supabase.rpc('generate_knockout_bracket', {
      p_stage_id: stageId,
      p_team_ids: teamIds,
      p_start_date: startDate,
      p_days_between: daysBetween,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function generateFullKnockoutTournament(
  seasonId: string,
  slug: string,
  payload: {
    team_ids: string[]
    start_date: string
    days_between: number
    starting_sort?: number
  },
): Promise<ActionResult<{ stages_created: number; matches_created: number; rounds: number }>> {
  const supabase = await createClient()
  const res = unwrapRpc<{ stages_created: number; matches_created: number; rounds: number }>(
    await supabase.rpc('generate_full_knockout_tournament', {
      p_season_id: seasonId,
      p_team_ids: payload.team_ids,
      p_start_date: payload.start_date,
      p_days_between: payload.days_between,
      p_starting_sort: payload.starting_sort ?? 0,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function updateFixture(
  matchId: string,
  seasonId: string,
  slug: string,
  patch: {
    home_team_id?: string | null
    away_team_id?: string | null
    match_date?: string | null
    venue_custom?: string | null
    stage_id?: string | null
    clear_stage?: boolean
    status?: 'scheduled' | 'in_progress' | 'finished' | 'cancelled' | 'postponed' | null
  },
): Promise<ActionResult> {
  const supabase = await createClient()
  const res = unwrapRpc(
    await supabase.rpc('update_fixture', {
      p_match_id: matchId,
      p_home_team_id: patch.home_team_id ?? null,
      p_away_team_id: patch.away_team_id ?? null,
      p_match_date: patch.match_date ?? null,
      p_venue_custom: patch.venue_custom ?? null,
      p_stage_id: patch.stage_id ?? null,
      p_status: patch.status ?? null,
      p_clear_stage: patch.clear_stage ?? false,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function deleteFixture(
  matchId: string,
  seasonId: string,
  slug: string,
): Promise<ActionResult> {
  const supabase = await createClient()
  const res = unwrapRpc(
    await supabase.rpc('delete_fixture', { p_match_id: matchId }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

export async function upsertSeasonRules(
  seasonId: string,
  slug: string,
  payload: {
    format: 'round_robin' | 'knockout' | 'groups_then_knockout' | 'custom'
    points_win: number
    points_draw: number
    points_loss: number
    leg_count: number
    default_kickoff: string | null
    notes: string | null
  },
): Promise<ActionResult> {
  const supabase = await createClient()
  const res = unwrapRpc(
    await supabase.rpc('upsert_season_rules', {
      p_season_id: seasonId,
      p_format: payload.format,
      p_points_win: payload.points_win,
      p_points_draw: payload.points_draw,
      p_points_loss: payload.points_loss,
      p_leg_count: payload.leg_count,
      p_default_kickoff: payload.default_kickoff,
      p_notes: payload.notes,
    }),
  )
  if ('ok' in res) bumpSeasonPaths(slug, seasonId)
  return res
}

