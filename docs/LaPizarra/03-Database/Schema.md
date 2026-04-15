# Schema de Base de Datos — Supabase

> Agente: Database Agent
> Este es el schema completo y ejecutable del MVP. Diseñado para escalar.

---

## Principios del Schema

1. **UUIDs en todas las tablas** — compatible con Supabase auth y distribuido
2. **soft delete** — columna `deleted_at` en tablas críticas, nunca hard delete
3. **timestamps estándar** — `created_at`, `updated_at` en todas las tablas
4. **RLS en todo** — ver [[03-Database/RLS-Policies]]
5. **Índices en foreign keys y columnas de búsqueda frecuente**

---

## Diagrama de Entidades

```
users (auth.users)
    │
    ├──────────────────────────────┐
    │                              │
profiles                    team_members
    │                              │
    │                          teams ─────── invitations
    │                              │
    │                         matches
    │                              │
    └──────────────────────── match_events
                                   │
                         (goles, asistencias, autogoles)

player_stats (vista calculada o tabla de cache)
team_stats   (vista calculada o tabla de cache)
```

---

## SQL Completo — Ejecutar en Supabase

```sql
-- ============================================
-- EXTENSIONES
-- ============================================
create extension if not exists "uuid-ossp";

-- ============================================
-- TABLA: profiles
-- Extiende auth.users con datos de la app
-- ============================================
create table public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    username    text unique not null,
    display_name text,
    avatar_url  text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

-- Index para búsqueda por username
create index idx_profiles_username on public.profiles(username);

-- Trigger para actualizar updated_at automáticamente
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at();

-- Trigger para crear profile automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, username, display_name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
        coalesce(new.raw_user_meta_data->>'display_name', null)
    );
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- ============================================
-- TABLA: teams
-- ============================================
create table public.teams (
    id          uuid primary key default uuid_generate_v4(),
    name        text not null,
    slug        text unique not null, -- URL-friendly name
    logo_url    text,
    primary_color   text default '#16a34a', -- verde por defecto
    secondary_color text default '#ffffff',
    created_by  uuid not null references public.profiles(id),
    deleted_at  timestamptz,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_teams_slug on public.teams(slug);
create index idx_teams_created_by on public.teams(created_by);

create trigger teams_updated_at
    before update on public.teams
    for each row execute function public.update_updated_at();

-- ============================================
-- TABLA: team_members
-- Relación usuario-equipo con rol
-- ============================================
create type public.team_role as enum ('admin', 'player');
create type public.member_status as enum ('active', 'inactive');

create table public.team_members (
    id          uuid primary key default uuid_generate_v4(),
    team_id     uuid not null references public.teams(id) on delete cascade,
    user_id     uuid not null references public.profiles(id) on delete cascade,
    role        public.team_role not null default 'player',
    status      public.member_status not null default 'active',
    -- Datos específicos del jugador dentro de este equipo
    jersey_number   smallint check (jersey_number >= 1 and jersey_number <= 99),
    position    text check (position in ('goalkeeper', 'defender', 'midfielder', 'forward')),
    -- Timestamps
    joined_at   timestamptz not null default now(),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    -- Constraints
    unique(team_id, user_id),
    unique(team_id, jersey_number) -- número único por equipo
);

create index idx_team_members_team_id on public.team_members(team_id);
create index idx_team_members_user_id on public.team_members(user_id);

create trigger team_members_updated_at
    before update on public.team_members
    for each row execute function public.update_updated_at();

-- ============================================
-- TABLA: invitations
-- Links y códigos de invitación al equipo
-- ============================================
create type public.invitation_type as enum ('link', 'code');
create type public.invitation_status as enum ('pending', 'accepted', 'rejected', 'expired', 'revoked');

create table public.invitations (
    id          uuid primary key default uuid_generate_v4(),
    team_id     uuid not null references public.teams(id) on delete cascade,
    created_by  uuid not null references public.profiles(id),
    type        public.invitation_type not null,
    token       text unique not null, -- UUID para links
    code        text unique,          -- 6 chars para códigos
    status      public.invitation_status not null default 'pending',
    used_by     uuid references public.profiles(id),
    expires_at  timestamptz not null default (now() + interval '7 days'),
    used_at     timestamptz,
    created_at  timestamptz not null default now()
);

create index idx_invitations_team_id on public.invitations(team_id);
create index idx_invitations_token on public.invitations(token);
create index idx_invitations_code on public.invitations(code);

-- ============================================
-- TABLA: venues (lugares predefinidos)
-- ============================================
create table public.venues (
    id          uuid primary key default uuid_generate_v4(),
    name        text not null,
    address     text,
    city        text,
    is_system   boolean not null default false, -- true = predefinido, false = custom
    created_by  uuid references public.profiles(id),
    team_id     uuid references public.teams(id), -- null = global
    created_at  timestamptz not null default now()
);

create index idx_venues_team_id on public.venues(team_id);

-- ============================================
-- TABLA: matches
-- ============================================
create type public.match_type as enum ('friendly', 'league', 'cup', 'tournament');
create type public.match_status as enum ('scheduled', 'in_progress', 'finished', 'cancelled', 'postponed');

create table public.matches (
    id              uuid primary key default uuid_generate_v4(),
    team_id         uuid not null references public.teams(id) on delete cascade,
    opponent_name   text not null,
    -- En el futuro: opponent_team_id references teams(id)
    match_date      timestamptz not null,
    venue_id        uuid references public.venues(id),
    venue_custom    text, -- nombre custom si no usa venue_id
    type            public.match_type not null default 'friendly',
    status          public.match_status not null default 'scheduled',
    -- Resultado
    goals_for       smallint check (goals_for >= 0),
    goals_against   smallint check (goals_against >= 0),
    -- Metadata
    notes           text,
    created_by      uuid not null references public.profiles(id),
    deleted_at      timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index idx_matches_team_id on public.matches(team_id);
create index idx_matches_match_date on public.matches(match_date desc);
create index idx_matches_status on public.matches(status);

create trigger matches_updated_at
    before update on public.matches
    for each row execute function public.update_updated_at();

-- Columna calculada para resultado
create or replace function public.match_result(m public.matches)
returns text as $$
begin
    if m.goals_for is null or m.goals_against is null then
        return null;
    elsif m.goals_for > m.goals_against then
        return 'W';
    elsif m.goals_for < m.goals_against then
        return 'L';
    else
        return 'D';
    end if;
end;
$$ language plpgsql immutable;

-- ============================================
-- TABLA: match_events
-- Goles, asistencias, autogoles
-- ============================================
create type public.event_type as enum ('goal', 'assist', 'own_goal', 'yellow_card', 'red_card');

create table public.match_events (
    id          uuid primary key default uuid_generate_v4(),
    match_id    uuid not null references public.matches(id) on delete cascade,
    team_id     uuid not null references public.teams(id), -- desnormalizado para queries rápidas
    player_id   uuid not null references public.profiles(id),
    event_type  public.event_type not null,
    minute      smallint check (minute >= 0 and minute <= 120),
    -- Para goles con asistencia: event_id del gol relacionado
    related_event_id uuid references public.match_events(id),
    notes       text,
    created_by  uuid not null references public.profiles(id),
    created_at  timestamptz not null default now()
);

create index idx_match_events_match_id on public.match_events(match_id);
create index idx_match_events_player_id on public.match_events(player_id);
create index idx_match_events_team_id on public.match_events(team_id);
create index idx_match_events_event_type on public.match_events(event_type);

-- ============================================
-- TABLA: manual_stat_adjustments
-- Ajustes manuales de estadísticas
-- ============================================
create table public.manual_stat_adjustments (
    id          uuid primary key default uuid_generate_v4(),
    team_id     uuid not null references public.teams(id) on delete cascade,
    player_id   uuid not null references public.profiles(id),
    stat_type   text not null check (stat_type in ('goals', 'assists', 'matches_played', 'own_goals')),
    delta       integer not null, -- puede ser negativo para corregir
    reason      text,
    created_by  uuid not null references public.profiles(id),
    created_at  timestamptz not null default now()
);

create index idx_manual_adjustments_player_id on public.manual_stat_adjustments(player_id, team_id);

-- ============================================
-- VISTA: player_stats
-- Stats calculadas automáticamente por jugador/equipo
-- ============================================
create or replace view public.player_stats as
select
    tm.user_id as player_id,
    tm.team_id,
    -- Partidos jugados (aproximado: si tiene al menos 1 evento en ese partido)
    (
        select count(distinct me.match_id)
        from public.match_events me
        join public.matches m on m.id = me.match_id
        where me.player_id = tm.user_id
          and me.team_id = tm.team_id
          and m.status = 'finished'
          and m.deleted_at is null
    ) as matches_played,
    -- Goles
    (
        select count(*)
        from public.match_events me
        join public.matches m on m.id = me.match_id
        where me.player_id = tm.user_id
          and me.team_id = tm.team_id
          and me.event_type = 'goal'
          and m.deleted_at is null
    ) +
    coalesce((
        select sum(delta)
        from public.manual_stat_adjustments msa
        where msa.player_id = tm.user_id
          and msa.team_id = tm.team_id
          and msa.stat_type = 'goals'
    ), 0) as goals,
    -- Asistencias
    (
        select count(*)
        from public.match_events me
        join public.matches m on m.id = me.match_id
        where me.player_id = tm.user_id
          and me.team_id = tm.team_id
          and me.event_type = 'assist'
          and m.deleted_at is null
    ) +
    coalesce((
        select sum(delta)
        from public.manual_stat_adjustments msa
        where msa.player_id = tm.user_id
          and msa.team_id = tm.team_id
          and msa.stat_type = 'assists'
    ), 0) as assists,
    -- Autogoles
    (
        select count(*)
        from public.match_events me
        join public.matches m on m.id = me.match_id
        where me.player_id = tm.user_id
          and me.team_id = tm.team_id
          and me.event_type = 'own_goal'
          and m.deleted_at is null
    ) as own_goals
from public.team_members tm
where tm.status = 'active';

-- ============================================
-- VISTA: team_stats
-- Stats calculadas por equipo
-- ============================================
create or replace view public.team_stats as
select
    t.id as team_id,
    count(m.id) filter (where m.status = 'finished') as matches_played,
    count(m.id) filter (where m.status = 'finished' and m.goals_for > m.goals_against) as wins,
    count(m.id) filter (where m.status = 'finished' and m.goals_for = m.goals_against) as draws,
    count(m.id) filter (where m.status = 'finished' and m.goals_for < m.goals_against) as losses,
    coalesce(sum(m.goals_for) filter (where m.status = 'finished'), 0) as goals_for,
    coalesce(sum(m.goals_against) filter (where m.status = 'finished'), 0) as goals_against,
    coalesce(sum(m.goals_for) filter (where m.status = 'finished'), 0) -
    coalesce(sum(m.goals_against) filter (where m.status = 'finished'), 0) as goal_difference
from public.teams t
left join public.matches m on m.team_id = t.id and m.deleted_at is null
where t.deleted_at is null
group by t.id;
```

---

## Tablas y sus Relaciones — Resumen

| Tabla                   | PK      | FKs principales          | Notas               |
| ----------------------- | ------- | ------------------------ | ------------------- |
| profiles                | user_id | auth.users               | 1:1 con auth        |
| teams                   | id      | profiles(created_by)     | soft delete         |
| team_members            | id      | teams, profiles          | unique(team, user)  |
| invitations             | id      | teams, profiles          | token + code únicos |
| venues                  | id      | teams (nullable)         | globales y custom   |
| matches                 | id      | teams, venues, profiles  | soft delete         |
| match_events            | id      | matches, teams, profiles | events del partido  |
| manual_stat_adjustments | id      | teams, profiles          | audit de ediciones  |

---

## Índices Críticos para Performance

```sql
-- Queries más frecuentes:
-- 1. "Dame todos los partidos del equipo X" → idx_matches_team_id
-- 2. "Dame todos los goles del jugador X" → idx_match_events_player_id
-- 3. "Dame la plantilla del equipo X" → idx_team_members_team_id
-- 4. "Busca invitación por token" → idx_invitations_token
-- 5. "Historial por fecha" → idx_matches_match_date (desc)
```

---

*Database Agent — LaPizarra Knowledge Base*
