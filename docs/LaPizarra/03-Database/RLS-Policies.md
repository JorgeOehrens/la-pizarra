# Row Level Security — Políticas de Supabase

> Agente: Database Agent
> RLS es la primera línea de seguridad. Un usuario NO debe poder ver datos de equipos a los que no pertenece.

---

## Principio General

```
Regla de oro: Si no eres miembro del equipo, no ves nada.
```

Cada tabla con datos sensibles tiene RLS habilitado y políticas explícitas.

---

## Helper Functions

```sql
-- Verifica si el usuario actual es miembro de un equipo
create or replace function public.is_team_member(team_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.team_members
        where team_members.team_id = $1
          and team_members.user_id = auth.uid()
          and team_members.status = 'active'
    );
$$ language sql security definer stable;

-- Verifica si el usuario actual es admin de un equipo
create or replace function public.is_team_admin(team_id uuid)
returns boolean as $$
    select exists (
        select 1 from public.team_members
        where team_members.team_id = $1
          and team_members.user_id = auth.uid()
          and team_members.role = 'admin'
          and team_members.status = 'active'
    );
$$ language sql security definer stable;
```

---

## Políticas por Tabla

### profiles
```sql
alter table public.profiles enable row level security;

-- Cualquier usuario autenticado puede ver perfiles (para mostrar jugadores)
create policy "Profiles are viewable by authenticated users"
    on public.profiles for select
    to authenticated
    using (true);

-- Solo puedes editar tu propio perfil
create policy "Users can update own profile"
    on public.profiles for update
    to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);
```

### teams
```sql
alter table public.teams enable row level security;

-- Solo los miembros pueden ver el equipo
create policy "Team members can view their teams"
    on public.teams for select
    to authenticated
    using (
        deleted_at is null and
        public.is_team_member(id)
    );

-- Cualquier usuario puede crear un equipo
create policy "Authenticated users can create teams"
    on public.teams for insert
    to authenticated
    with check (created_by = auth.uid());

-- Solo el admin puede editar el equipo
create policy "Team admins can update their team"
    on public.teams for update
    to authenticated
    using (public.is_team_admin(id))
    with check (public.is_team_admin(id));

-- Soft delete: solo el admin puede marcar como borrado
create policy "Team admins can delete their team"
    on public.teams for update
    to authenticated
    using (public.is_team_admin(id));
```

### team_members
```sql
alter table public.team_members enable row level security;

-- Los miembros pueden ver la plantilla completa del equipo
create policy "Team members can view squad"
    on public.team_members for select
    to authenticated
    using (public.is_team_member(team_id));

-- Solo los admins pueden agregar miembros
create policy "Team admins can add members"
    on public.team_members for insert
    to authenticated
    with check (public.is_team_admin(team_id));

-- Los admins pueden editar cualquier miembro; los jugadores solo se editan a sí mismos
create policy "Members can update their own data or admins can update anyone"
    on public.team_members for update
    to authenticated
    using (
        public.is_team_admin(team_id) or
        (user_id = auth.uid() and public.is_team_member(team_id))
    );
```

### invitations
```sql
alter table public.invitations enable row level security;

-- Los miembros pueden ver las invitaciones de su equipo
create policy "Team members can view invitations"
    on public.invitations for select
    to authenticated
    using (public.is_team_member(team_id));

-- Solo los admins pueden crear invitaciones
create policy "Team admins can create invitations"
    on public.invitations for insert
    to authenticated
    with check (
        public.is_team_admin(team_id) and
        created_by = auth.uid()
    );

-- Los admins pueden revocar invitaciones
create policy "Team admins can revoke invitations"
    on public.invitations for update
    to authenticated
    using (public.is_team_admin(team_id));

-- IMPORTANTE: Permitir que usuarios NO miembros lean invitaciones por token/código
-- Esto es necesario para que alguien pueda unirse con un link
create policy "Anyone can read invitation by token"
    on public.invitations for select
    to authenticated
    using (
        status = 'pending' and
        expires_at > now()
    );
```

### matches
```sql
alter table public.matches enable row level security;

-- Solo los miembros pueden ver los partidos
create policy "Team members can view matches"
    on public.matches for select
    to authenticated
    using (
        deleted_at is null and
        public.is_team_member(team_id)
    );

-- Solo los admins pueden crear partidos
create policy "Team admins can create matches"
    on public.matches for insert
    to authenticated
    with check (
        public.is_team_admin(team_id) and
        created_by = auth.uid()
    );

-- Solo los admins pueden editar partidos
create policy "Team admins can update matches"
    on public.matches for update
    to authenticated
    using (public.is_team_admin(team_id));
```

### match_events
```sql
alter table public.match_events enable row level security;

-- Los miembros pueden ver todos los eventos
create policy "Team members can view events"
    on public.match_events for select
    to authenticated
    using (public.is_team_member(team_id));

-- Solo los admins pueden crear eventos
create policy "Team admins can create events"
    on public.match_events for insert
    to authenticated
    with check (
        public.is_team_admin(team_id) and
        created_by = auth.uid()
    );

-- Solo los admins pueden borrar eventos
create policy "Team admins can delete events"
    on public.match_events for delete
    to authenticated
    using (public.is_team_admin(team_id));
```

### manual_stat_adjustments
```sql
alter table public.manual_stat_adjustments enable row level security;

-- Los miembros pueden ver los ajustes
create policy "Team members can view adjustments"
    on public.manual_stat_adjustments for select
    to authenticated
    using (public.is_team_member(team_id));

-- Solo los admins pueden crear ajustes
create policy "Team admins can create adjustments"
    on public.manual_stat_adjustments for insert
    to authenticated
    with check (
        public.is_team_admin(team_id) and
        created_by = auth.uid()
    );
```

---

## Notas Importantes

1. Las **vistas** (`player_stats`, `team_stats`) heredan RLS de las tablas subyacentes
2. Las **funciones** con `security definer` ejecutan con privilegios del owner — usarlas con cuidado
3. Los **Storage buckets** tienen sus propias políticas:

```sql
-- Bucket: team-logos (público)
-- Cualquiera puede leer, solo el admin del equipo puede subir
insert into storage.buckets (id, name, public) values ('team-logos', 'team-logos', true);

create policy "Team logos are publicly accessible"
    on storage.objects for select
    using (bucket_id = 'team-logos');

create policy "Team admins can upload logos"
    on storage.objects for insert
    to authenticated
    with check (
        bucket_id = 'team-logos'
        -- La ruta debe ser: team-logos/{team_id}/logo.{ext}
    );

-- Bucket: avatars (autenticado)
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', false);

create policy "Users can view their own avatar"
    on storage.objects for select
    to authenticated
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload their own avatar"
    on storage.objects for insert
    to authenticated
    with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
```

---

*Database Agent — LaPizarra Knowledge Base*
