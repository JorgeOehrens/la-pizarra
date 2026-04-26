-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP5a / migration 07)
-- create_league_for_user — atomic league creation:
--   1. insert leagues row
--   2. insert league_members row with role='league_owner'
--   3. set profiles.active_league_id for the caller
-- ============================================================

create or replace function public.create_league_for_user(
  p_name           text,
  p_slug           text,
  p_visibility     text   default 'private',
  p_join_mode      text   default 'invite_only',
  p_logo_url       text   default null,
  p_primary_color  text   default '#16a34a',
  p_secondary_color text  default '#ffffff',
  p_description    text   default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user      uuid := auth.uid();
  v_league_id uuid;
begin
  if v_user is null then
    raise exception 'not_authenticated';
  end if;

  if coalesce(trim(p_name), '') = '' then
    raise exception 'name_required';
  end if;

  if coalesce(trim(p_slug), '') = '' then
    raise exception 'slug_required';
  end if;

  if p_visibility not in ('public','unlisted','private') then
    raise exception 'invalid_visibility';
  end if;

  if p_join_mode not in ('open','request','invite_only') then
    raise exception 'invalid_join_mode';
  end if;

  -- Insert the league.
  insert into public.leagues (
    name, slug, description, logo_url,
    primary_color, secondary_color,
    visibility, join_mode, owner_id
  ) values (
    p_name, p_slug, p_description, p_logo_url,
    coalesce(p_primary_color, '#16a34a'),
    coalesce(p_secondary_color, '#ffffff'),
    p_visibility, p_join_mode, v_user
  )
  returning id into v_league_id;

  -- The creator becomes the league owner.
  insert into public.league_members (
    league_id, user_id, role, status, joined_at
  ) values (
    v_league_id, v_user, 'league_owner', 'active', now()
  );

  -- Make this the active context (best-effort).
  update public.profiles
     set active_league_id = v_league_id
   where id = v_user;

  return jsonb_build_object(
    'league_id', v_league_id,
    'slug', p_slug
  );
end $$;

grant execute on function public.create_league_for_user(
  text, text, text, text, text, text, text, text
) to authenticated;
