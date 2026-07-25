-- ============================================================================
-- Balance adjustment audit trail (migration 0007)
-- Lives entirely in THIS platform's own database — the actual coins/gems
-- mutation happens directly on PrizeUp's profiles table (via prizeupQuery),
-- but who did it, to whom, and why is recorded here so there's real
-- accountability for a feature that moves real value. super_admin only.
-- ============================================================================

create table public.balance_adjustments (
  id               uuid primary key default gen_random_uuid(),
  admin_id         uuid not null references public.platform_users(id) on delete cascade,
  prizeup_user_id  uuid not null,
  coins_delta      bigint not null default 0,
  gems_delta       bigint not null default 0,
  reason           text not null,
  created_at       timestamptz not null default now()
);
create index balance_adjustments_prizeup_user_id_idx on public.balance_adjustments(prizeup_user_id);

alter table public.balance_adjustments enable row level security;

create policy balance_adjustments_select on public.balance_adjustments for select
  using (public.is_super_admin());

create policy balance_adjustments_insert on public.balance_adjustments for insert
  with check (public.is_super_admin());

grant select, insert on public.balance_adjustments to authenticated;
