# Modelo de Datos — Finanzas del Equipo

> Agente: Database Agent
> Objetivo: Diseñar el schema de Supabase para el módulo de finanzas, con tablas, relaciones, estados y RLS.

---

## Diagrama de Entidades

```
teams
  │
  └──── team_charges (el cobro)
            │
            ├──── charge_distributions (obligación por jugador)
            │           │
            │           └──── payment_records (registro del pago)
            │
            └──── charge_beneficiary (quién recibe el dinero)
                        │
                        └──── profiles (el compañero que pagó el total)
```

---

## Tipos y Enumeraciones

```sql
-- Tipos de cobro disponibles
create type public.charge_type as enum (
    'cancha',           -- Cancha / reserva
    'cuota_liga',       -- Cuota de liga o federación
    'asado',            -- Asado / tercer tiempo
    'indumentaria',     -- Poleras, shorts, medias
    'evento',           -- Evento especial del equipo
    'otro'              -- Personalizado
);

-- Estado general del cobro
create type public.charge_status as enum (
    'active',           -- Cobro abierto, recibiendo pagos
    'completed',        -- Todos pagaron (o admin cerró)
    'overdue',          -- Pasó la fecha límite sin completarse
    'cancelled'         -- Cancelado por admin
);

-- Tipo de distribución del cobro
create type public.distribution_type as enum (
    'equal',            -- Partes iguales entre todos los incluidos
    'fixed_amount',     -- Monto fijo por jugador
    'custom'            -- Monto/porcentaje personalizado por jugador
);

-- Estado de la obligación individual de cada jugador
create type public.distribution_status as enum (
    'pending',          -- Debe pagar
    'paid',             -- Pagó el total
    'partial',          -- Pagó parcialmente
    'exempt',           -- Exento (no debe pagar)
    'not_applicable'    -- No aplica (ej: no asistió al asado)
);
```

---

## Tablas

### `team_charges` — El cobro del equipo

```sql
create table public.team_charges (
    id              uuid primary key default uuid_generate_v4(),
    team_id         uuid not null references public.teams(id) on delete cascade,
    created_by      uuid not null references public.profiles(id),

    -- Descripción
    name            text not null,                  -- "Cancha 15 Mayo"
    description     text,                           -- Detalle opcional
    charge_type     public.charge_type not null,

    -- Monto
    total_amount    numeric(10, 2) not null check (total_amount > 0),

    -- Distribución
    distribution_type public.distribution_type not null default 'equal',

    -- Quién recibe el dinero (si alguien pagó el total)
    -- null = va al fondo común / tesorería del equipo
    beneficiary_id  uuid references public.profiles(id),

    -- Estado y fechas
    status          public.charge_status not null default 'active',
    due_date        date,

    -- Metadata
    deleted_at      timestamptz,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create index idx_team_charges_team_id on public.team_charges(team_id);
create index idx_team_charges_status on public.team_charges(status);
create index idx_team_charges_created_by on public.team_charges(created_by);

create trigger team_charges_updated_at
    before update on public.team_charges
    for each row execute function public.update_updated_at();
```

---

### `charge_distributions` — Obligación por jugador

Una fila por cada jugador incluido en el cobro. Define cuánto debe cada uno y su estado.

