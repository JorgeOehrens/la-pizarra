-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP / migration 11)
-- season_rules + auto-generators (round_robin, knockout) +
-- season_standings view
-- (full bodies are stored in DB; this file is the source of truth
-- for re-creating the migration locally.)
-- ============================================================

-- 1. season_rules table (one row per season)
create table if not exists public.season_rules (
  season_id        uuid primary key references public.seasons(id) on delete cascade,
  league_id        uuid not null references public.leagues(id) on delete cascade,
  format           text not null default 'round_robin'
                   check (format in ('round_robin','knockout','groups_then_knockout','custom')),
  points_win       smallint not null default 3 check (points_win >= 0),
  points_draw      smallint not null default 1 check (points_draw >= 0),
  points_loss      smallint not null default 0 check (points_loss >= 0),
  leg_count        smallint not null default 1 check (leg_count between 1 and 2),
  default_kickoff  time,
  notes            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

drop trigger if exists season_rules_updated_at on public.season_rules;
create trigger season_rules_updated_at
  before update on public.season_rules
  for each row execute function public.update_updated_at();

alter table public.season_rules enable row level security;

drop policy if exists "season_rules_select_member_or_public" on public.season_rules;
create policy "season_rules_select_member_or_public"
  on public.season_rules for select
  to authenticated
  using (
    public.is_league_member(league_id)
    or exists (
      select 1 from public.leagues l
      where l.id = season_rules.league_id
        and l.visibility in ('public','unlisted')
        and l.deleted_at is null
    )
    or exists (
      select 1 from public.league_teams lt
      join public.team_members tm on tm.team_id = lt.team_id and tm.user_id = auth.uid() and tm.status = 'active'
      where lt.league_id = season_rules.league_id and lt.status = 'active'
    )
  );

drop policy if exists "season_rules_admin_manage" on public.season_rules;
create policy "season_rules_admin_manage"
  on public.season_rules for all
  to authenticated
  using (public.is_league_admin(league_id))
  with check (public.is_league_admin(league_id));

-- 2. RPCs:
--    upsert_season_rules(season_id, format, points_win, points_draw,
--                        points_loss, leg_count, default_kickoff, notes)
--    generate_round_robin(stage_id, team_ids[], double_round, start_date, days_between)
--    generate_knockout_bracket(stage_id, team_ids[], start_date, days_between)
-- (canonical bodies live in the DB — see migration history)

-- 3. View: season_standings
--    For each (season_id, team_id), aggregates results from regular/group
--    stage matches and computes points using the season_rules. If no
--    season_rules row exists, defaults to 3/1/0.
