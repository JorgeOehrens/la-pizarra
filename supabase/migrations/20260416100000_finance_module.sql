-- ============================================================
-- LaPizarra — Finance Module
-- Tables: team_charges, charge_distributions, payment_records
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. ENUMS
-- ─────────────────────────────────────────────────────────────

create type public.charge_type as enum (
  'cancha',
  'cuota_liga',
  'asado',
  'indumentaria',
  'evento',
  'otro'
);

create type public.charge_status as enum (
  'active',
  'completed',
  'overdue',
  'cancelled'
);

create type public.distribution_type as enum (
  'equal',
  'fixed_amount',
  'custom'
);

create type public.distribution_status as enum (
  'pending',
  'paid',
  'partial',
  'exempt',
  'not_applicable'
);

-- ─────────────────────────────────────────────────────────────
-- 2. team_charges — el cobro del equipo
-- ─────────────────────────────────────────────────────────────

create table public.team_charges (
  id                uuid primary key default uuid_generate_v4(),
  team_id           uuid not null references public.teams(id) on delete cascade,
  created_by        uuid not null references public.profiles(id),
  name              text not null,
  description       text,
  charge_type       public.charge_type not null,
  total_amount      numeric(10, 2) not null check (total_amount > 0),
  distribution_type public.distribution_type not null default 'equal',
  beneficiary_id    uuid references public.profiles(id),
  status            public.charge_status not null default 'active',
  due_date          date,
  deleted_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index idx_team_charges_team_id   on public.team_charges(team_id);
create index idx_team_charges_status    on public.team_charges(status);
create index idx_team_charges_team_date on public.team_charges(team_id, created_at desc);

create trigger team_charges_updated_at
  before update on public.team_charges
  for each row execute function public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 3. charge_distributions — obligación por jugador
-- ─────────────────────────────────────────────────────────────

create table public.charge_distributions (
  id              uuid primary key default uuid_generate_v4(),
  charge_id       uuid not null references public.team_charges(id) on delete cascade,
  team_id         uuid not null references public.teams(id),
  member_id       uuid not null references public.profiles(id),
  assigned_amount numeric(10, 2) not null check (assigned_amount >= 0),
  percentage      numeric(5, 2) check (percentage >= 0 and percentage <= 100),
  status          public.distribution_status not null default 'pending',
  paid_amount     numeric(10, 2) not null default 0 check (paid_amount >= 0),
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(charge_id, member_id)
);

create index idx_charge_dist_charge_id  on public.charge_distributions(charge_id);
create index idx_charge_dist_member_id  on public.charge_distributions(member_id);
create index idx_charge_dist_team_id    on public.charge_distributions(team_id);
create index idx_charge_dist_status     on public.charge_distributions(status);

create trigger charge_distributions_updated_at
  before update on public.charge_distributions
  for each row execute function public.update_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 4. payment_records — auditoría de cada pago confirmado
-- ─────────────────────────────────────────────────────────────

create table public.payment_records (
  id               uuid primary key default uuid_generate_v4(),
  distribution_id  uuid not null references public.charge_distributions(id) on delete cascade,
  charge_id        uuid not null references public.team_charges(id),
  team_id          uuid not null references public.teams(id),
  payer_id         uuid not null references public.profiles(id),
  amount           numeric(10, 2) not null check (amount > 0),
  confirmed_by     uuid not null references public.profiles(id),
  notes            text,
  created_at       timestamptz not null default now()
);

create index idx_payment_rec_distribution_id on public.payment_records(distribution_id);
create index idx_payment_rec_payer_id        on public.payment_records(payer_id);
create index idx_payment_rec_charge_id       on public.payment_records(charge_id);

-- ─────────────────────────────────────────────────────────────
-- 5. TRIGGER: auto-completar cobro cuando todos pagaron
-- ─────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────
-- 6. VISTAS
-- ─────────────────────────────────────────────────────────────

-- Deuda activa del jugador
create or replace view public.player_pending_charges as
select
  cd.member_id                             as player_id,
  cd.team_id,
  tc.id                                    as charge_id,
  tc.name                                  as charge_name,
  tc.charge_type,
  tc.due_date,
  cd.assigned_amount,
  cd.paid_amount,
  (cd.assigned_amount - cd.paid_amount)    as remaining_amount,
  cd.status                                as distribution_status,
  tc.status                                as charge_status,
  tc.beneficiary_id,
  p.display_name                           as beneficiary_name
from public.charge_distributions cd
join public.team_charges tc on tc.id = cd.charge_id
left join public.profiles p on p.id = tc.beneficiary_id
where cd.status in ('pending', 'partial')
  and tc.status in ('active', 'overdue')
  and tc.deleted_at is null;

-- Resumen financiero del equipo
create or replace view public.team_finance_summary as
select
  tc.team_id,
  tc.id                                                   as charge_id,
  tc.name,
  tc.charge_type,
  tc.total_amount,
  tc.status,
  tc.due_date,
  tc.beneficiary_id,
  count(cd.id)                                            as total_members,
  count(cd.id) filter (where cd.status = 'paid')          as paid_count,
  count(cd.id) filter (where cd.status = 'pending')       as pending_count,
  coalesce(sum(cd.paid_amount), 0)                        as collected_amount,
  (tc.total_amount - coalesce(sum(cd.paid_amount), 0))    as remaining_amount
from public.team_charges tc
left join public.charge_distributions cd on cd.charge_id = tc.id
where tc.deleted_at is null
group by tc.team_id, tc.id;

-- ─────────────────────────────────────────────────────────────
-- 7. RLS
-- ─────────────────────────────────────────────────────────────

alter table public.team_charges        enable row level security;
alter table public.charge_distributions enable row level security;
alter table public.payment_records      enable row level security;

-- team_charges: miembros activos pueden ver
create policy "team_members_view_charges"
  on public.team_charges for select
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_charges.team_id
        and tm.user_id = auth.uid()
        and tm.status = 'active'
    )
  );

-- team_charges: solo admins pueden crear/modificar
create policy "admins_manage_charges"
  on public.team_charges for all
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = team_charges.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
        and tm.status = 'active'
    )
  );

-- charge_distributions: jugador ve las suyas, admin ve todas del equipo
create policy "members_view_own_or_admin_all_distributions"
  on public.charge_distributions for select
  using (
    member_id = auth.uid()
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = charge_distributions.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
        and tm.status = 'active'
    )
  );

create policy "admins_manage_distributions"
  on public.charge_distributions for all
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = charge_distributions.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
        and tm.status = 'active'
    )
  );

-- payment_records: pagador ve los suyos, admin ve todos del equipo
create policy "members_view_own_or_admin_all_payments"
  on public.payment_records for select
  using (
    payer_id = auth.uid()
    or exists (
      select 1 from public.team_members tm
      where tm.team_id = payment_records.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
        and tm.status = 'active'
    )
  );

create policy "admins_manage_payments"
  on public.payment_records for all
  using (
    exists (
      select 1 from public.team_members tm
      where tm.team_id = payment_records.team_id
        and tm.user_id = auth.uid()
        and tm.role = 'admin'
        and tm.status = 'active'
    )
  );
