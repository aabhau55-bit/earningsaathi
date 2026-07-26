-- ============================================================================
-- Creator-facing display percentage (migration 0011)
-- Lets an admin (their own campaigns) or super_admin (any campaign) scale the
-- referral numbers a creator sees on the public /creator/[code] stats page,
-- without touching the real counts used anywhere internally (super/admins,
-- admin dashboard keep showing the true PrizeUp `referrals` count always).
-- Defaults to 100 (creator sees the real number until someone dials it down).
-- ============================================================================

alter table public.creator_campaigns
  add column display_percentage smallint not null default 100
    constraint creator_campaigns_display_percentage_check
    check (display_percentage between 1 and 500);

create policy creator_campaigns_update on public.creator_campaigns for update
  using (admin_id = auth.uid() or public.is_super_admin())
  with check (admin_id = auth.uid() or public.is_super_admin());

grant update on public.creator_campaigns to authenticated;