```sql
create table public.charge_distributions (
    id              uuid primary key default uuid_generate_v4(),
    charge_id       uuid not null references public.team_charges(id) on delete cascade,
    team_id         uuid not null references public.teams(id),   -- desnormalizado
    member_id       uuid not null references public.profiles(id),

    -- Monto asignado a este jugador
    assigned_amount numeric(10, 2) not null check (assigned_amount >= 0),

    -- Porcentaje del total (para referencia y auditoría)
    percentage      numeric(5, 2) check (percentage >= 0 and percentage <= 100),

    -- Estado del pago de este jugador
    status          public.distribution_status not null default 'pending',

    -- Cuánto ha pagado efectivamente (para pagos parciales)
    paid_amount     numeric(10, 2) not null default 0 check (paid_amount >= 0),

    -- Nota opcional del admin (ej: "estudiante — 50%")
    notes           text,

    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),

    unique(charge_id, member_id)
);

create index idx_charge_distributions_charge_id on public.charge_distributions(charge_id);
create index idx_charge_distributions_member_id on public.charge_distributions(member_id);
create index idx_charge_distributions_team_id on public.charge_distributions(team_id);
create index idx_charge_distributions_status on public.charge_distributions(status);

create trigger charge_distributions_updated_at
    before update on public.charge_distributions
    for each row execute function public.update_updated_at();
```

---

### `payment_records` — Registro de cada pago

Auditoría de cada pago confirmado. Permite pagos parciales y múltiples confirmaciones.

```sql
create table public.payment_records (
    id                  uuid primary key default uuid_generate_v4(),
    distribution_id     uuid not null references public.charge_distributions(id) on delete cascade,
    charge_id           uuid not null references public.team_charges(id),   -- desnormalizado
    team_id             uuid not null references public.teams(id),           -- desnormalizado
    payer_id            uuid not null references public.profiles(id),        -- quien pagó

    -- Monto de este pago específico
    amount              numeric(10, 2) not null check (amount > 0),

    -- Quién confirmó el pago (admin/capitán)
    confirmed_by        uuid not null references public.profiles(id),

    -- Notas (ej: "transferido por Mercado Pago", "pagó en efectivo")
    notes               text,

    created_at          timestamptz not null default now()
);

create index idx_payment_records_distribution_id on public.payment_records(distribution_id);
create index idx_payment_records_payer_id on public.payment_records(payer_id);
create index idx_payment_records_charge_id on public.payment_records(charge_id);
```

---

## Relaciones y Cardinalidades

| Relación | Cardinalidad | Notas |
|---|---|---|
| team → team_charges | 1:N | Un equipo tiene muchos cobros |
| team_charges → charge_distributions | 1:N | Un cobro tiene una fila por jugador |
| charge_distributions → payment_records | 1:N | Permite pagos parciales múltiples |
| team_charges → profiles (beneficiary) | N:1 nullable | Si alguien pagó el total |
| charge_distributions → profiles (member) | N:1 | El jugador que debe |

---

## Lógica de Estados

### Estado del cobro (`team_charges.status`)

```
active ──────────────────────────────→ completed
  │                                       (todos pagaron o admin cierra)
  │
  ├──── due_date pasó sin completar ──→ overdue
  │
  └──── admin cancela ──────────────→ cancelled
```

### Estado de distribución individual

```
pending ──→ paid           (pagó el total asignado)
        ──→ partial        (pagó menos del total)
        ──→ exempt         (admin lo eximió)
        ──→ not_applicable (admin lo excluyó del cobro)
partial ──→ paid           (completó el resto)
```

### Trigger: Auto-completar cobro

```sql
-- Función que verifica si todos los no-exentos pagaron
create or replace function public.check_charge_completion()
returns trigger as $$
declare
    pending_count integer;
begin
    select count(*) into pending_count
    from public.charge_distributions
    where charge_id = new.charge_id
      and status in ('pending', 'partial');

    if pending_count = 0 then
        update public.team_charges
        set status = 'completed'
        where id = new.charge_id
          and status = 'active';
    end if;

    return new;
end;
$$ language plpgsql;

create trigger auto_complete_charge
    after update on public.charge_distributions
    for each row
    when (new.status in ('paid', 'exempt', 'not_applicable'))
    execute function public.check_charge_completion();
```

---

## Vistas Útiles

### Vista: deuda activa por jugador

