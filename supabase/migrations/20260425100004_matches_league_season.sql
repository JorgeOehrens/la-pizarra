-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP2 / migration 04)
-- Matches: optional league_id and season_id (denormalised pointers
-- so a match can be filtered by league/season without joining
-- league_teams).
--
-- Strictly additive — existing rows stay valid with NULLs.
-- ============================================================

alter table public.matches
  add column if not exists league_id uuid references public.leagues(id) on delete set null,
  add column if not exists season_id uuid references public.seasons(id) on delete set null;

create index if not exists idx_matches_league_id on public.matches(league_id) where league_id is not null;
create index if not exists idx_matches_season_id on public.matches(season_id) where season_id is not null;

-- Sanity constraint: a match with a season_id must have the matching league_id.
-- We enforce it via a CHECK referencing a function (ROW-level CHECKs cannot
-- run subqueries directly).
create or replace function public.matches_season_belongs_to_league()
returns trigger language plpgsql as $$
declare
  v_season_league uuid;
begin
  if new.season_id is null then
    return new;
  end if;

  select league_id into v_season_league
  from public.seasons
  where id = new.season_id;

  if v_season_league is null then
    raise exception 'season_not_found';
  end if;

  if new.league_id is null then
    new.league_id := v_season_league;
  elsif new.league_id <> v_season_league then
    raise exception 'season_league_mismatch';
  end if;

  return new;
end $$;

drop trigger if exists matches_season_league_consistency on public.matches;
create trigger matches_season_league_consistency
  before insert or update of league_id, season_id on public.matches
  for each row execute function public.matches_season_belongs_to_league();
