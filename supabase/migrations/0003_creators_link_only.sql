-- ============================================================================
-- Earning Saathi Dashboard — creators become link-only (migration 0003)
-- Creators never get a Supabase Auth account or password. A campaign's token
-- doubles as the creator's access: they visit /creator/<token>, type the
-- email the campaign was created under, and see read-only install counts —
-- no login, no session. super_admin and admin are unchanged (still full
-- email/password accounts). Both tables (platform_users, campaigns) are
-- still empty except the one super_admin row, so these are plain DDL
-- changes — no data migration needed.
-- ============================================================================

-- creators are never platform_users at all now
alter table public.platform_users drop constraint platform_users_role_check;
alter table public.platform_users add constraint platform_users_role_check
  check (role in ('super_admin', 'admin'));

-- RLS: drop the old policies FIRST — they reference creator_id, which blocks
-- dropping that column below. campaigns no longer has a creator_id = auth.uid()
-- case at all (creators never have a session) — just super_admin, or the
-- owning admin's own app.
drop policy if exists campaigns_select on public.campaigns;
create policy campaigns_select on public.campaigns for select
  using (public.is_super_admin() or app_id = public.current_app_id());

drop policy if exists campaigns_update on public.campaigns;
create policy campaigns_update on public.campaigns for update
  using (public.is_super_admin() or app_id = public.current_app_id())
  with check (public.is_super_admin() or app_id = public.current_app_id());

-- campaign creator identity is plain text now, not an account reference
alter table public.campaigns add column creator_name text not null default '';
alter table public.campaigns alter column creator_name drop default;
alter table public.campaigns drop column creator_id;

-- ---------------------------------------------------------------------------
-- New public RPC: the token + email together are the "credential" — no
-- session required. Granted to `anon` as well as `authenticated`.
-- ---------------------------------------------------------------------------

drop function if exists public.creator_stats();

create or replace function public.creator_stats_by_token(p_token text, p_email text)
returns table (
  campaign_id uuid, name text, app_slug text,
  last_hour bigint, last_day bigint, last_week bigint, last_month bigint, lifetime bigint
)
language plpgsql stable security definer set search_path = public as $$
declare v_campaign record;
begin
  select c.id, c.app_id into v_campaign
  from public.campaigns c
  where c.token = p_token and lower(c.creator_email) = lower(p_email);

  if v_campaign.id is null then
    raise exception 'no matching campaign';
  end if;

  return query
  select c.id, c.name, a.slug,
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 hour'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 day'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '7 days'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '30 days'),
         count(cs.id)
  from public.campaigns c
  join public.apps a on a.id = c.app_id
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where c.id = v_campaign.id
  group by c.id, a.slug;
end;
$$;

grant execute on function public.creator_stats_by_token(text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Creator identity queries now read directly off campaigns.creator_email /
-- creator_name — no more join through platform_users.
-- ---------------------------------------------------------------------------

create or replace function public.list_creators()
returns table (
  creator_email text, creator_name text,
  campaigns bigint, lifetime bigint, last_day bigint, last_week bigint
)
language sql stable security definer set search_path = public as $$
  select c.creator_email, c.creator_name,
         count(distinct c.id),
         count(cs.id),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 day'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '7 days')
  from public.campaigns c
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where c.app_id = public.current_app_id()
  group by c.creator_email, c.creator_name;
$$;

create or replace function public.admin_creators(p_admin_id uuid)
returns table (
  creator_email text, creator_name text, campaigns bigint,
  last_day bigint, last_week bigint, last_month bigint, lifetime bigint
)
language plpgsql stable security definer set search_path = public as $$
declare v_app_id uuid;
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  select app_id into v_app_id from public.platform_users where id = p_admin_id;

  return query
  select c.creator_email, c.creator_name,
         count(distinct c.id),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '1 day'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '7 days'),
         count(cs.id) filter (where cs.signed_up_at >= now() - interval '30 days'),
         count(cs.id)
  from public.campaigns c
  left join public.campaign_signups cs on cs.campaign_id = c.id
  where c.app_id = v_app_id
  group by c.creator_email, c.creator_name;
