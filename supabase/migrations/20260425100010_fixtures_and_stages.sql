-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP / migration 10)
-- Fixtures (matches between two LaPizarra teams) + match stages
-- (regular phase, group phase, knockout brackets).
-- ============================================================

-- 1. ENUM: stage_kind
do $$ begin
  create type public.stage_kind as enum ('regular','group','knockout');
exception when duplicate_object then null; end $$;

-- 2. TABLE: match_stages
create table if not exists public.match_stages (
  id          uuid primary key default uuid_generate_v4(),
  season_id   uuid not null references public.seasons(id) on delete cascade,
  league_id   uuid not null references public.leagues(id) on delete cascade,
  name        text not null,
  kind        public.stage_kind not null default 'regular',
  sort_order  smallint not null default 0,
  bracket_size smallint,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_match_stages_season_id on public.match_stages(season_id);
create index if not exists idx_match_stages_league_id on public.match_stages(league_id);

drop trigger if exists match_stages_updated_at on public.match_stages;
create trigger match_stages_updated_at
  before update on public.match_stages
  for each row execute function public.update_updated_at();

alter table public.match_stages enable row level security;

drop policy if exists "match_stages_select_member_or_public" on public.match_stages;
create policy "match_stages_select_member_or_public"
  on public.match_stages for select
  to authenticated
  using (
    public.is_league_member(league_id)
    or exists (
      select 1 from public.leagues l
      where l.id = match_stages.league_id
        and l.visibility in ('public','unlisted')
        and l.deleted_at is null
    )
    or exists (
      select 1 from public.league_teams lt
      join public.team_members tm on tm.team_id = lt.team_id and tm.user_id = auth.uid() and tm.status = 'active'
      where lt.league_id = match_stages.league_id and lt.status = 'active'
    )
  );

drop policy if exists "match_stages_admin_manage" on public.match_stages;
create policy "match_stages_admin_manage"
  on public.match_stages for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

-- 3. matches: home_team_id, away_team_id, stage_id, bracket_position
alter table public.matches
  add column if not exists home_team_id uuid references public.teams(id),
  add column if not exists away_team_id uuid references public.teams(id),
  add column if not exists stage_id uuid references public.match_stages(id) on delete set null,
  add column if not exists bracket_position smallint;

create index if not exists idx_matches_home_team_id on public.matches(home_team_id) where home_team_id is not null;
create index if not exists idx_matches_away_team_id on public.matches(away_team_id) where away_team_id is not null;
create index if not exists idx_matches_stage_id on public.matches(stage_id) where stage_id is not null;

-- 4. RLS expansion: members of either side OR league members can SELECT.
drop policy if exists "matches_select_either_team_or_league" on public.matches;
create policy "matches_select_either_team_or_league"
  on public.matches for select
  to authenticated
  using (
    deleted_at is null and (
      public.is_team_member(team_id)
      or (home_team_id is not null and public.is_team_member(home_team_id))
      or (away_team_id is not null and public.is_team_member(away_team_id))
      or (league_id is not null and public.is_league_member(league_id))
    )
  );

-- 5. RPC: create_match_stage / delete_match_stage / create_fixture /
--        update_fixture_score / list_league_fixtures
-- (full bodies in DB; see migration 09/10 history)
