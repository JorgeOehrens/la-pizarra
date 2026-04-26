-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP6 / migration 08)
-- Team ↔ League participation RPCs
--
-- All RPCs are SECURITY DEFINER and call has_permission() before
-- mutating, keeping the permission matrix as the single source
-- of truth.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. invite_team_to_league
--    League admin invites a team to participate.
--    Creates a league_teams row with status='pending'.
--    The team manager then accepts via accept_league_invitation
--    (mirror semantics of join_requests).
-- ─────────────────────────────────────────────────────────────
create or replace function public.invite_team_to_league(
  p_league_id uuid,
  p_team_id   uuid,
  p_season_id uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user uuid := auth.uid();
  v_id   uuid;
begin
  if not public.has_permission('league.invite_team', p_league_id, p_team_id, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  -- Validate season belongs to league.
  if p_season_id is not null and not exists (
    select 1 from public.seasons
    where id = p_season_id and league_id = p_league_id
  ) then
    return jsonb_build_object('error', 'season_not_in_league');
  end if;

  -- Validate team exists.
  if not exists (select 1 from public.teams where id = p_team_id and deleted_at is null) then
    return jsonb_build_object('error', 'team_not_found');
  end if;

  -- Reject if an active or pending row already exists for the same season.
  if exists (
    select 1 from public.league_teams
    where league_id = p_league_id
      and team_id   = p_team_id
      and (
        (p_season_id is null and season_id is null)
        or season_id = p_season_id
      )
      and status in ('pending','active')
  ) then
    return jsonb_build_object('error', 'already_participating_or_pending');
  end if;

  insert into public.league_teams (
    league_id, team_id, season_id, status, requested_by, joined_at
  ) values (
    p_league_id, p_team_id, p_season_id, 'pending', v_user, now()
  )
  returning id into v_id;

  return jsonb_build_object('league_team_id', v_id, 'status', 'pending');
end $$;

grant execute on function public.invite_team_to_league(uuid, uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. request_team_in_league
--    Team manager requests to participate in a league.
--    Creates a league_join_requests row.
-- ─────────────────────────────────────────────────────────────
create or replace function public.request_team_in_league(
  p_league_id uuid,
  p_team_id   uuid
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user      uuid := auth.uid();
  v_id        uuid;
  v_join_mode text;
  v_visibility text;
begin
  if not public.has_permission('team.join_league', null, p_team_id, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  select join_mode, visibility into v_join_mode, v_visibility
  from public.leagues
  where id = p_league_id and deleted_at is null;

  if v_join_mode is null then
    return jsonb_build_object('error', 'league_not_found');
  end if;

  -- A private+invite_only league cannot be requested into.
  if v_join_mode = 'invite_only' and v_visibility = 'private' then
    return jsonb_build_object('error', 'league_is_invite_only');
  end if;

  -- If 'open': we directly create an active league_teams row.
  if v_join_mode = 'open' then
    insert into public.league_teams (
      league_id, team_id, status, requested_by, joined_at
    ) values (
      p_league_id, p_team_id, 'active', v_user, now()
    )
    on conflict do nothing
    returning id into v_id;

    return jsonb_build_object('league_team_id', v_id, 'status', 'active');
  end if;

  -- 'request' or 'invite_only-but-public': create a request.
  insert into public.league_join_requests (
    league_id, team_id, requested_by, status
  ) values (
    p_league_id, p_team_id, v_user, 'pending'
  )
  on conflict (league_id, team_id) do update
    set status      = case
                        when public.league_join_requests.status in ('rejected','approved') then 'pending'
                        else public.league_join_requests.status
                      end,
        requested_by = excluded.requested_by,
        reviewed_by  = null,
        reviewed_at  = null,
        updated_at   = now()
  returning id into v_id;

  return jsonb_build_object('request_id', v_id, 'status', 'pending');
end $$;

grant execute on function public.request_team_in_league(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. approve_team_in_league
--    League admin approves a pending request → creates the
--    league_teams active row + marks request approved.
-- ─────────────────────────────────────────────────────────────
create or replace function public.approve_team_in_league(
  p_request_id uuid,
  p_season_id  uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user        uuid := auth.uid();
  v_league_id   uuid;
  v_team_id     uuid;
  v_status      text;
  v_league_team uuid;
begin
  select league_id, team_id, status
    into v_league_id, v_team_id, v_status
  from public.league_join_requests
  where id = p_request_id;

  if v_league_id is null then
    return jsonb_build_object('error', 'request_not_found');
  end if;

  if not public.has_permission('league.review_team_requests', v_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  if v_status <> 'pending' then
    return jsonb_build_object('error', 'request_not_pending');
  end if;

  -- Create the participation row (idempotent on the unique partial index).
  insert into public.league_teams (
    league_id, team_id, season_id, status, requested_by, approved_by, joined_at
  ) values (
    v_league_id, v_team_id, p_season_id, 'active', v_user, v_user, now()
  )
  on conflict do update
    set status      = 'active',
        approved_by = excluded.approved_by,
        updated_at  = now()
  returning id into v_league_team;

  update public.league_join_requests
     set status      = 'approved',
         reviewed_by = v_user,
         reviewed_at = now(),
         updated_at  = now()
   where id = p_request_id;

  return jsonb_build_object('league_team_id', v_league_team, 'status', 'active');
end $$;

grant execute on function public.approve_team_in_league(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4. reject_team_in_league
-- ─────────────────────────────────────────────────────────────
create or replace function public.reject_team_in_league(p_request_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user      uuid := auth.uid();
  v_league_id uuid;
begin
  select league_id into v_league_id
  from public.league_join_requests
  where id = p_request_id;

  if v_league_id is null then
    return jsonb_build_object('error', 'request_not_found');
  end if;

  if not public.has_permission('league.review_team_requests', v_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  update public.league_join_requests
     set status      = 'rejected',
         reviewed_by = v_user,
         reviewed_at = now(),
         updated_at  = now()
   where id = p_request_id;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.reject_team_in_league(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. accept_league_invitation
--    Team manager accepts a 'pending' league_teams row that the
--    league admin pre-created.
-- ─────────────────────────────────────────────────────────────
create or replace function public.accept_league_invitation(p_league_team_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_team uuid;
  v_status text;
begin
  select team_id, status
    into v_team, v_status
  from public.league_teams
  where id = p_league_team_id;

  if v_team is null then
    return jsonb_build_object('error', 'invitation_not_found');
  end if;

  if not public.has_permission('team.join_league', null, v_team, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  if v_status <> 'pending' then
    return jsonb_build_object('error', 'invitation_not_pending');
  end if;

  update public.league_teams
     set status     = 'active',
         joined_at  = now(),
         updated_at = now()
   where id = p_league_team_id;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.accept_league_invitation(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 6. withdraw_team_from_league
--    Team manager (or league admin) withdraws the team.
-- ─────────────────────────────────────────────────────────────
create or replace function public.withdraw_team_from_league(p_league_team_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_team   uuid;
  v_league uuid;
begin
  select team_id, league_id
    into v_team, v_league
  from public.league_teams
  where id = p_league_team_id;

  if v_team is null then
    return jsonb_build_object('error', 'not_found');
  end if;

  if not (
    public.has_permission('team.join_league', null, v_team, null)
    or public.has_permission('league.invite_team', v_league, null, null)
  ) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  update public.league_teams
     set status     = 'withdrawn',
         updated_at = now()
   where id = p_league_team_id;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.withdraw_team_from_league(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 7. search_teams_for_league_invite
--    Lightweight search returning teams the caller manages OR
--    public teams (visible via teams RLS policy already in place).
--    Excludes teams already participating in (or pending in) the league.
-- ─────────────────────────────────────────────────────────────
create or replace function public.search_teams_for_league_invite(
  p_league_id uuid,
  p_query     text default '',
  p_limit     int  default 20
)
returns table (
  id              uuid,
  name            text,
  slug            text,
  logo_url        text,
  primary_color   text,
  secondary_color text,
  member_count    bigint
)
language sql
security definer
stable
as $$
  with already_in_league as (
    select team_id from public.league_teams
    where league_id = p_league_id
      and status in ('pending','active')
  )
  select
    t.id, t.name, t.slug, t.logo_url, t.primary_color, t.secondary_color,
    (select count(*) from public.team_members tm
       where tm.team_id = t.id
         and tm.status = 'active')::bigint as member_count
  from public.teams t
  where t.deleted_at is null
    and (p_query is null or p_query = '' or t.name ilike '%' || p_query || '%')
    and t.id not in (select team_id from already_in_league)
  order by t.name
  limit greatest(1, least(coalesce(p_limit, 20), 50));
$$;

grant execute on function public.search_teams_for_league_invite(uuid, text, int) to authenticated;
