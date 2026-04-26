-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP2 / migration 03)
-- Extend team_role enum, add owner_id to teams,
-- add platform_role and active_league_id to profiles.
--
-- Strictly additive. The existing 'admin' enum value remains and
-- continues to be honored by existing RPCs.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Extend team_role enum
--    Postgres enum changes are append-only and irreversible.
--    We add the new canonical values; old 'admin' stays valid.
-- ─────────────────────────────────────────────────────────────
alter type public.team_role add value if not exists 'team_manager';
alter type public.team_role add value if not exists 'coach';
alter type public.team_role add value if not exists 'captain';
alter type public.team_role add value if not exists 'team_viewer';

-- ─────────────────────────────────────────────────────────────
-- 2. teams.owner_id (was implicit via created_by)
-- ─────────────────────────────────────────────────────────────
alter table public.teams
  add column if not exists owner_id uuid references public.profiles(id);

-- Backfill: if owner_id is null, copy from created_by.
update public.teams
   set owner_id = created_by
 where owner_id is null
   and created_by is not null;

create index if not exists idx_teams_owner_id on public.teams(owner_id);

-- ─────────────────────────────────────────────────────────────
-- 3. profiles.platform_role + profiles.active_league_id
-- ─────────────────────────────────────────────────────────────
alter table public.profiles
  add column if not exists platform_role text
    check (platform_role in ('platform_admin','support')),
  add column if not exists active_league_id uuid
    references public.leagues(id) on delete set null;

create index if not exists idx_profiles_platform_role
  on public.profiles(platform_role) where platform_role is not null;

create index if not exists idx_profiles_active_league_id
  on public.profiles(active_league_id) where active_league_id is not null;

-- ─────────────────────────────────────────────────────────────
-- 4. View: effective_team_members
--    Maps the historical 'admin' role to its canonical alias
--    'team_manager'. New code reads from this view; old code can
--    keep reading team_members directly until rename migration.
-- ─────────────────────────────────────────────────────────────
create or replace view public.effective_team_members as
select
  tm.id,
  tm.team_id,
  tm.user_id,
  case
    when tm.role::text = 'admin' then 'team_manager'::text
    else tm.role::text
  end as role,
  tm.status,
  tm.jersey_number,
  tm.position,
  tm.joined_at,
  tm.created_at,
  tm.updated_at
from public.team_members tm;

grant select on public.effective_team_members to authenticated;
