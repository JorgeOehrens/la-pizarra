# Plan de Migraciones

> Agente: Database Agent
> Orden de ejecución de migraciones para Supabase. Cada migración es incremental y reversible.

---

## Configuración Inicial

```bash
# Instalar Supabase CLI
brew install supabase/tap/supabase

# Inicializar en el proyecto
supabase init

# Conectar al proyecto remoto
supabase link --project-ref <PROJECT_REF>

# Hacer pull del schema actual (si existe)
supabase db pull
```

---

## Estructura de Archivos de Migración

```
supabase/
  migrations/
    20260414000001_initial_setup.sql
    20260414000002_profiles.sql
    20260414000003_teams.sql
    20260414000004_team_members.sql
    20260414000005_invitations.sql
    20260414000006_venues.sql
    20260414000007_matches.sql
    20260414000008_match_events.sql
    20260414000009_manual_stats.sql
    20260414000010_views.sql
    20260414000011_rls_policies.sql
    20260414000012_storage_buckets.sql
    20260414000013_seed_venues.sql
```

---

## Migración 001: Setup Inicial

```sql
-- supabase/migrations/20260414000001_initial_setup.sql
create extension if not exists "uuid-ossp";

-- Función compartida para updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;
```

---

## Migración 002: Profiles

```sql
-- supabase/migrations/20260414000002_profiles.sql
create table public.profiles (
    id          uuid primary key references auth.users(id) on delete cascade,
    username    text unique not null,
    display_name text,
    avatar_url  text,
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now()
);

create index idx_profiles_username on public.profiles(username);

create trigger profiles_updated_at
    before update on public.profiles
    for each row execute function public.update_updated_at();

-- Auto-crear profile al registrarse
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
```

---

## Migración 003: Teams

```sql
-- supabase/migrations/20260414000003_teams.sql
create table public.teams (
    id              uuid primary key default uuid_generate_v4(),
    name            text not null,
    slug            text unique not null,
    logo_url        text,
    primary_color   text default '#16a34a',
    secondary_color text default '#ffffff',
    created_by      uuid not null references public.profiles(id),
    deleted_at      timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index idx_teams_slug on public.teams(slug);
create index idx_teams_created_by on public.teams(created_by);

create trigger teams_updated_at
    before update on public.teams
    for each row execute function public.update_updated_at();
```

---

## Migración 004: Team Members

```sql
-- supabase/migrations/20260414000004_team_members.sql
create type public.team_role as enum ('admin', 'player');
create type public.member_status as enum ('active', 'inactive');

create table public.team_members (
    id              uuid primary key default uuid_generate_v4(),
    team_id         uuid not null references public.teams(id) on delete cascade,
    user_id         uuid not null references public.profiles(id) on delete cascade,
    role            public.team_role not null default 'player',
    status          public.member_status not null default 'active',
    jersey_number   smallint check (jersey_number >= 1 and jersey_number <= 99),
    position        text check (position in ('goalkeeper', 'defender', 'midfielder', 'forward')),
    joined_at       timestamptz not null default now(),
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    unique(team_id, user_id),
    unique(team_id, jersey_number)
);

create index idx_team_members_team_id on public.team_members(team_id);
create index idx_team_members_user_id on public.team_members(user_id);

create trigger team_members_updated_at
    before update on public.team_members
    for each row execute function public.update_updated_at();
```

---

## Migración 005: Invitations

```sql
-- supabase/migrations/20260414000005_invitations.sql
create type public.invitation_type as enum ('link', 'code');
create type public.invitation_status as enum ('pending', 'accepted', 'rejected', 'expired', 'revoked');

create table public.invitations (
    id          uuid primary key default uuid_generate_v4(),
    team_id     uuid not null references public.teams(id) on delete cascade,
    created_by  uuid not null references public.profiles(id),
    type        public.invitation_type not null,
    token       text unique not null,
    code        text unique,
    status      public.invitation_status not null default 'pending',
    used_by     uuid references public.profiles(id),
    expires_at  timestamptz not null default (now() + interval '7 days'),
    used_at     timestamptz,
    created_at  timestamptz not null default now()
);

create index idx_invitations_team_id on public.invitations(team_id);
create index idx_invitations_token on public.invitations(token);
create index idx_invitations_code on public.invitations(code);
```

---

## Migración 013: Seed de Venues

```sql
-- supabase/migrations/20260414000013_seed_venues.sql
-- Venues predefinidos del sistema
insert into public.venues (name, is_system) values
    ('Cancha Municipal Norte', true),
    ('Cancha Municipal Sur', true),
    ('Cancha Sintética Centro', true),
    ('Estadio Municipal', true),
    ('Polideportivo', true),
    ('Cancha de tierra', true),
    ('Local (visitante)', true),
    ('Visita (fuera de casa)', true),
    ('Neutral', true);
```

---

## Workflow de Desarrollo

```bash
# Crear nueva migración
supabase migration new nombre_de_la_migracion

# Aplicar en local
supabase db reset

# Aplicar en producción
supabase db push

# Generar tipos TypeScript
supabase gen types typescript --linked > lib/supabase/database.types.ts
```

---

## Rollback Strategy

Supabase no soporta rollback automático de migraciones. Para hacer rollback:

```sql
-- Crear una migración de rollback explícita
-- Ejemplo: rollback de match_events
-- supabase/migrations/20260414000099_rollback_match_events.sql
drop table if exists public.match_events;
drop type if exists public.event_type;
```

**Regla:** Siempre tener el SQL de rollback documentado antes de aplicar en producción.

---

*Database Agent — LaPizarra Knowledge Base*
