-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP3 / migration 06)
-- Active context RPCs: set_active_league, set_active_context,
-- get_user_contexts.
--
-- These RPCs are the only sanctioned way to mutate
-- profiles.active_league_id and profiles.active_team_id from
-- the client. They validate membership before touching the row.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. set_active_league
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_active_league(p_league_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if p_league_id is null then
    update public.profiles
       set active_league_id = null
     where id = auth.uid();
    return;
  end if;

  if not exists (
    select 1
    from public.league_members
    where league_id = p_league_id
      and user_id   = auth.uid()
      and status    = 'active'
  ) then
    raise exception 'not_a_league_member';
  end if;

  update public.profiles
     set active_league_id = p_league_id
   where id = auth.uid();
end $$;

grant execute on function public.set_active_league(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. set_active_context
--    Atomic update of (active_league_id, active_team_id).
--    - Either argument may be null.
--    - If both are non-null, the team must participate in that
--      league (active league_teams row).
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_active_context(
  p_league_id uuid,
  p_team_id   uuid
)
returns void
language plpgsql
security definer
as $$
begin
  if auth.uid() is null then
    raise exception 'not_authenticated';
  end if;

  if p_league_id is not null and not exists (
    select 1 from public.league_members
    where league_id = p_league_id
      and user_id   = auth.uid()
      and status    = 'active'
  ) then
    raise exception 'not_a_league_member';
  end if;

  if p_team_id is not null and not exists (
    select 1 from public.team_members
    where team_id = p_team_id
      and user_id = auth.uid()
      and status  = 'active'
  ) then
    raise exception 'not_a_team_member';
  end if;

  if p_league_id is not null
     and p_team_id is not null
     and not exists (
       select 1 from public.league_teams
       where league_id = p_league_id
         and team_id   = p_team_id
         and status    = 'active'
     ) then
    raise exception 'team_not_in_league';
  end if;

  update public.profiles
     set active_league_id = p_league_id,
         active_team_id   = p_team_id
   where id = auth.uid();
end $$;

grant execute on function public.set_active_context(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. get_user_contexts
--    Returns leagues + teams the current user belongs to,
--    with the active flag.
-- ─────────────────────────────────────────────────────────────
create or replace function public.get_user_contexts()
returns jsonb
language sql
security definer
stable
as $$
  with
  p as (
    select active_league_id, active_team_id
    from public.profiles
    where id = auth.uid()
  ),
  ls as (
    select
      l.id,
      l.name,
      l.slug,
      l.logo_url,
      l.primary_color,
      l.secondary_color,
      lm.role::text                                       as role,
      (l.id = (select active_league_id from p))           as is_active
    from public.league_members lm
    join public.leagues l on l.id = lm.league_id
    where lm.user_id = auth.uid()
      and lm.status  = 'active'
      and l.deleted_at is null
  ),
  ts as (
    select
      t.id,
      t.name,
      t.logo_url,
      t.primary_color,
      t.secondary_color,
      etm.role                                            as role,
      tm.jersey_number,
      tm.position,
      (t.id = (select active_team_id from p))             as is_active
    from public.team_members tm
    join public.teams t on t.id = tm.team_id
    join public.effective_team_members etm
      on etm.id = tm.id
    where tm.user_id = auth.uid()
      and tm.status  = 'active'
      and t.deleted_at is null
  )
  select jsonb_build_object(
    'leagues',
      coalesce((select jsonb_agg(to_jsonb(ls)) from ls), '[]'::jsonb),
    'teams',
      coalesce((select jsonb_agg(to_jsonb(ts)) from ts), '[]'::jsonb),
    'active_league_id', (select active_league_id from p),
    'active_team_id',   (select active_team_id   from p)
  );
$$;

grant execute on function public.get_user_contexts() to authenticated;
