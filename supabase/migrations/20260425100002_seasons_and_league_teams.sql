-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP2 / migration 02)
-- Seasons + league_teams (M:N team participation in leagues)
--
-- Additive: no existing table or column is modified.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABLE: seasons
--    The lightweight "project" unit inside a league.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.seasons (
  id          uuid primary key default uuid_generate_v4(),
  league_id   uuid not null references public.leagues(id) on delete cascade,
  name        text not null,                       -- e.g. "Apertura 2026"
  starts_on   date,
  ends_on     date,
  is_current  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_seasons_league_id on public.seasons(league_id);
create index if not exists idx_seasons_starts_on on public.seasons(starts_on);

-- At most one current season per league.
create unique index if not exists seasons_one_current_per_league
  on public.seasons(league_id) where is_current;

drop trigger if exists seasons_updated_at on public.seasons;
create trigger seasons_updated_at
  before update on public.seasons
  for each row execute function public.update_updated_at();

alter table public.seasons enable row level security;

-- ─────────────────────────────────────────────────────────────
-- 2. TABLE: league_teams (M:N participation, season-aware)
--    A team can rejoin per season → unique on (league, team, season).
--    season_id is nullable so leagues without seasons still work.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.league_teams (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  team_id      uuid not null references public.teams(id)   on delete cascade,
  season_id    uuid references public.seasons(id)          on delete set null,
  status       text not null default 'active'
               check (status in ('pending','active','withdrawn','rejected')),
  requested_by uuid references public.profiles(id),
  approved_by  uuid references public.profiles(id),
  joined_at    timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- A team participation row is unique per (league, team, season).
-- Postgres considers NULLs distinct in unique indexes, so leagues
-- without seasons can still have only one active row per team via
-- the partial unique index below.
create unique index if not exists league_teams_unique_per_season
  on public.league_teams(league_id, team_id, season_id)
  where season_id is not null;

create unique index if not exists league_teams_unique_when_no_season
  on public.league_teams(league_id, team_id)
  where season_id is null;

create index if not exists idx_league_teams_league_id on public.league_teams(league_id);
create index if not exists idx_league_teams_team_id   on public.league_teams(team_id);
create index if not exists idx_league_teams_season_id on public.league_teams(season_id);
create index if not exists idx_league_teams_status    on public.league_teams(status);

drop trigger if exists league_teams_updated_at on public.league_teams;
create trigger league_teams_updated_at
  before update on public.league_teams
  for each row execute function public.update_updated_at();

alter table public.league_teams enable row level security;