```sql
create or replace view public.player_pending_charges as
select
    cd.member_id                                    as player_id,
    cd.team_id,
    tc.id                                           as charge_id,
    tc.name                                         as charge_name,
    tc.charge_type,
    tc.due_date,
    cd.assigned_amount,
    cd.paid_amount,
    (cd.assigned_amount - cd.paid_amount)           as remaining_amount,
    cd.status                                       as distribution_status,
    tc.beneficiary_id,
    p.display_name                                  as beneficiary_name
from public.charge_distributions cd
join public.team_charges tc on tc.id = cd.charge_id
left join public.profiles p on p.id = tc.beneficiary_id
where cd.status in ('pending', 'partial')
  and tc.status in ('active', 'overdue')
  and tc.deleted_at is null;
```

### Vista: resumen financiero del equipo

```sql
create or replace view public.team_finance_summary as
select
    tc.team_id,
    tc.id                                                   as charge_id,
    tc.name,
    tc.charge_type,
    tc.total_amount,
    tc.status,
    tc.due_date,
    count(cd.id)                                            as total_members,
    count(cd.id) filter (where cd.status = 'paid')          as paid_count,
    count(cd.id) filter (where cd.status = 'pending')       as pending_count,
    coalesce(sum(cd.paid_amount), 0)                        as collected_amount,
    (tc.total_amount - coalesce(sum(cd.paid_amount), 0))    as remaining_amount
from public.team_charges tc
left join public.charge_distributions cd on cd.charge_id = tc.id
where tc.deleted_at is null
group by tc.team_id, tc.id;
```

---

## RLS Policies

```sql
-- Habilitar RLS
alter table public.team_charges enable row level security;
alter table public.charge_distributions enable row level security;
alter table public.payment_records enable row level security;

-- team_charges: visible para todos los miembros del equipo
create policy "members_can_view_charges" on public.team_charges
    for select using (
        exists (
            select 1 from public.team_members tm
            where tm.team_id = team_charges.team_id
              and tm.user_id = auth.uid()
              and tm.status = 'active'
        )
    );

-- team_charges: solo admins pueden crear/editar
create policy "admins_can_manage_charges" on public.team_charges
    for all using (
        exists (
            select 1 from public.team_members tm
            where tm.team_id = team_charges.team_id
              and tm.user_id = auth.uid()
              and tm.role = 'admin'
              and tm.status = 'active'
        )
    );

-- charge_distributions: miembros ven sus propias distribuciones
-- admins ven todas las del equipo
create policy "members_view_own_distributions" on public.charge_distributions
    for select using (
        member_id = auth.uid()
        or
        exists (
            select 1 from public.team_members tm
            where tm.team_id = charge_distributions.team_id
              and tm.user_id = auth.uid()
              and tm.role = 'admin'
        )
    );

-- Solo admins pueden modificar distribuciones
create policy "admins_manage_distributions" on public.charge_distributions
    for all using (
        exists (
            select 1 from public.team_members tm
            where tm.team_id = charge_distributions.team_id
              and tm.user_id = auth.uid()
              and tm.role = 'admin'
        )
    );

-- payment_records: acceso igual a distribuciones
create policy "members_view_own_payments" on public.payment_records
    for select using (
        payer_id = auth.uid()
        or
        exists (
            select 1 from public.team_members tm
            where tm.team_id = payment_records.team_id
              and tm.user_id = auth.uid()
              and tm.role = 'admin'
        )
    );

create policy "admins_manage_payments" on public.payment_records
    for all using (
        exists (
            select 1 from public.team_members tm
            where tm.team_id = payment_records.team_id
              and tm.user_id = auth.uid()
              and tm.role = 'admin'
        )
    );
```

---

## Resumen de Tablas

| Tabla | PK | FKs principales | Notas |
|---|---|---|---|
| team_charges | id | teams, profiles (created_by, beneficiary) | soft delete |
| charge_distributions | id | team_charges, teams, profiles | unique(charge, member) |
| payment_records | id | charge_distributions, team_charges, teams, profiles | audit log |

---

*Database Agent — LaPizarra Knowledge Base*
