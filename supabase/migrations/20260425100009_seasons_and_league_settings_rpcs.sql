-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP5b / migration 09)
-- Seasons + league settings RPCs
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. create_season
-- ─────────────────────────────────────────────────────────────
create or replace function public.create_season(
  p_league_id  uuid,
  p_name       text,
  p_starts_on  date default null,
  p_ends_on    date default null,
  p_is_current boolean default false
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_season_id uuid;
begin
  if not public.has_permission('league.create_season', p_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  if coalesce(trim(p_name), '') = '' then
    return jsonb_build_object('error', 'name_required');
  end if;

  if p_starts_on is not null and p_ends_on is not null and p_starts_on > p_ends_on then
    return jsonb_build_object('error', 'invalid_date_range');
  end if;

  -- If marked as current, unset any existing current season for this league.
  if p_is_current then
    update public.seasons
       set is_current = false,
           updated_at = now()
     where league_id  = p_league_id
       and is_current = true;
  end if;

  insert into public.seasons (
    league_id, name, starts_on, ends_on, is_current
  ) values (
    p_league_id, p_name, p_starts_on, p_ends_on, coalesce(p_is_current, false)
  )
  returning id into v_season_id;

  return jsonb_build_object('season_id', v_season_id);
end $$;

grant execute on function public.create_season(uuid, text, date, date, boolean) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 2. set_current_season
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_current_season(p_season_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_league_id uuid;
begin
  select league_id into v_league_id
  from public.seasons
  where id = p_season_id;

  if v_league_id is null then
    return jsonb_build_object('error', 'season_not_found');
  end if;

  if not public.has_permission('league.manage_seasons', v_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  update public.seasons
     set is_current = false,
         updated_at = now()
   where league_id  = v_league_id
     and is_current = true
     and id <> p_season_id;

  update public.seasons
     set is_current = true,
         updated_at = now()
   where id = p_season_id;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.set_current_season(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 3. delete_season  (only if no matches reference it)
-- ─────────────────────────────────────────────────────────────
create or replace function public.delete_season(p_season_id uuid)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_league_id uuid;
  v_match_count int;
begin
  select league_id into v_league_id
  from public.seasons
  where id = p_season_id;

  if v_league_id is null then
    return jsonb_build_object('error', 'season_not_found');
  end if;

  if not public.has_permission('league.manage_seasons', v_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  select count(*) into v_match_count
  from public.matches
  where season_id = p_season_id;

  if v_match_count > 0 then
    return jsonb_build_object('error', 'season_has_matches');
  end if;

  delete from public.seasons where id = p_season_id;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.delete_season(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 4. update_league
--    Editable fields: name, description, logo_url, colors,
--    visibility, join_mode. owner_id and slug stay immutable here.
-- ─────────────────────────────────────────────────────────────
create or replace function public.update_league(
  p_league_id        uuid,
  p_name             text default null,
  p_description      text default null,
  p_logo_url         text default null,
  p_primary_color    text default null,
  p_secondary_color  text default null,
  p_visibility       text default null,
  p_join_mode        text default null
)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not public.has_permission('league.edit', p_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  if p_visibility is not null and p_visibility not in ('public','unlisted','private') then
    return jsonb_build_object('error', 'invalid_visibility');
  end if;

  if p_join_mode is not null and p_join_mode not in ('open','request','invite_only') then
    return jsonb_build_object('error', 'invalid_join_mode');
  end if;

  update public.leagues
     set name            = coalesce(nullif(trim(p_name), ''), name),
         description     = case when p_description is null then description else nullif(trim(p_description), '') end,
         logo_url        = coalesce(p_logo_url, logo_url),
         primary_color   = coalesce(p_primary_color, primary_color),
         secondary_color = coalesce(p_secondary_color, secondary_color),
         visibility      = coalesce(p_visibility, visibility),
         join_mode       = coalesce(p_join_mode, join_mode),
         updated_at      = now()
   where id = p_league_id
     and deleted_at is null;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.update_league(
  uuid, text, text, text, text, text, text, text
) to authenticated;

-- ─────────────────────────────────────────────────────────────
-- 5. delete_league (soft delete; owner only)
-- ─────────────────────────────────────────────────────────────
create or replace function public.delete_league(p_league_id uuid)
returns jsonb
language plpgsql
security definer
as $$
begin
  if not public.has_permission('league.delete', p_league_id, null, null) then
    return jsonb_build_object('error', 'forbidden');
  end if;

  update public.leagues
     set deleted_at = now(),
         updated_at = now()
   where id = p_league_id;

  -- Clear pointer in profiles for any user that had it as active.
  update public.profiles
     set active_league_id = null
   where active_league_id = p_league_id;

  return jsonb_build_object('ok', true);
end $$;

grant execute on function public.delete_league(uuid) to authenticated;
