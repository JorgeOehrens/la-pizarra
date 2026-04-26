-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP2 / migration 05)
-- RLS helpers (league scope) + has_permission single resolver
-- + RLS policies on the new league tables.
--
-- This is the *only* file that defines the permission matrix in SQL.
-- Every existing RPC will be migrated (CP4) to call has_permission
-- instead of inline team_members lookups.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. RLS helpers — league scope
-- ─────────────────────────────────────────────────────────────

create or replace function public.is_league_member(p_league uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.league_members
    where league_id = p_league
      and user_id   = auth.uid()
      and status    = 'active'
  );
$$;

create or replace function public.is_league_admin(p_league uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.league_members
    where league_id = p_league
      and user_id   = auth.uid()
      and role      in ('league_owner','league_admin')
      and status    = 'active'
  );
$$;

create or replace function public.is_team_in_league(p_team uuid, p_league uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.league_teams
    where league_id = p_league
      and team_id   = p_team
      and status    = 'active'
  );
$$;

grant execute on function public.is_league_member(uuid)             to authenticated;
grant execute on function public.is_league_admin(uuid)              to authenticated;
grant execute on function public.is_team_in_league(uuid, uuid)      to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. has_permission — single resolver
--
-- Maps a permission string + context (league?, team?, match?) to
-- a boolean. This is the source of truth; lib/auth/permissions.ts
-- is a thin wrapper around it.
--
-- The match argument lets callers ask "can I edit THIS match?"
-- without first looking up team_id/league_id; this function does
-- the lookup for them.
-- ─────────────────────────────────────────────────────────────

create or replace function public.has_permission(
  p_permission text,
  p_league     uuid default null,
  p_team       uuid default null,
  p_match      uuid default null
)
returns boolean
language plpgsql
security definer
stable
as $$
declare
  v_user        uuid := auth.uid();
  v_platform    text;
  v_league_role public.league_role;
  v_team_role   text;
  v_team        uuid := p_team;
  v_league      uuid := p_league;
begin
  if v_user is null then
    return false;
  end if;

  -- Platform-level override.
  select platform_role into v_platform from public.profiles where id = v_user;
  if v_platform = 'platform_admin' then
    return true;
  end if;

  -- If a match is provided, derive its team and league for downstream checks.
  if p_match is not null then
    select team_id, league_id into v_team, v_league
    from public.matches
    where id = p_match
      and deleted_at is null;
    -- Use caller-provided values when match has no league set.
    v_league := coalesce(v_league, p_league);
    v_team   := coalesce(v_team,   p_team);
  end if;

  -- Pull league role (if any) for the user in the relevant league.
  if v_league is not null then
    select role into v_league_role
    from public.league_members
    where league_id = v_league
      and user_id   = v_user
      and status    = 'active';
  end if;

  -- Pull team role (if any) for the user in the relevant team.
  -- Read via effective_team_members so legacy 'admin' = 'team_manager'.
  if v_team is not null then
    select role into v_team_role
    from public.effective_team_members
    where team_id = v_team
      and user_id = v_user
      and status  = 'active';
  end if;

  -- NOTE: Postgres simple CASE does not allow comma-separated WHEN values.
  -- We use a searched CASE so we can group permissions with `IN (...)`.
  return case
    when p_permission = 'league.read' then
      v_league_role is not null
      or (v_team is not null and v_team_role is not null and v_league is not null
          and public.is_team_in_league(v_team, v_league))

    when p_permission = 'league.edit' then
      v_league_role in ('league_owner','league_admin')

    when p_permission = 'league.delete' then
      v_league_role = 'league_owner'

    when p_permission in (
      'league.invite_admin', 'league.invite_team', 'league.create_season',
      'league.review_team_requests', 'league.manage_seasons'
    ) then
      v_league_role in ('league_owner','league_admin')

    when p_permission = 'team.read' then
      v_team_role is not null
      or (v_league_role is not null and v_team is not null and v_league is not null
          and public.is_team_in_league(v_team, v_league))

    when p_permission in (
      'team.edit', 'team.delete', 'team.promote_member', 'team.change_join_mode'
    ) then
      v_team_role = 'team_manager'

    when p_permission in ('team.invite', 'team.review_requests', 'team.assign_jersey') then
      v_team_role in ('team_manager','coach')

    when p_permission = 'team.join_league' then
      v_team_role = 'team_manager'

    when p_permission = 'match.create' then
      v_team_role in ('team_manager','coach')
      or v_league_role in ('league_owner','league_admin')

    when p_permission = 'match.edit' then
      v_team_role in ('team_manager','coach')
      or v_league_role in ('league_owner','league_admin','league_referee')

    when p_permission = 'match.register_events' then
      v_team_role in ('team_manager','coach','captain')
      or v_league_role = 'league_referee'

    when p_permission = 'match.delete' then
      v_team_role = 'team_manager'
      or v_league_role in ('league_owner','league_admin')

    when p_permission = 'attendance.set_self' then
      v_team_role is not null
      or v_league_role is not null

    when p_permission = 'attendance.set_other' then
      v_team_role in ('team_manager','coach')

    when p_permission = 'finance.view_own' then
      v_team_role is not null

    when p_permission = 'finance.view_aggregate' then
      v_team_role in ('team_manager','coach')

    when p_permission in ('finance.create_charge','finance.confirm_payment') then
      v_team_role = 'team_manager'

    when p_permission = 'stats.read_team' then
      v_team_role is not null
      or v_league_role is not null

    when p_permission = 'stats.adjust' then
      v_team_role = 'team_manager'

    else false
  end;
