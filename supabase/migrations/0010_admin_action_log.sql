-- ============================================================================
-- General admin action log (migration 0010)
-- Covers the security-relevant platform actions that didn't already have a
-- dedicated audit table: registering an app, creating an admin, changing a
-- role, deleting an account. (Balance adjustments and withdrawal actions
-- already have their own — balance_adjustments, withdrawal_actions.)
-- super_admin only.
-- ============================================================================

create table public.admin_action_log (
  id         bigint generated always as identity primary key,
  admin_id   uuid not null references public.platform_users(id) on delete cascade,
  action     text not null,
  target     text,
  detail     text,
  created_at timestamptz not null default now()
);
create index admin_action_log_created_at_idx on public.admin_action_log(created_at desc);

alter table public.admin_action_log enable row level security;

create policy admin_action_log_select on public.admin_action_log for select
  using (public.is_super_admin());

create policy admin_action_log_insert on public.admin_action_log for insert
  with check (public.is_super_admin());

grant select, insert on public.admin_action_log to authenticated;
