-- ============================================================================
-- Withdrawal action audit trail (migration 0008)
-- Lives entirely in THIS platform's own database. The actual status changes
-- (and, for rejections, the coin refund) happen directly on PrizeUp's
-- redemptions/profiles/transactions tables — this just records who approved,
-- fulfilled, or rejected which request, and why, for accountability.
-- super_admin only.
-- ============================================================================

create table public.withdrawal_actions (
  id                     uuid primary key default gen_random_uuid(),
  admin_id               uuid not null references public.platform_users(id) on delete cascade,
  prizeup_redemption_id  uuid not null,
  action                 text not null check (action in ('approved', 'sent', 'rejected')),
  note                   text,
  created_at             timestamptz not null default now()
);
create index withdrawal_actions_redemption_id_idx on public.withdrawal_actions(prizeup_redemption_id);

alter table public.withdrawal_actions enable row level security;

create policy withdrawal_actions_select on public.withdrawal_actions for select
  using (public.is_super_admin());

create policy withdrawal_actions_insert on public.withdrawal_actions for insert
  with check (public.is_super_admin());

grant select, insert on public.withdrawal_actions to authenticated;