end $$;

grant execute on function public.has_permission(text, uuid, uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. RLS policies — leagues
-- ─────────────────────────────────────────────────────────────

-- Members of the league can SELECT it. Public/unlisted leagues are
-- also visible to any authenticated user (read-only summary).
drop policy if exists "leagues_select_member_or_public"          on public.leagues;
drop policy if exists "leagues_select_member_or_public_or_unlisted" on public.leagues;
create policy "leagues_select_member_or_public_or_unlisted"
  on public.leagues for select
  to authenticated
  using (
    deleted_at is null and (
      visibility in ('public','unlisted')
      or public.is_league_member(id)
    )
  );

-- INSERT happens only via SECURITY DEFINER RPC create_league_for_user
-- (CP5). No direct INSERT policy → blocked from PostgREST.

-- League admins/owners can update settings.
drop policy if exists "leagues_update_admin" on public.leagues;
create policy "leagues_update_admin"
  on public.leagues for update
  to authenticated
  using (public.is_league_admin(id))
  with check (public.is_league_admin(id));

-- ─────────────────────────────────────────────────────────────
-- 4. RLS policies — league_members
-- ─────────────────────────────────────────────────────────────

drop policy if exists "league_members_select_member" on public.league_members;
create policy "league_members_select_member"
  on public.league_members for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.is_league_member(league_id)
  );

drop policy if exists "league_members_admin_manage" on public.league_members;
create policy "league_members_admin_manage"
  on public.league_members for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

-- ─────────────────────────────────────────────────────────────
-- 5. RLS policies — league_invitations
-- ─────────────────────────────────────────────────────────────

drop policy if exists "league_invitations_select_member" on public.league_invitations;
create policy "league_invitations_select_member"
  on public.league_invitations for select
  to authenticated
  using (public.is_league_member(league_id));

-- Allow any authenticated user to SELECT a pending, non-expired invitation
-- (so the redeem flow can resolve token/code without being a member yet).
drop policy if exists "league_invitations_select_pending_token" on public.league_invitations;
create policy "league_invitations_select_pending_token"
  on public.league_invitations for select
  to authenticated
  using (status = 'pending' and expires_at > now());

drop policy if exists "league_invitations_admin_manage" on public.league_invitations;
create policy "league_invitations_admin_manage"
  on public.league_invitations for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

-- ─────────────────────────────────────────────────────────────
-- 6. RLS policies — league_join_requests
-- ─────────────────────────────────────────────────────────────

-- Team manager (or any team member) can see their own team's requests.
drop policy if exists "league_join_requests_select_team_member" on public.league_join_requests;
create policy "league_join_requests_select_team_member"
  on public.league_join_requests for select
  to authenticated
  using (
    requested_by = auth.uid()
    or public.is_team_member(team_id)
    or public.is_league_admin(league_id)
  );

-- Team managers can create requests for their team.
drop policy if exists "league_join_requests_create_team_manager" on public.league_join_requests;
create policy "league_join_requests_create_team_manager"
  on public.league_join_requests for insert
  to authenticated
  with check (
    public.is_team_admin(team_id)
    and requested_by = auth.uid()
  );

-- League admins approve/reject (status update); team managers can withdraw.
drop policy if exists "league_join_requests_update_admin_or_team" on public.league_join_requests;
create policy "league_join_requests_update_admin_or_team"
  on public.league_join_requests for update
  to authenticated
  using (
    public.is_league_admin(league_id)
    or public.is_team_admin(team_id)
  );

-- ─────────────────────────────────────────────────────────────
-- 7. RLS policies — seasons
-- ─────────────────────────────────────────────────────────────

drop policy if exists "seasons_select_league_member_or_public" on public.seasons;
create policy "seasons_select_league_member_or_public"
  on public.seasons for select
  to authenticated
  using (
    public.is_league_member(league_id)
    or exists (
      select 1 from public.leagues l
      where l.id = seasons.league_id
        and l.visibility in ('public','unlisted')
        and l.deleted_at is null
    )
  );

drop policy if exists "seasons_admin_manage" on public.seasons;
create policy "seasons_admin_manage"
  on public.seasons for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

-- ─────────────────────────────────────────────────────────────
-- 8. RLS policies — league_teams
-- ─────────────────────────────────────────────────────────────

-- Visible to: league members, team members, or any authenticated user
-- if the league is public.
drop policy if exists "league_teams_select_member_or_public" on public.league_teams;
create policy "league_teams_select_member_or_public"
  on public.league_teams for select
  to authenticated
  using (
    public.is_league_member(league_id)
    or public.is_team_member(team_id)
    or exists (
      select 1 from public.leagues l
      where l.id = league_teams.league_id
        and l.visibility in ('public','unlisted')
        and l.deleted_at is null
    )
  );

drop policy if exists "league_teams_admin_manage" on public.league_teams;
create policy "league_teams_admin_manage"
  on public.league_teams for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

-- A team manager can withdraw their team (UPDATE status='withdrawn').
drop policy if exists "league_teams_team_manager_can_withdraw" on public.league_teams;
create policy "league_teams_team_manager_can_withdraw"
  on public.league_teams for update
  to authenticated
  using (public.is_team_admin(team_id));