end;
$$;

create or replace function public.super_kpis(p_app_slug text default null)
returns table (
  total_users bigint, total_coins bigint, total_signups bigint,
  active_campaigns bigint, creators bigint, admins bigint
)
language plpgsql stable security definer set search_path = public as $$
declare v_app_id uuid;
begin
  if not public.is_super_admin() then raise exception 'not authorized'; end if;
  if p_app_slug is not null then select id into v_app_id from public.apps where slug = p_app_slug; end if;

  return query
  select
    (select count(distinct cs.external_user_id) from public.campaign_signups cs
       where v_app_id is null or cs.app_id = v_app_id),
    (select coalesce(sum(cs.coins), 0) from public.campaign_signups cs
       where v_app_id is null or cs.app_id = v_app_id),
    (select count(*) from public.campaign_signups cs
       where v_app_id is null or cs.app_id = v_app_id),
    (select count(*) from public.campaigns c where c.active and (v_app_id is null or c.app_id = v_app_id)),
    (select count(distinct c.creator_email) from public.campaigns c where v_app_id is null or c.app_id = v_app_id),
    (select count(*) from public.platform_users pu where pu.role = 'admin' and (v_app_id is null or pu.app_id = v_app_id));
end;
$$;

create or replace function public.campaign_users(p_campaign_id uuid)
returns table (external_user_id text, email text, coins bigint, app_slug text, signed_up_at timestamptz)
language plpgsql stable security definer set search_path = public as $$
declare v_campaign record;
begin
  select c.app_id into v_campaign from public.campaigns c where c.id = p_campaign_id;
  if v_campaign.app_id is null then raise exception 'not found'; end if;
  if not (public.is_super_admin() or v_campaign.app_id = public.current_app_id()) then
    raise exception 'not authorized';
  end if;

  return query
  select cs.external_user_id, cs.email, cs.coins, a.slug, cs.signed_up_at
  from public.campaign_signups cs
  join public.apps a on a.id = cs.app_id
  where cs.campaign_id = p_campaign_id
  order by cs.signed_up_at desc;
end;
$$;

-- ---------------------------------------------------------------------------
-- provision_creator: no auth account involved anymore — just creates the
-- campaign row directly. newly_created now means "this email had no prior
-- campaign" (informational only, since there's no account to distinguish).
-- ---------------------------------------------------------------------------

drop function if exists public.provision_creator(uuid, text, text, text, text);

create or replace function public.provision_creator(
  p_creator_email text, p_creator_name text, p_campaign_name text, p_app_slug text default null
)
returns table (token text, creator_email text, creator_name text, newly_created boolean)
language plpgsql security definer set search_path = public as $$
declare
  v_app_id uuid;
  v_is_new boolean;
  v_token text;
begin
  if p_app_slug is not null then
    select id into v_app_id from public.apps where slug = p_app_slug;
    if v_app_id is null then raise exception 'unknown app'; end if;
  else
    v_app_id := public.current_app_id();
  end if;
  if v_app_id is null then raise exception 'no app specified'; end if;

  if not (public.is_super_admin() or v_app_id = public.current_app_id()) then
    raise exception 'not authorized';
  end if;

  v_is_new := not exists (
    select 1 from public.campaigns where lower(creator_email) = lower(p_creator_email)
  );

  v_token := public.generate_campaign_token();

  insert into public.campaigns (app_id, creator_email, creator_name, name, token)
  values (v_app_id, p_creator_email, p_creator_name, p_campaign_name, v_token);

  return query select v_token, p_creator_email, p_creator_name, v_is_new;
end;
$$;

grant execute on function public.provision_creator(text, text, text, text) to authenticated;
