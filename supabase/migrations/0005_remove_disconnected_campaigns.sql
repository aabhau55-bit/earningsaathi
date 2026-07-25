-- ============================================================================
-- Remove the disconnected "campaign" system (migration 0005)
-- This ONLY touches the platform dashboard's own Supabase project — nothing
-- here ever runs against PrizeUp's database. The campaigns/campaign_signups
-- tables modeled a marketing-link concept that PrizeUp's real app doesn't
-- have: real referral tracking already lives in PrizeUp's own `referrals` /
-- `profiles.referral_code` tables, which this dashboard now reads directly
-- instead. Everything below is dead code cleanup, not a live-data change.
-- ============================================================================

drop function if exists public.campaign_users(uuid);
drop function if exists public.campaign_stats();
drop function if exists public.list_creators();
drop function if exists public.admin_creators(uuid);
drop function if exists public.creator_stats_by_token(text, text);
drop function if exists public.provision_creator(text, text, text, text);
drop function if exists public.generate_campaign_token();
drop function if exists public.super_kpis(text);
drop function if exists public.signups_over_time(text, int);
drop function if exists public.signups_by_app();

drop table if exists public.campaign_signups;
drop table if exists public.campaigns;

-- list_admins loses its campaigns/signups columns — those concepts no
-- longer exist in this database at all. Return type changed, so drop first.
drop function if exists public.list_admins();

create or replace function public.list_admins()
returns table (admin_id uuid, email text, name text, app_slug text)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  return query
  select pu.id, pu.email, pu.name, a.slug
  from public.platform_users pu
  left join public.apps a on a.id = pu.app_id
  where pu.role = 'admin';
end;
$$;
