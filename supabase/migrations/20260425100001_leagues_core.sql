-- ============================================================
-- LaPizarra — Multi-Tenant RBAC (CP2 / migration 01)
-- Leagues core: leagues, league_role, league_members,
-- league_invitations, league_join_requests
--
-- Additive: no existing table or column is modified here.
-- Behind feature flag NEXT_PUBLIC_FEATURE_LEAGUES.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Required extensions (idempotent)
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────
do $$ begin
  create type public.league_role as enum (
    'league_owner',
    'league_admin',
    'league_referee',
    'league_viewer'
  );
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────
-- 2. TABLE: leagues (the workspace / tenant)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.leagues (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  slug            text unique not null,
  description     text,
  logo_url        text,
  primary_color   text not null default '#16a34a',
  secondary_color text not null default '#ffffff',
  visibility      text not null default 'private'
                  check (visibility in ('public','unlisted','private')),
  join_mode       text not null default 'invite_only'
                  check (join_mode in ('open','request','invite_only')),
  owner_id        uuid not null references public.profiles(id),
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_leagues_slug      on public.leagues(slug);
create index if not exists idx_leagues_owner_id  on public.leagues(owner_id);
create index if not exists idx_leagues_visibility on public.leagues(visibility) where deleted_at is null;

drop trigger if exists leagues_updated_at on public.leagues;
create trigger leagues_updated_at
  before update on public.leagues
  for each row execute function public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 3. TABLE: league_members (workspace memberships)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.league_members (
  id          uuid primary key default uuid_generate_v4(),
  league_id   uuid not null references public.leagues(id)   on delete cascade,
  user_id     uuid not null references public.profiles(id)  on delete cascade,
  role        public.league_role not null default 'league_admin',
  status      public.member_status not null default 'active',
  invited_by  uuid references public.profiles(id),
  joined_at   timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (league_id, user_id)
);

create index if not exists idx_league_members_league_id on public.league_members(league_id);
create index if not exists idx_league_members_user_id   on public.league_members(user_id);
create index if not exists idx_league_members_role      on public.league_members(role);

drop trigger if exists league_members_updated_at on public.league_members;
create trigger league_members_updated_at
  before update on public.league_members
  for each row execute function public.update_updated_at();

-- A league must always have at least one active owner. Last owner cannot be
-- demoted/removed; enforced via trigger (lightweight; finer rules live in RPCs).
create or replace function public.guard_last_league_owner()
returns trigger language plpgsql as $$
declare
  v_remaining int;
  v_league_id uuid;
begin
  -- Determine the league we're protecting, depending on operation.
  v_league_id := coalesce(old.league_id, new.league_id);

  -- For UPDATE: only enforce if role is changing OR status is leaving 'active'.
  if (tg_op = 'UPDATE') then
    if old.role = 'league_owner'
       and (new.role <> 'league_owner' or new.status <> 'active') then
      select count(*) into v_remaining
      from public.league_members
      where league_id = v_league_id
        and role      = 'league_owner'
        and status    = 'active'
        and id <> old.id;
      if v_remaining = 0 then
        raise exception 'last_league_owner_cannot_be_removed';
      end if;
    end if;
  elsif (tg_op = 'DELETE') then
    if old.role = 'league_owner' and old.status = 'active' then
      select count(*) into v_remaining
      from public.league_members
      where league_id = v_league_id
        and role      = 'league_owner'
        and status    = 'active'
        and id <> old.id;
      if v_remaining = 0 then
        raise exception 'last_league_owner_cannot_be_removed';
      end if;
    end if;
  end if;

  return coalesce(new, old);
end $$;

drop trigger if exists league_members_guard_last_owner on public.league_members;
create trigger league_members_guard_last_owner
  before update or delete on public.league_members
  for each row execute function public.guard_last_league_owner();

-- ─────────────────────────────────────────────────────────────
-- 4. TABLE: league_invitations
--    Mirrors public.invitations but for league-level roles.
--    Reuses enums: invitation_type, invitation_status.
-- ─────────────────────────────────────────────────────────────
create table if not exists public.league_invitations (
  id          uuid primary key default uuid_generate_v4(),
  league_id   uuid not null references public.leagues(id) on delete cascade,
  created_by  uuid not null references public.profiles(id),
  role        public.league_role not null default 'league_admin',
  type        public.invitation_type not null,
  token       text unique not null,
  code        text unique,
  status      public.invitation_status not null default 'pending',
  used_by     uuid references public.profiles(id),
  expires_at  timestamptz not null default (now() + interval '7 days'),
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_league_invitations_league_id on public.league_invitations(league_id);
create index if not exists idx_league_invitations_token     on public.league_invitations(token);
create index if not exists idx_league_invitations_code      on public.league_invitations(code);
create index if not exists idx_league_invitations_status    on public.league_invitations(status);

-- ─────────────────────────────────────────────────────────────
-- 5. TABLE: league_join_requests
--    Mirrors public.join_requests but at league scope (a team
--    requesting to participate in a league).
-- ─────────────────────────────────────────────────────────────
create table if not exists public.league_join_requests (
  id           uuid primary key default uuid_generate_v4(),
  league_id    uuid not null references public.leagues(id) on delete cascade,
  team_id      uuid not null references public.teams(id)   on delete cascade,
  requested_by uuid not null references public.profiles(id),
  status       text not null default 'pending'
               check (status in ('pending','approved','rejected')),
  reviewed_by  uuid references public.profiles(id),
  reviewed_at  timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (league_id, team_id)
);

create index if not exists idx_league_join_requests_league_id on public.league_join_requests(league_id);
create index if not exists idx_league_join_requests_team_id   on public.league_join_requests(team_id);
create index if not exists idx_league_join_requests_status    on public.league_join_requests(status);

drop trigger if exists league_join_requests_updated_at on public.league_join_requests;
create trigger league_join_requests_updated_at
  before update on public.league_join_requests
  for each row execute function public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 6. RLS — bare-bones; tighter policies land in migration 05
--    The defaults below ensure tables are RLS-protected from day 1.
-- ─────────────────────────────────────────────────────────────
alter table public.leagues              enable row level security;
alter table public.league_members       enable row level security;
alter table public.league_invitations   enable row level security;
alter table public.league_join_requests enable row level security;

-- Placeholder *deny-all*: no policies → no rows are visible to anon/authenticated
-- via PostgREST until migration 05 attaches the proper policies. SECURITY DEFINER
-- RPCs (created later) keep working because they bypass RLS by definition.
