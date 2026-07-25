-- ============================================================================
-- Creator campaigns bookkeeping (migration 0006)
-- Lives entirely in THIS platform's own database — never in PrizeUp's. This
-- just records which PrizeUp account (by its real profile id/email) an admin
-- registered as a tracked "creator", and a label for their own reference.
-- The actual referral mechanics (code, crediting, counting) are 100%
-- PrizeUp's own existing system — this table adds no new referral logic,
-- just an admin-facing index of "who did I set up, and what did I call it."
-- ============================================================================

create table public.creator_campaigns (
  id               uuid primary key default gen_random_uuid(),
  admin_id         uuid not null references public.platform_users(id) on delete cascade,
  prizeup_user_id  uuid not null,
  creator_email    text not null,
  campaign_name    text,
  created_at       timestamptz not null default now()
);
create index creator_campaigns_admin_id_idx on public.creator_campaigns(admin_id);
create unique index creator_campaigns_prizeup_user_id_uniq on public.creator_campaigns(prizeup_user_id);

alter table public.creator_campaigns enable row level security;

create policy creator_campaigns_select on public.creator_campaigns for select
  using (admin_id = auth.uid() or public.is_super_admin());

create policy creator_campaigns_insert on public.creator_campaigns for insert
  with check (admin_id = auth.uid() or public.is_super_admin());

grant select, insert on public.creator_campaigns to authenticated;
