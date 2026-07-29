-- ============================================================================
-- Campaign lifecycle: pause / delete (migration 0012)
-- Adds a status to creator_campaigns bookkeeping. This NEVER touches
-- PrizeUp's own referral redirect (/i/<code>, public/i/index.html) — that's a
-- static page with no dependency on this table, so it keeps working
-- regardless of status. Only the /creator/<code> STATS page (this platform's
-- own read, in getCreatorStatsAction) respects status:
--   active  — live counts, as today.
--   paused  — creator can still view, but sees frozen_stats (a snapshot of
--             the real counts taken the moment it was paused) instead of a
--             live read, so the numbers stop moving without touching the
--             real referral data.
--   deleted — the creator's stats page is blocked entirely.
-- ============================================================================

alter table public.creator_campaigns
  add column status text not null default 'active'
    constraint creator_campaigns_status_check check (status in ('active', 'paused', 'deleted')),
  add column frozen_stats jsonb;
